import { describe, expect, it } from 'vitest';
import { Account } from '../interfaces/Account';
import { Card, CardStatus } from '../interfaces/Card';
import {
  Schema,
  SchemaAttributeType,
  SchemaType,
} from '../interfaces/Schema';
import { CurrencyCode, Team } from '../interfaces/Team';
import { UserStatus } from '../interfaces/User';
import {
  buildOpportunityExportContext,
  OpportunitySheetExportParams,
} from './OpportunityExportContext';

const card: Card = {
  _id: 'opportunity-1',
  name: 'Renouvellement & extension',
  teamId: 'team-1',
  userId: 'user-1',
  amount: 0,
  laneId: 'lane-1',
  inLaneSince: '2026-01-01T00:00:00.000Z',
  status: CardStatus.Active,
  attributes: {
    text: 'Texte',
    zero: 0,
    textarea: '',
    select: 'Option A',
    boolean: false,
    reference: 'account-1',
    unknownReference: 'missing-account',
    email: 'contact@example.com',
    link: null,
  },
  closedAt: '2026-02-10T00:00:00.000Z',
  nextFollowUpAt: '2026-02-05T00:00:00.000Z',
  createdAt: '2026-01-02T03:04:05.000Z',
  updatedAt: '2026-01-03T04:05:06.000Z',
};

const schema: Schema = {
  type: SchemaType.Card,
  attributes: [
    { key: 'boolean', index: 5, name: 'Actif', type: SchemaAttributeType.Boolean },
    { key: 'text', index: 1, name: 'Texte', type: SchemaAttributeType.Text },
    { key: 'zero', index: 2, name: 'Valeur nulle', type: SchemaAttributeType.Text },
    {
      key: 'unknownReference',
      index: 7,
      name: 'Référence inconnue',
      type: SchemaAttributeType.Reference,
      entity: SchemaType.Account,
      reverseName: 'Opportunités',
      relationship: 'many-to-one',
    },
    { key: 'textarea', index: 3, name: 'Notes', type: SchemaAttributeType.TextArea },
    {
      key: 'select',
      index: 4,
      name: 'Choix',
      type: SchemaAttributeType.Select,
      options: ['Option A'],
    },
    {
      key: 'reference',
      index: 6,
      name: 'Contact',
      type: SchemaAttributeType.Reference,
      entity: SchemaType.Account,
      reverseName: 'Opportunités',
      relationship: 'many-to-one',
    },
    { key: 'email', index: 8, name: 'Email', type: SchemaAttributeType.Email },
    { key: 'link', index: 9, name: 'Lien', type: SchemaAttributeType.Link },
  ],
};

const accounts: Account[] = [
  {
    _id: 'account-1',
    name: 'Compte résolu',
    attributes: undefined,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

const team: Team = {
  _id: 'team-1',
  name: 'Équipe Nord',
  currency: CurrencyCode.EUR,
  integrations: [],
};

const params: OpportunitySheetExportParams = {
  card,
  schema,
  accounts,
  lane: {
    _id: 'lane-1',
    name: 'Qualification',
    index: 2,
    inForecast: true,
  },
  owner: {
    _id: 'user-1',
    name: 'Camille',
    teamId: 'team-1',
    authentication: 'local',
    status: UserStatus.Enabled,
  },
  team,
  amountLabel: 'Montant',
  currency: CurrencyCode.EUR,
};

const buildContext = () =>
  buildOpportunityExportContext(params, {
    generatedAt: new Date('2026-06-28T08:30:00.000Z'),
    locale: 'fr-FR',
  });

describe('buildOpportunityExportContext', () => {
  it('builds the versioned generic opportunity context', () => {
    const context = buildContext();

    expect(context.version).toBe('1');
    expect(context.locale).toBe('fr-FR');
    expect(context.generatedAt.iso).toBe('2026-06-28T08:30:00.000Z');
    expect(context.opportunity).toMatchObject({
      id: 'opportunity-1',
      name: 'Renouvellement & extension',
      status: 'active',
      amount: {
        raw: 0,
        label: 'Montant',
        unit: 'EUR',
      },
    });
    expect(context.opportunity.amount.display).toContain('0');
    expect(context.owner).toEqual({ id: 'user-1', name: 'Camille' });
    expect(context.lane).toEqual({
      id: 'lane-1',
      name: 'Qualification',
      index: 2,
    });
    expect(context.team).toEqual({
      id: 'team-1',
      name: 'Équipe Nord',
      currency: 'EUR',
    });
  });

  it('preserves schema order and every supported value shape', () => {
    const context = buildContext();

    expect(context.attributes.map(({ key }) => key)).toEqual([
      'text',
      'zero',
      'textarea',
      'select',
      'boolean',
      'reference',
      'unknownReference',
      'email',
      'link',
    ]);
    expect(context.attributesByKey.text.rawValue).toBe('Texte');
    expect(context.attributesByKey.zero.rawValue).toBe(0);
    expect(context.attributesByKey.zero.displayValue).toBe('0');
    expect(context.attributesByKey.textarea.rawValue).toBe('');
    expect(context.attributesByKey.boolean.rawValue).toBe(false);
    expect(context.attributesByKey.boolean.displayValue).toBe('Non');
    expect(context.attributesByKey.link.rawValue).toBeNull();
    expect(context.attributesByKey.link.displayValue).toBe('');
  });

  it('resolves known references and handles unknown references without throwing', () => {
    const context = buildContext();

    expect(context.attributesByKey.reference).toMatchObject({
      referenceId: 'account-1',
      referenceName: 'Compte résolu',
      displayValue: 'Compte résolu',
    });
    expect(context.attributesByKey.unknownReference).toMatchObject({
      referenceId: 'missing-account',
      displayValue: 'Contact introuvable',
    });
    expect(context.attributesByKey.unknownReference.referenceName).toBeUndefined();
  });

  it('exposes ISO and localized display dates', () => {
    const context = buildContext();

    expect(context.opportunity.createdAt.iso).toBe('2026-01-02T03:04:05.000Z');
    expect(context.opportunity.createdAt.display).not.toBe(
      context.opportunity.createdAt.iso
    );
    expect(context.opportunity.closedAt?.iso).toBe('2026-02-10T00:00:00.000Z');
    expect(context.opportunity.nextFollowUpAt?.display).toBeTruthy();
  });
});
