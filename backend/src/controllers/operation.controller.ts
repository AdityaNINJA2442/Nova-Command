import { Request, Response, NextFunction } from 'express';
import { operationService } from '../services/operation.service';

export class OperationController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ops = await operationService.getAllOperations();
      res.json({
        success: true,
        data: ops,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const op = await operationService.getOperationById(req.params.id);
      res.json({
        success: true,
        data: op,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async reroute(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { targetMachineId } = req.body;
      if (!targetMachineId) {
        res.status(400).json({ success: false, error: 'targetMachineId is required' });
        return;
      }

      const updated = await operationService.rerouteOperation(req.params.id, targetMachineId);
      res.json({
        success: true,
        data: updated,
        message: `Operation ${req.params.id} rerouted to machine ${targetMachineId}. Schedule delays cleared.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const operationController = new OperationController();
