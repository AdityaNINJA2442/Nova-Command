import { Router } from 'express';
import { systemController } from '../controllers/system.controller';

const router = Router();

router.get('/status', (req, res, next) => systemController.getStatus(req, res, next));
router.get('/health', (req, res, next) => systemController.getHealth(req, res, next));
router.post('/reset', (req, res, next) => systemController.resetData(req, res, next));

export default router;
