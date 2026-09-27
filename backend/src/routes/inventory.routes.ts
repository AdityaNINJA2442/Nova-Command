import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';

const router = Router();

router.get('/', (req, res, next) => inventoryController.getAll(req, res, next));
router.get('/transactions', (req, res, next) => inventoryController.getAllTransactions(req, res, next));
router.get('/:id', (req, res, next) => inventoryController.getById(req, res, next));
router.post('/transactions', (req, res, next) => inventoryController.recordTransaction(req, res, next));

export default router;
