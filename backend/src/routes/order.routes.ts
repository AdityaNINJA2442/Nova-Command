import { Router } from 'express';
import { orderController } from '../controllers/order.controller';

const router = Router();

router.get('/', (req, res, next) => orderController.getAll(req, res, next));
router.get('/:id', (req, res, next) => orderController.getById(req, res, next));
router.get('/:id/risk', (req, res, next) => orderController.getRisk(req, res, next));

export default router;
