import { procurementRepository } from '../repositories/procurement.repository';
import { consequenceEngineService } from './consequence.service';

export class ProcurementService {
  async getAllPurchaseOrders() {
    return procurementRepository.getAll();
  }

  async getPurchaseOrderById(id: string) {
    const po = await procurementRepository.getById(id);
    if (!po) {
      throw new Error(`Purchase order ${id} not found`);
    }
    return po;
  }

  async updatePurchaseOrderStatus(id: string, status: string) {
    const updated = await procurementRepository.updateStatus(id, status);
    await consequenceEngineService.propagate();
    return updated;
  }

  async createPurchaseOrder(data: {
    supplier: string;
    itemId: string;
    quantity: number;
    unitPriceUsd: number;
    expectedDelivery: string;
    notes?: string;
  }) {
    return procurementRepository.createPurchaseOrder(data);
  }
}

export const procurementService = new ProcurementService();
