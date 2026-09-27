import { Router } from 'express';
import { decisionController } from '../controllers/decision.controller';

const router = Router();

router.get('/recommendations', (req, res, next) => decisionController.getAll(req, res, next));
router.get('/recommendations/:id', (req, res, next) => decisionController.getById(req, res, next));
router.patch('/recommendations/:id/status', (req, res, next) => decisionController.updateStatus(req, res, next));

export default router;
