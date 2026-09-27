import { Router } from 'express';
import { whatIfController } from '../controllers/whatif.controller';

const router = Router();

router.get('/scenarios', (req, res, next) => whatIfController.getScenarios(req, res, next));
router.post('/simulate', (req, res, next) => whatIfController.simulate(req, res, next));
router.post('/commit', (req, res, next) => whatIfController.commit(req, res, next));

export default router;
