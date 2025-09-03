import { Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { TeamConfigService } from '../services/TeamConfigService.js';
import { AuthenticatedRequest } from '../requests/AuthenticatedRequest.js';

const exportConfig = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const teamId = new ObjectId(req.params.teamId);
        const config = await TeamConfigService.exportConfig(teamId);
        return res.json(config);
    } catch (error) {
        return next(error);
    }
};

const applyConfig = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const configId = new ObjectId(req.body.configId);
        const targetTeamId = new ObjectId(req.body.teamId);
        await TeamConfigService.applyConfig(configId, targetTeamId);
        return res.json({ success: true });
    } catch (error) {
        return next(error);
    }
};

const listConfigs = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const configs = await TeamConfigService.listConfigs();
        return res.json(configs);
    } catch (error) {
        return next(error);
    }
};

const deleteConfig = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const configId = new ObjectId(req.params.configId);
        const userTeamId = new ObjectId(req.jwt.team._id);
        
        await TeamConfigService.deleteConfig(configId, userTeamId);
        return res.json({ success: true });
    } catch (error) {
        return next(error);
    }
};

export const TeamConfigController = {
    exportConfig,
    applyConfig,
    listConfigs,
    deleteConfig,
};
