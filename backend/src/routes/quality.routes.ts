import { Router } from 'express';
import { qualityController } from '../controllers/quality.controller';

const router = Router();

router.get('/inspections', (req, res, next) => qualityController.getAll(req, res, next));
router.get('/inspections/:id', (req, res, next) => qualityController.getById(req, res, next));
router.post('/inspections', (req, res, next) => qualityController.create(req, res, next));

export default router;
