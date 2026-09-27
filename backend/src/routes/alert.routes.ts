import { Router } from 'express';
import { alertController } from '../controllers/alert.controller';

const router = Router();

router.get('/', (req, res, next) => alertController.getAll(req, res, next));
router.get('/:id', (req, res, next) => alertController.getById(req, res, next));
router.patch('/:id/status', (req, res, next) => alertController.updateStatus(req, res, next));

export default router;
