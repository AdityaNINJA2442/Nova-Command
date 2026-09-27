import { inventoryRepository } from '../repositories/inventory.repository';
import { consequenceEngineService } from './consequence.service';
import { CreateInventoryTransactionInput } from '../types';

export class InventoryService {
  async getAllItems() {
    return inventoryRepository.getAll();
  }

  async getItemById(id: string) {
    const item = await inventoryRepository.getById(id);
    if (!item) {
      throw new Error(`Inventory item ${id} not found`);
    }
    return item;
  }

  async getAllTransactions() {
    return inventoryRepository.getAllTransactions();
  }

  async recordTransaction(input: CreateInventoryTransactionInput) {
    const result = await inventoryRepository.recordTransaction(input);
    await consequenceEngineService.propagate();
    return result;
  }
}

export const inventoryService = new InventoryService();
