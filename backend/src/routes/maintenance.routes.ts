import { Router } from 'express';
import { maintenanceController } from '../controllers/maintenance.controller';

const router = Router();

router.get('/work-orders', (req, res, next) => maintenanceController.getAll(req, res, next));
router.get('/work-orders/:id', (req, res, next) => maintenanceController.getById(req, res, next));
router.post('/work-orders', (req, res, next) => maintenanceController.create(req, res, next));
router.post('/work-orders/:id/assign', (req, res, next) => maintenanceController.assign(req, res, next));
router.post('/work-orders/:id/start', (req, res, next) => maintenanceController.start(req, res, next));
router.post('/work-orders/:id/complete', (req, res, next) => maintenanceController.complete(req, res, next));

export default router;
