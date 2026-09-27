import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';

export class InventoryController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await inventoryService.getAllItems();
      res.json({
        success: true,
        data: items,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await inventoryService.getItemById(req.params.id);
      res.json({
        success: true,
        data: item,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const txs = await inventoryService.getAllTransactions();
      res.json({
        success: true,
        data: txs,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async recordTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId, type, quantity, referenceType, referenceId, performedBy, notes } = req.body;
      if (!itemId || !type || quantity === undefined) {
        res.status(400).json({ success: false, error: 'itemId, type, and quantity are required' });
        return;
      }

      const result = await inventoryService.recordTransaction({
        itemId,
        type,
        quantity: Number(quantity),
        referenceType,
        referenceId,
        performedBy,
        notes,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: `Inventory transaction logged: ${type.toUpperCase()} of ${quantity} for ${result.item.name}.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
