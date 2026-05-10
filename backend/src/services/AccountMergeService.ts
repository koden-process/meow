import { ObjectId } from 'mongodb';
import { Account, AccountStatus, Reference } from '../entities/Account.js';
import { NewAccountEvent } from '../entities/AccountEvent.js';
import { Card } from '../entities/Card.js';
import { SchemaReferenceAttribute, SchemaType } from '../entities/Schema.js';
import { User } from '../entities/User.js';
import { EventType } from '../entities/EventType.js';
import { InvalidRequestError } from '../errors/InvalidRequestError.js';
import { DatabaseHelper } from '../helpers/DatabaseHelper.js';
import { EntityHelper } from '../helpers/EntityHelper.js';
import { SchemaHelper } from '../helpers/SchemaHelper.js';

export interface AccountMergeSummary {
  updatedCards: number;
  updatedAccounts: number;
  updatedUsers: number;
  movedAccountEvents: number;
  targetReferences: number;
}

export interface AccountMergeResult {
  targetAccount: Account;
  sourceAccount: Account;
  summary: AccountMergeSummary;
}

const toAccountIdString = (value: unknown): string | null => {
  if (value instanceof ObjectId) {
    return value.toString();
  }

  if (typeof value === 'string' && EntityHelper.isValidEntityId(value)) {
    return value;
  }

  return null;
};

const getAccountReferenceAttributes = async (
  teamId: ObjectId,
  type: SchemaType
): Promise<SchemaReferenceAttribute[]> => {
  const schema = await EntityHelper.findSchemaByType(teamId, type);

  return SchemaHelper.getSchemaReferenceAttributes(schema?.attributes).filter(
    (attribute) => attribute.entity === SchemaType.Account
  );
};

const replaceReferencesInCollection = async (
  collectionName: 'Accounts' | 'Cards',
  teamId: ObjectId,
  referenceAttributes: SchemaReferenceAttribute[],
  sourceAccountId: ObjectId,
  targetAccountId: ObjectId
): Promise<number> => {
  const collection = DatabaseHelper.getCollection(collectionName);
  let updated = 0;

  for (const attribute of referenceAttributes) {
    const field = `attributes.${attribute.key}`;
    const result = await collection.updateMany(
      {
        teamId,
        $or: [{ [field]: sourceAccountId.toString() }, { [field]: sourceAccountId }],
      },
      {
        $set: {
          [field]: targetAccountId.toString(),
          updatedAt: new Date(),
        },
      }
    );

    updated += result.modifiedCount;
  }

  return updated;
};

const replaceFavoriteAccounts = async (
  teamId: ObjectId,
  sourceAccountId: ObjectId,
  targetAccountId: ObjectId
): Promise<number> => {
  const usersCollection = DatabaseHelper.getCollection('Users');
  const users = await usersCollection
    .find({ teamId, favoriteAccounts: { $exists: true } })
    .toArray();
  let updated = 0;

  for (const user of users) {
    const favoriteAccounts = Array.isArray(user.favoriteAccounts) ? user.favoriteAccounts : [];
    const next = Array.from(
      new Map(
        favoriteAccounts.map((favoriteAccount: ObjectId | string) => {
          const id = toAccountIdString(favoriteAccount);
          const nextId = id === sourceAccountId.toString() ? targetAccountId : favoriteAccount;

          return [nextId.toString(), nextId];
        })
      ).values()
    );

    if (
      next.length !== favoriteAccounts.length ||
      next.some((favoriteAccount, index) => favoriteAccount.toString() !== favoriteAccounts[index].toString())
    ) {
      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            favoriteAccounts: next,
            updatedAt: new Date(),
          },
        }
      );
      updated += 1;
    }
  }

  return updated;
};

const moveAccountEvents = async (
  teamId: ObjectId,
  sourceAccountId: ObjectId,
  targetAccountId: ObjectId
): Promise<number> => {
  const eventsCollection = DatabaseHelper.getCollection('Events');
  const result = await eventsCollection.updateMany(
    {
      teamId,
      accountId: sourceAccountId,
    },
    {
      $set: {
        accountId: targetAccountId,
        updatedAt: new Date(),
      },
    }
  );

  return result.modifiedCount;
};

const findCardReferencesToAccount = async (
  teamId: ObjectId,
  targetAccountId: ObjectId,
  cardReferenceAttributes: SchemaReferenceAttribute[]
): Promise<Reference[]> => {
  if (cardReferenceAttributes.length === 0) {
    return [];
  }

  const cardsCollection = DatabaseHelper.getCollection('Cards');
  const cards = await cardsCollection
    .find({ teamId })
    .project<{ _id: ObjectId; attributes?: Card['attributes'] }>({ _id: 1, attributes: 1 })
    .toArray();
  const references = new Map<string, Reference>();

  for (const card of cards) {
    for (const attribute of cardReferenceAttributes) {
      const value = card.attributes?.[attribute.key];

      if (toAccountIdString(value) !== targetAccountId.toString()) {
        continue;
      }

      const key = `${card._id.toString()}:${attribute.key}`;
      references.set(key, {
        _id: card._id,
        entity: attribute.entity,
        schemaAttributeKey: attribute.key,
      });
    }
  }

  return Array.from(references.values());
};

const updateReverseReferences = async (
  teamId: ObjectId,
  sourceAccountId: ObjectId,
  targetAccountId: ObjectId,
  cardReferenceAttributes: SchemaReferenceAttribute[]
): Promise<number> => {
  const accountsCollection = DatabaseHelper.getCollection('Accounts');
  const targetReferences = await findCardReferencesToAccount(
    teamId,
    targetAccountId,
    cardReferenceAttributes
  );

  await accountsCollection.updateOne(
    { _id: targetAccountId, teamId },
    {
      $set: {
        references: targetReferences,
        updatedAt: new Date(),
      },
    }
  );

  await accountsCollection.updateOne(
    { _id: sourceAccountId, teamId },
    {
      $set: {
        references: [],
        status: AccountStatus.Deleted,
        updatedAt: new Date(),
      },
    }
  );

  return targetReferences.length;
};

const assertMergeIsAllowed = (targetAccount: Account, sourceAccount: Account): void => {
  if (targetAccount._id.toString() === sourceAccount._id.toString()) {
    throw new InvalidRequestError('Cannot merge a contact into itself');
  }

  if (targetAccount.status === AccountStatus.Deleted) {
    throw new InvalidRequestError('Cannot keep a deleted contact as merge target');
  }

  if (sourceAccount.status === AccountStatus.Deleted) {
    throw new InvalidRequestError('Cannot merge a contact that is already deleted');
  }
};

const merge = async (
  user: User,
  targetAccount: Account,
  sourceAccount: Account
): Promise<AccountMergeResult> => {
  assertMergeIsAllowed(targetAccount, sourceAccount);

  const teamId = user.teamId;
  const cardReferenceAttributes = await getAccountReferenceAttributes(teamId, SchemaType.Card);
  const accountReferenceAttributes = await getAccountReferenceAttributes(teamId, SchemaType.Account);

  const updatedCards = await replaceReferencesInCollection(
    'Cards',
    teamId,
    cardReferenceAttributes,
    sourceAccount._id,
    targetAccount._id
  );
  const updatedAccounts = await replaceReferencesInCollection(
    'Accounts',
    teamId,
    accountReferenceAttributes,
    sourceAccount._id,
    targetAccount._id
  );
  const updatedUsers = await replaceFavoriteAccounts(teamId, sourceAccount._id, targetAccount._id);
  const movedAccountEvents = await moveAccountEvents(teamId, sourceAccount._id, targetAccount._id);
  const targetReferences = await updateReverseReferences(
    teamId,
    sourceAccount._id,
    targetAccount._id,
    cardReferenceAttributes
  );

  await EntityHelper.create(
    new NewAccountEvent(targetAccount, user, EventType.CommentCreated, {
      text: `Contact fusionné: ${sourceAccount.name}`,
    })
  );

  return {
    targetAccount: await EntityHelper.findOneByIdOrFail(Account, targetAccount._id),
    sourceAccount: await EntityHelper.findOneByIdOrFail(Account, sourceAccount._id),
    summary: {
      updatedCards,
      updatedAccounts,
      updatedUsers,
      movedAccountEvents,
      targetReferences,
    },
  };
};

export const AccountMergeService = {
  merge,
};
