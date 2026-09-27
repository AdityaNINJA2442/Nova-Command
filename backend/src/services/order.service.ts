import { orderRepository } from '../repositories/order.repository';
import { machineRepository } from '../repositories/machine.repository';
import { operationRepository } from '../repositories/operation.repository';
import { OrderRiskScoreResult } from '../types';

export class OrderService {
  async getAllOrders() {
    return orderRepository.getAll();
  }

  async getOrderById(id: string) {
    const order = await orderRepository.getById(id);
    if (!order) {
      throw new Error(`Order ${id} not found`);
    }
    return order;
  }

  async calculateRisk(orderId: string): Promise<OrderRiskScoreResult> {
    const order = await orderRepository.getById(orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    let machine;
    let operation;

    if (order.currentOperationId) {
      operation = await operationRepository.getById(order.currentOperationId);
      if (operation?.machineId) {
        machine = await machineRepository.getById(operation.machineId);
      }
    }

    let score = 0;
    const factors: string[] = [];

    if (
      machine &&
      (machine.status === 'warning' || machine.status === 'critical' || machine.status === 'maintenance')
    ) {
      score += 45;
      factors.push(`Machine ${machine.id} status is ${machine.status.toUpperCase()}`);
    }

    if (operation && operation.delayHours > 0) {
      score += Math.min(40, operation.delayHours * 7);
      factors.push(`Operation ${operation.id} delayed by ${operation.delayHours}h`);
    }

    if (order.materialReadiness === 'partial') {
      score += 20;
      factors.push('Raw material safety buffer below threshold');
    } else if (order.materialReadiness === 'blocked') {
      score += 45;
      factors.push('Raw material stockout blocked');
    }

    return {
      score: Math.min(100, Math.round(score)),
      level: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low',
      factors,
    };
  }
}

export const orderService = new OrderService();
