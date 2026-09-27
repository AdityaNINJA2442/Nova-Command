import { maintenanceRepository } from '../repositories/maintenance.repository';
import { consequenceEngineService } from './consequence.service';
import { CreateWorkOrderInput } from '../types';

export class MaintenanceService {
  async getAllWorkOrders() {
    return maintenanceRepository.getAll();
  }

  async getWorkOrderById(id: string) {
    const wo = await maintenanceRepository.getById(id);
    if (!wo) {
      throw new Error(`Work order ${id} not found`);
    }
    return wo;
  }

  async createWorkOrder(input: CreateWorkOrderInput) {
    const created = await maintenanceRepository.createWorkOrder(input);
    await consequenceEngineService.propagate();
    return created;
  }

  async assignTechnician(workOrderId: string, employeeId: string) {
    const updated = await maintenanceRepository.assignTechnician(workOrderId, employeeId);
    await consequenceEngineService.propagate();
    return updated;
  }

  async startWorkOrder(workOrderId: string) {
    const updated = await maintenanceRepository.startWorkOrder(workOrderId);
    await consequenceEngineService.propagate();
    return updated;
  }

  async completeWorkOrder(workOrderId: string) {
    const updated = await maintenanceRepository.completeWorkOrder(workOrderId);
    await consequenceEngineService.propagate();
    return updated;
  }
}

export const maintenanceService = new MaintenanceService();
