import { machineRepository } from '../repositories/machine.repository';
import { consequenceEngineService } from './consequence.service';
import { VibrationAnomalyResult } from '../types';

export class MachineService {
  async getAllMachines() {
    return machineRepository.getAll();
  }

  async getMachineById(id: string) {
    const machine = await machineRepository.getById(id);
    if (!machine) {
      throw new Error(`Machine ${id} not found`);
    }
    return machine;
  }

  async updateMachineStatus(id: string, status: string) {
    const machine = await machineRepository.getById(id);
    if (!machine) {
      throw new Error(`Machine ${id} not found`);
    }

    let healthScore = machine.healthScore;
    let vibration = machine.vibration;
    let temperature = machine.temperature;

    if (status === 'maintenance') {
      healthScore = Math.min(healthScore, 50);
    } else if (status === 'running') {
      healthScore = 98;
      vibration = 1.75;
      temperature = 48.0;
    }

    const updated = await machineRepository.update(id, {
      status,
      healthScore,
      vibration,
      temperature,
    });

    await consequenceEngineService.propagate();
    return updated;
  }

  calculateAnomaly(currentVal: number, baseline: number): VibrationAnomalyResult {
    const deviationPct = ((currentVal - baseline) / baseline) * 100;
    const isExceeded = currentVal > baseline;
    return {
      currentVal,
      baseline,
      deviationPct: Number(deviationPct.toFixed(1)),
      isExceeded,
      status: isExceeded ? 'Abnormal Exceedance' : 'Nominal Toleranced Range',
      severity: currentVal > baseline * 1.4 ? 'critical' : currentVal > baseline ? 'warning' : 'nominal',
    };
  }

  async addTelemetryPoint(
    machineId: string,
    point: { timestamp: string; temperature: number; vibration: number; energy: number; rpm: number }
  ) {
    const machine = await machineRepository.getById(machineId);
    if (!machine) {
      throw new Error(`Machine ${machineId} not found`);
    }

    const telemetry = await machineRepository.addTelemetry(machineId, point);

    // Update current machine values
    const anomaly = this.calculateAnomaly(point.vibration, machine.vibrationThreshold);
    let newStatus = machine.status;
    let healthScore = machine.healthScore;

    if (anomaly.severity === 'critical') {
      newStatus = 'critical';
      healthScore = Math.min(healthScore, 50);
    } else if (anomaly.severity === 'warning') {
      newStatus = 'warning';
      healthScore = Math.min(healthScore, 65);
    }

    await machineRepository.update(machineId, {
      vibration: point.vibration,
      temperature: point.temperature,
      energy: point.energy,
      status: newStatus,
      healthScore,
    });

    await consequenceEngineService.propagate();
    return telemetry;
  }
}

export const machineService = new MachineService();
