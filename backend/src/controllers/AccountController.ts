import { Response, NextFunction } from 'express';
import { Account } from '../entities/Account.js';
import { EntityHelper } from '../helpers/EntityHelper.js';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest.js';
import { datasource } from '../helpers/DatabaseHelper.js';

const create = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const account = new Account(req.jwt.team.id!.toString(), req.body.name);

    if (req.body.attributes) {
      account.attributes = req.body.attributes;
    }

    const updated = await datasource.manager.save(account);

    return res.json(updated);
  } catch (error) {
    return next(error);
  }
};

const update = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (req.params.id) {
      const account = await EntityHelper.findOneById(
        req.jwt.user,
        Account,
        req.params.id
      );

      account.name = req.body.name;

      if (req.body.attributes) {
        account.attributes = req.body.attributes;
      }

      const updated = await datasource.manager.save(account);

      return res.json(updated);
    }
  } catch (error) {
    return next(error);
  }
};

const list = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const cards = await EntityHelper.findByTeam(Account, req.jwt.team);

    return res.json(cards);
  } catch (error) {
    return next(error);
  }
};

export const AccountController = {
  update,
  create,
  list,
};
