import { prisma } from '../utils/prisma';

export class MachineRepository {
  async getAll() {
    return prisma.machine.findMany({
      include: {
        telemetryHistory: {
          orderBy: { id: 'asc' },
        },
      },
    });
  }

  async getById(id: string) {
    return prisma.machine.findUnique({
      where: { id },
      include: {
        telemetryHistory: {
          orderBy: { id: 'asc' },
        },
        operations: true,
        workOrders: true,
      },
    });
  }

  async update(id: string, data: {
    status?: string;
    healthScore?: number;
    utilization?: number;
    temperature?: number;
    vibration?: number;
    energy?: number;
    criticalIssue?: string | null;
    activeWorkOrderId?: string | null;
    currentOperationId?: string | null;
  }) {
    return prisma.machine.update({
      where: { id },
      data,
    });
  }

  async addTelemetry(machineId: string, point: {
    timestamp: string;
    temperature: number;
    vibration: number;
    energy: number;
    rpm: number;
  }) {
    return prisma.machineTelemetry.create({
      data: {
        machineId,
        ...point,
      },
    });
  }
}

export const machineRepository = new MachineRepository();
