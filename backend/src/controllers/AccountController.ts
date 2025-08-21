import { Response, NextFunction } from 'express';
import { Account, NewAccount, AccountStatus } from '../entities/Account.js';
import { EntityHelper } from '../helpers/EntityHelper.js';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest.js';
import { EventHelper } from '../helpers/EventHelper.js';
import { validateAndFetchAccount } from '../helpers/EntityFetchHelper.js';
import { InvalidCardPropertyError } from '../errors/InvalidCardPropertyError.js';

const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const account = new NewAccount(req.jwt.team, req.body.name);

        if (req.body.attributes) {
            account.attributes = req.body.attributes;
        }

        const latest = await EntityHelper.create(account, Account);

        EventHelper.get().emit('account', { user: req.jwt.user, latest: latest.toPlain() });

        return res.status(201).json(latest);
    } catch (error) {
        return next(error);
    }
};

function parseAccountStatus(value: unknown): AccountStatus {
    switch (value) {
        case 'active':
            return AccountStatus.Active;
        case 'deleted':
            return AccountStatus.Deleted;
        default:
            throw new InvalidCardPropertyError(`Unsupported status value: ${value}`);
    }
}

const update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        let account = await validateAndFetchAccount(req.params.id, req.jwt.user);

        const previous = account.toPlain();

        account.name = req.body.name;

        if (req.body.attributes) {
            account.attributes = req.body.attributes;
        }

        if (req.body.status) {
            account.status = parseAccountStatus(req.body.status);
        }

        const latest = await EntityHelper.update(account);

        // TODO rename account to original
        EventHelper.get().emit('account', {
            user: req.jwt.user,
            latest: latest.toPlain(),
            previous: previous,
        });

        return res.json(latest);
    } catch (error) {
        return next(error);
    }
};

const list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const query: any = {
            teamId: { $eq: req.jwt.team._id! },
            $or: [
                { status: { $ne: AccountStatus.Deleted } },
                { status: { $exists: false } } // Include accounts without status field (existing accounts)
            ]
        };

        const accounts = await EntityHelper.findBy(Account, query);

        return res.json(accounts);
    } catch (error) {
        return next(error);
    }
};

const fetch = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const account = await validateAndFetchAccount(req.params.id, req.jwt.user);

        return res.json(account);
    } catch (error) {
        return next(error);
    }
};

export const AccountController = {
    update,
    create,
    list,
    fetch,
};
