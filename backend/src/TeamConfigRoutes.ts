import { Router } from 'express';
import express from 'express';
// @ts-ignore
import { TeamConfigController } from './controllers/TeamConfigController.js';
// @ts-ignore
import { verifyJwt } from './middlewares/verifyJwt.js';
// @ts-ignore
import { addEntityToHeader } from './middlewares/addEntityToHeader.js';
// @ts-ignore
import { rejectIfContentTypeIsNot } from './middlewares/rejectIfContentTypeIsNot.js';

const router = Router();

// Ajouter le middleware JSON parsing
router.use(express.json({ limit: '5kb' }));

router.post('/team-config/export/:teamId', verifyJwt, addEntityToHeader, TeamConfigController.exportConfig);
router.post('/team-config/apply', rejectIfContentTypeIsNot('application/json'), verifyJwt, addEntityToHeader, TeamConfigController.applyConfig);
router.get('/team-config/list', verifyJwt, addEntityToHeader, TeamConfigController.listConfigs);
router.delete('/team-config/:configId', verifyJwt, addEntityToHeader, TeamConfigController.deleteConfig);

export default router;
