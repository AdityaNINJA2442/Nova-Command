import { Request, Response, NextFunction } from 'express';
import { whatIfService } from '../services/whatif.service';

export class WhatIfController {
  async getScenarios(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const scenario = await whatIfService.getActiveScenario();
      res.json({
        success: true,
        data: scenario,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async simulate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await whatIfService.simulate(req.body);
      res.json({
        success: true,
        data: result,
        message: 'What-If Simulation calculated: Current Plan vs Proposed Plan ready for review.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async commit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await whatIfService.commitPlan();
      res.json({
        success: true,
        data: result,
        message: result.message,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const whatIfController = new WhatIfController();
