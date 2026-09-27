import { operationRepository } from '../repositories/operation.repository';
import { machineRepository } from '../repositories/machine.repository';
import { consequenceEngineService } from './consequence.service';

export class OperationService {
  async getAllOperations() {
    return operationRepository.getAll();
  }

  async getOperationById(id: string) {
    const op = await operationRepository.getById(id);
    if (!op) {
      throw new Error(`Operation ${id} not found`);
    }
    return op;
  }

  async rerouteOperation(operationId: string, targetMachineId: string) {
    const op = await operationRepository.getById(operationId);
    if (!op) {
      throw new Error(`Operation ${operationId} not found`);
    }

    const targetMachine = await machineRepository.getById(targetMachineId);
    if (!targetMachine) {
      throw new Error(`Target machine ${targetMachineId} not found`);
    }

    // Update operation
    const updated = await operationRepository.update(operationId, {
      machineId: targetMachineId,
      status: 'in_progress',
      delayHours: 0,
      delayReason: null,
    });

    // Update target machine
    await machineRepository.update(targetMachineId, {
      utilization: 82,
      currentOperationId: op.id,
    });

    // Propagate consequences across schedule & orders
    await consequenceEngineService.propagate();

    return updated;
  }
}

export const operationService = new OperationService();
