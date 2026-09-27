import { Request, Response, NextFunction } from 'express';
import { machineService } from '../services/machine.service';

export class MachineController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const machines = await machineService.getAllMachines();
      res.json({
        success: true,
        data: machines,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const machine = await machineService.getMachineById(req.params.id);
      res.json({
        success: true,
        data: machine,
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
        res.status(400).json({ success: false, error: 'Status is required' });
        return;
      }
      const updated = await machineService.updateMachineStatus(req.params.id, status);
      res.json({
        success: true,
        data: updated,
        message: `Machine ${req.params.id} status updated to ${status}. Consequence cascade recalculated.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async addTelemetry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { temperature, vibration, energy, rpm } = req.body;
      if (vibration === undefined || temperature === undefined) {
        res.status(400).json({ success: false, error: 'vibration and temperature are required' });
        return;
      }
      const point = {
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        temperature: Number(temperature),
        vibration: Number(vibration),
        energy: Number(energy || 40),
        rpm: Number(rpm || 15000),
      };
      const telemetry = await machineService.addTelemetryPoint(req.params.id, point);
      res.status(201).json({
        success: true,
        data: telemetry,
        message: 'Telemetry point ingested and anomaly evaluated.',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAnomaly(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const machine = await machineService.getMachineById(req.params.id);
      const anomaly = machineService.calculateAnomaly(machine.vibration, machine.vibrationThreshold);
      res.json({
        success: true,
        data: anomaly,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const machineController = new MachineController();
