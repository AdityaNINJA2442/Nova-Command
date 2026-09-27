import { Request, Response, NextFunction } from 'express';
import { decisionService } from '../services/decision.service';

export class DecisionController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const recs = await decisionService.getAllRecommendations();
      res.json({
        success: true,
        data: recs,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rec = await decisionService.getRecommendationById(req.params.id);
      res.json({
        success: true,
        data: rec,
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

      const updated = await decisionService.updateStatus(req.params.id, status);
      res.json({
        success: true,
        data: updated,
        message: `Recommendation ${req.params.id} status updated to ${status}.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const decisionController = new DecisionController();
