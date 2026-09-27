import { Request, Response, NextFunction } from 'express';
import { systemRepository } from '../repositories/system.repository';

export class SystemController {
  async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = await systemRepository.getSystemState();
      const stats = await systemRepository.getHealthStats();

      res.json({
        success: true,
        data: {
          plantStatus: 'Nominal Operations with Line 2 Amber Advisory',
          activeShift: state.plantShift,
          plantTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
          lastUpdated: state.lastUpdated,
          dataSource: 'Simulated Industrial Telemetry Engine (Vibration, Temp, Power, OEE)',
          environment: process.env.NODE_ENV || 'development',
          committedPlanVersion: state.committedPlanVersion,
          demoStep: state.demoStep,
          selectedMachineId: state.selectedMachineId,
          selectedOrderId: state.selectedOrderId,
          databaseStats: stats,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getHealth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await systemRepository.getHealthStats();
      res.json({
        success: true,
        status: 'UP',
        uptime: process.uptime(),
        database: 'Connected',
        stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async resetData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const state = await systemRepository.resetToSeed();
      const stats = await systemRepository.getHealthStats();

      res.json({
        success: true,
        message: 'NOVA Command database successfully reset to initial demo seed state.',
        data: {
          systemState: state,
          stats,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const systemController = new SystemController();
