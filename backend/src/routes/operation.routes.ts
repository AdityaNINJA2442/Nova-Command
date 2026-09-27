import { Router } from 'express';
import { operationController } from '../controllers/operation.controller';

const router = Router();

router.get('/', (req, res, next) => operationController.getAll(req, res, next));
router.get('/:id', (req, res, next) => operationController.getById(req, res, next));
router.patch('/:id/reroute', (req, res, next) => operationController.reroute(req, res, next));

export default router;
