import { Response, NextFunction } from 'express';
import { CurrencyCode, Team } from '../entities/Team.js';
import { InvalidRequestBodyError } from '../errors/InvalidRequestBodyError.js';
import { EntityHelper } from '../helpers/EntityHelper.js';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest.js';
import { validateAndFetchTeam } from '../helpers/EntityFetchHelper.js';
import { InvalidRequestError } from '../errors/InvalidRequestError.js';

const parseCurrencyCode = (value: string): CurrencyCode => {
    console.log('Parsing currency code:', value);
    if (value in CurrencyCode) {
        return value as CurrencyCode;
    }
    throw new InvalidRequestBodyError('invalid currency code');
};

const update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    console.log('Updating team - Full request body:', JSON.stringify(req.body, null, 2));
    console.log('Currency received:', req.body.currency);
    console.log('CustomLabels received:', req.body.customLabels);
    try {
        const team = await validateAndFetchTeam(req.params.id, req.jwt.user);

        team.currency = parseCurrencyCode(req.body.currency);

        if (req.body.customLabels !== undefined) {
            // Clean up null values - if opportunityAmount is null, remove the property
            if (req.body.customLabels.opportunityAmount === null) {
                if (!team.customLabels) {
                    team.customLabels = {};
                }
                delete team.customLabels.opportunityAmount;
                // If customLabels is now empty, remove it entirely
                if (Object.keys(team.customLabels).length === 0) {
                    delete team.customLabels;
                }
            } else {
                team.customLabels = req.body.customLabels;
            }
        }

        const updated = await EntityHelper.update(team);

        return res.json(updated);
    } catch (error) {
        console.error('Error updating team:', error);
        return next(error);
    }
};

const updateIntegration = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const team = await validateAndFetchTeam(req.params.id, req.jwt.user);

        const integrations = team.integrations ?? [];

        const updatedIntegrations = integrations.filter(
            (integration) => integration.key !== req.body.key
        );

        updatedIntegrations.push(req.body);

        team.integrations = updatedIntegrations;

        const updated = await EntityHelper.update(team);

        return res.json(updated);
    } catch (error) {
        return next(error);
    }
};

const allowTeamRegistration = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        let team = await validateAndFetchTeam(req.params.id, req.jwt.user);

        if (team.isFirstTeam !== true) {
            throw new InvalidRequestError();
        }

        let flag = await EntityHelper.findOrCreateGlobalFlagByName('allow-team-registration');

        flag.value = req.body.allowTeamRegistration === true;

        flag = await EntityHelper.update(flag);

        delete team.isFirstTeam;

        team = await EntityHelper.update(team);

        return res.json(team);
    } catch (error) {
        return next(error);
    }
};

const list = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // Get all teams except the current user's team for transfer purposes
        const teams = await EntityHelper.findBy(Team, {
            _id: { $ne: req.jwt.user.teamId }
        });

        return res.json(teams);
    } catch (error) {
        return next(error);
    }
};

const get = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const team = await validateAndFetchTeam(req.params.id, req.jwt.user);

        return res.json(team);
    } catch (error) {
        return next(error);
    }
};

export const TeamController = {
    update,
    allowTeamRegistration,
    updateIntegration,
    list,
    get,
};
