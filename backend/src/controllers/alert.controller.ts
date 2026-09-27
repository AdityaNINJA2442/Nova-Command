import { Request, Response, NextFunction } from 'express';
import { alertService } from '../services/alert.service';

export class AlertController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alerts = await alertService.getAllAlerts();
      res.json({
        success: true,
        data: alerts,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const alert = await alertService.getAlertById(req.params.id);
      res.json({
        success: true,
        data: alert,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      if (!status) {
        res.status(400).json({ success: false, error: 'status is required' });
        return;
      }

      const updated = await alertService.updateAlertStatus(req.params.id, status);
      res.json({
        success: true,
        data: updated,
        message: `Alert ${req.params.id} marked as ${status.toUpperCase()}.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const alertController = new AlertController();
