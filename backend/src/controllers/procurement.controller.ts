import { Request, Response, NextFunction } from 'express';
import { procurementService } from '../services/procurement.service';

export class ProcurementController {
  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pos = await procurementService.getAllPurchaseOrders();
      res.json({
        success: true,
        data: pos,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const po = await procurementService.getPurchaseOrderById(req.params.id);
      res.json({
        success: true,
        data: po,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { supplier, itemId, quantity, unitPriceUsd, expectedDelivery, notes } = req.body;
      if (!supplier || !itemId || !quantity || !unitPriceUsd || !expectedDelivery) {
        res.status(400).json({ success: false, error: 'supplier, itemId, quantity, unitPriceUsd, and expectedDelivery are required' });
        return;
      }

      const created = await procurementService.createPurchaseOrder({
        supplier,
        itemId,
        quantity: Number(quantity),
        unitPriceUsd: Number(unitPriceUsd),
        expectedDelivery,
        notes,
      });

      res.status(201).json({
        success: true,
        data: created,
        message: `Purchase Requisition ${created.id} created successfully.`,
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
        res.status(400).json({ success: false, error: 'status is required' });
        return;
      }

      const updated = await procurementService.updatePurchaseOrderStatus(req.params.id, status);
      res.json({
        success: true,
        data: updated,
        message: status === 'delivered'
          ? `PO ${req.params.id} marked as DELIVERED. Goods receipt logged and stock updated.`
          : `PO ${req.params.id} status updated to ${status}.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export const procurementController = new ProcurementController();
