import { prisma } from '../utils/prisma';

export class OperationRepository {
  async getAll() {
    return prisma.operation.findMany({
      include: {
        machine: true,
        order: true,
      },
    });
  }

  async getById(id: string) {
    return prisma.operation.findUnique({
      where: { id },
      include: {
        machine: true,
        order: true,
      },
    });
  }

  async update(id: string, data: {
    machineId?: string;
    status?: string;
    delayHours?: number;
    delayReason?: string | null;
    progressPct?: number;
    actualStart?: string | null;
  }) {
    return prisma.operation.update({
      where: { id },
      data,
    });
  }
}

export const operationRepository = new OperationRepository();
