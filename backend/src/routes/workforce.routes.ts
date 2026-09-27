import { Router } from 'express';
import { workforceController } from '../controllers/workforce.controller';

const router = Router();

// Employee roster
router.get('/employees', (req, res, next) => workforceController.getAllEmployees(req, res, next));
router.get('/employees/:id', (req, res, next) => workforceController.getEmployeeById(req, res, next));

// Users & roles
router.get('/users', (req, res, next) => workforceController.getAllUsers(req, res, next));
router.post('/users', (req, res, next) => workforceController.createUser(req, res, next));
router.patch('/users/:id/role', (req, res, next) => workforceController.updateUserRole(req, res, next));

export default router;
