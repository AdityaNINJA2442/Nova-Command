import { prisma } from '../utils/prisma';

export class OrderRepository {
  async getAll() {
    return prisma.order.findMany({
      include: {
        operations: true,
      },
    });
  }

  async getById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        operations: {
          include: { machine: true },
        },
      },
    });
  }

  async update(id: string, data: {
    status?: string;
    materialReadiness?: string;
    machineReadiness?: string;
    deliveryRisk?: string;
    riskReasons?: string;
    currentOperationId?: string | null;
  }) {
    return prisma.order.update({
      where: { id },
      data,
    });
  }
}

export const orderRepository = new OrderRepository();
