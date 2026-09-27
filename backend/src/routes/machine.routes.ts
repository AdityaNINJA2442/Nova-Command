import { Router } from 'express';
import { machineController } from '../controllers/machine.controller';

const router = Router();

router.get('/', (req, res, next) => machineController.getAll(req, res, next));
router.get('/:id', (req, res, next) => machineController.getById(req, res, next));
router.get('/:id/anomaly', (req, res, next) => machineController.getAnomaly(req, res, next));
router.patch('/:id/status', (req, res, next) => machineController.updateStatus(req, res, next));
router.post('/:id/telemetry', (req, res, next) => machineController.addTelemetry(req, res, next));

export default router;
