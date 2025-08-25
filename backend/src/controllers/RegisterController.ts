import { NextFunction, Request, Response } from 'express';
import { DateTime } from 'luxon';
import { PasswordAuthenticationProvider } from '../authentication/PasswordAuthenticationProvider.js';
import {
  DefaultCardSchema,
  DefaultAccountSchema,
  DefaultLanes,
  DefaultCards,
  DefaultAccounts,
} from '../Constants.js';
import { Card, NewCard } from '../entities/Card.js';
import { Lane, NewLane } from '../entities/Lane.js';
import { NewSchema } from '../entities/Schema.js';
import { NewAccount } from '../entities/Account.js';
import { CurrencyCode, NewTeam, Team } from '../entities/Team.js';
import { NewUser, User, UserAuthentication, UserStatus } from '../entities/User.js';
import { EntityNotFoundError } from '../errors/EntityNotFoundError.js';
import { InvalidRequestBodyError } from '../errors/InvalidRequestBodyError.js';
import { InvalidRequestParameterError } from '../errors/InvalidRequestParameterError.js';
import { EntityHelper } from '../helpers/EntityHelper.js';
import { isValidName, isValidPassword } from './RegisterControllerValidator.js';
import { Board, NewBoard } from '../entities/Board.js';
import { emitBoardEvent, emitCardEvent, emitLaneEvent } from '../helpers/EventHelper.js';
import { log } from '../worker.js';
import { InvalidRequestError } from '../errors/InvalidRequestError.js';
import {keyword$DataError} from "ajv/dist/compile/errors.js";

export const setupUserWithInvite = async (invite: string, authentication: UserAuthentication) => {
  const user = await EntityHelper.findUserByInvite(invite);

  if (!user) {
    throw new EntityNotFoundError();
  }

  user.authentication = authentication;

  user.invite = null;
  user.status = UserStatus.Enabled;

  return await EntityHelper.update(user);
};

export const setupAccountWithExampleData = async (
  authentication: UserAuthentication,
  firstName: string,
  lastName: string,
  name: string,
): Promise<User> => {
  const isFirstTeam = await EntityHelper.isFirstTeam();

  const team = await EntityHelper.create(
    new NewTeam(`${name}'s Team`, CurrencyCode.USD, isFirstTeam),
    Team
  );
  const board = await EntityHelper.create(new NewBoard(team, 'default'), Board);

  const lanes: Lane[] = [];

  for (const [index, item] of DefaultLanes.entries()) {
    const lane = await EntityHelper.create(
      new NewLane(team, board, item.name, index, item.color, item.inForecast, item.tags),
      Lane
    );

    lanes.push(lane!);
  }

  await EntityHelper.create(new NewSchema(team, DefaultCardSchema.type, DefaultCardSchema.schema));
  await EntityHelper.create(
    new NewSchema(team, DefaultAccountSchema.type, DefaultAccountSchema.schema)
  );

  const user = await EntityHelper.create(new NewUser(team, name, firstName, lastName, UserStatus.Enabled), User);

  if (firstName) {
    user.firstName = firstName;
  }
  if (lastName) {
    user.lastName = lastName;
  }

  await Promise.all(
    DefaultCards.map(async (item, index) => {
      const laneIndex = index < 4 ? index : 0;

      const tomorrow = DateTime.utc()
        .plus({ days: 1 })
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      const oneWeekFromNow = DateTime.utc()
        .plus({ days: 7 })
        .set({ hour: 0, minute: 0, second: 0, millisecond: 0 });

      let card = new NewCard(user, lanes[laneIndex]!, item.name, item.amount);

      card.closedAt = oneWeekFromNow.toJSDate();
      card.nextFollowUpAt = tomorrow.toJSDate();

      const updated = await EntityHelper.create(card, Card);

      emitCardEvent(user, updated!.toPlain());
    })
  );

  /* emit a lane event for each lane to calculate statistic values */
  lanes.forEach((lane) => {
    emitLaneEvent(lane._id, user._id);
  });

  emitBoardEvent(board._id, user._id);

  await Promise.all(
    DefaultAccounts.map(async (item, index) => {
      await EntityHelper.create(new NewAccount(team, item.name));
    })
  );

  user.authentication = authentication;

  const updated = await EntityHelper.update(user);

  return updated;
};

const invite = async (req: Request, res: Response, next: NextFunction) => {
  log.debug(`get user by invite: ${req.query.invite}`);

  try {
    if (!req.query.invite || req.query.invite.toString().length !== 8) {
      throw new InvalidRequestParameterError();
    }

    const user = await EntityHelper.findUserByInvite(req.query.invite.toString());

    if (!user) {
      throw new EntityNotFoundError();
    }

    res.json({ name: user.name });
  } catch (error) {
    next(error);
  }
};

const status = async (req: Request, res: Response, next: NextFunction) => {
  const payload: { allowTeamRegistration: boolean } = { allowTeamRegistration: true };

  try {
    const flag = await EntityHelper.findGlobalFlagByName('allow-team-registration');

    if (flag && flag.value === false) {
      payload.allowTeamRegistration = false;
    }

    res.status(201).json(payload);
  } catch (error) {
    next(error);
  }
};

const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flag = await EntityHelper.findGlobalFlagByName('allow-team-registration');

    if (flag && flag.value === false) {
      throw new InvalidRequestError('team registration is disabled');
    }

    const password = req.body.password;

    await isValidPassword(password);

    const authentication: UserAuthentication = {
      local: {
        password: await new PasswordAuthenticationProvider().create(password),
      },
    };

    if (req.body.invite) {
      if (req.body.invite.length !== 8) {
        throw new InvalidRequestBodyError();
      }

      await setupUserWithInvite(req.body.invite, authentication);

      return res.json({ welcome: true });
    }

    // Support either legacy { name } or new { firstName, lastName }
    let name: string | undefined = req.body.name ? String(req.body.name).trim() : undefined;
    const firstName: string = String(req.body.firstName).trim()
    const lastName: string = String(req.body.lastName).trim()

    if (!name && firstName && lastName) {
      name = `${firstName} ${lastName}`.trim();
    }

    if (!name) {
      throw new InvalidRequestBodyError();
    }

    await isValidName(name);

    await setupAccountWithExampleData(authentication, firstName, lastName, name);

    res.status(201).json({ welcome: true });
  } catch (error) {
    next(error);
  }
};

export const RegisterController = {
  register,
  status,
  invite,
};
