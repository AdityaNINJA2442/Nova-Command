import { Request, Response, NextFunction } from 'express';
import { workforceService } from '../services/workforce.service';

export class WorkforceController {
  async getAllEmployees(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const emps = await workforceService.getAllEmployees();
      res.json({
        success: true,
        data: emps,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const emp = await workforceService.getEmployeeById(req.params.id);
      res.json({
        success: true,
        data: emp,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await workforceService.getAllUsers();
      res.json({
        success: true,
        data: users,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, name, email, role, title, initials, department, avatarBg, description } = req.body;
      if (!name || !email || !role) {
        res.status(400).json({ success: false, error: 'name, email, and role are required' });
        return;
      }

      const created = await workforceService.createUser({
        id: id || `user-${Date.now()}`,
        name,
        email,
        role,
        title: title || 'Staff Member',
        initials: initials || name.substring(0, 2).toUpperCase(),
        department: department || 'Operations',
        avatarBg: avatarBg || 'bg-blue-600 text-white',
        description: description || 'User account in NOVA Command',
      });

      res.status(201).json({
        success: true,
        data: created,
        message: `User ${name} created successfully.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { role } = req.body;
      if (!role) {
        res.status(400).json({ success: false, error: 'role is required' });
        return;
      }

      const updated = await workforceService.updateUserRole(req.params.id, role);
      res.json({
        success: true,
        data: updated,
        message: `User role updated to ${role}.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workforceController = new WorkforceController();
