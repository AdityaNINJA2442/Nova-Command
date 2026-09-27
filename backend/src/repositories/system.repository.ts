import { prisma } from '../utils/prisma';
import { seedDatabase } from '../../prisma/seed';

export class SystemRepository {
  async getSystemState() {
    let state = await prisma.systemState.findUnique({
      where: { id: 'singleton' },
    });

    if (!state) {
      state = await prisma.systemState.create({
        data: {
          id: 'singleton',
          committedPlanVersion: 1,
          plantShift: 'Shift A (06:00 - 14:00)',
          plantTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
          lastUpdated: 'Simulated Telemetry Stream (Active)',
          demoStep: 1,
          selectedMachineId: 'M-004',
          selectedOrderId: 'ORDER-1042',
        },
      });
    }

    return state;
  }

  async updateSystemState(data: {
    committedPlanVersion?: number;
    plantShift?: string;
    plantTime?: string;
    lastUpdated?: string;
    demoStep?: number;
    selectedMachineId?: string;
    selectedOrderId?: string;
  }) {
    return prisma.systemState.upsert({
      where: { id: 'singleton' },
      update: data,
      create: {
        id: 'singleton',
        ...data,
      },
    });
  }

  async resetToSeed() {
    await seedDatabase();
    return this.getSystemState();
  }

  async getHealthStats() {
    const [machineCount, orderCount, inventoryCount, employeeCount, alertCount] = await Promise.all([
      prisma.machine.count(),
      prisma.order.count(),
      prisma.inventoryItem.count(),
      prisma.employee.count(),
      prisma.alert.count(),
    ]);

    return {
      machineCount,
      orderCount,
      inventoryCount,
      employeeCount,
      alertCount,
    };
  }
}

export const systemRepository = new SystemRepository();
