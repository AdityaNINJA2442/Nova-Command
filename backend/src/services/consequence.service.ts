import { prisma } from '../utils/prisma';

export class ConsequenceEngineService {
  /**
   * Recalculates connected consequences across the entire manufacturing graph:
   * Telemetry/Anomaly -> Machine State -> Affected Operations -> Delays -> Order Delivery Risks -> Inventory Risks
   */
  async propagate(): Promise<void> {
    const m4 = await prisma.machine.findUnique({ where: { id: 'M-004' } });
    const m6 = await prisma.machine.findUnique({ where: { id: 'M-006' } });
    const op27 = await prisma.operation.findUnique({ where: { id: 'OP-27' } });
    const op28 = await prisma.operation.findUnique({ where: { id: 'OP-28' } });

    // Check if OP-27 has been rerouted to M-006
    const isReroutedToM6 = op27?.machineId === 'M-006';

    if (isReroutedToM6) {
      // OP-27 is successfully rerouted to Standby M-006
      if (op27) {
        await prisma.operation.update({
          where: { id: 'OP-27' },
          data: {
            status: 'in_progress',
            delayHours: 0,
            delayReason: null,
          },
        });
      }

      if (op28) {
        await prisma.operation.update({
          where: { id: 'OP-28' },
          data: {
            status: 'scheduled',
            delayHours: 0,
            delayReason: null,
          },
        });
      }

      if (m6) {
        await prisma.machine.update({
          where: { id: 'M-006' },
          data: {
            utilization: 78,
            currentOperationId: 'OP-27',
          },
        });
      }

      // Order ORDER-1042 restored
      await prisma.order.update({
        where: { id: 'ORDER-1042' },
        data: {
          machineReadiness: 'ready',
          deliveryRisk: 'low',
          riskReasons: JSON.stringify([
            'Mitigated: Operation OP-27 rerouted to Standby Cell M-006.',
            'Production cycle restored with +3.5h margin before delivery window.',
          ]),
        },
      });

      // Order ORDER-1048 restored
      await prisma.order.update({
        where: { id: 'ORDER-1048' },
        data: {
          machineReadiness: 'ready',
          deliveryRisk: 'low',
          riskReasons: JSON.stringify([
            'Schedule recovered. Standby cell absorbing balancing capacity.',
          ]),
        },
      });

      // Resolve alert AL-102
      const al102 = await prisma.alert.findUnique({ where: { id: 'AL-102' } });
      if (al102) {
        await prisma.alert.update({
          where: { id: 'AL-102' },
          data: { status: 'resolved' },
        });
      }
    } else if (
      m4 &&
      (m4.status === 'warning' || m4.status === 'critical' || m4.status === 'maintenance')
    ) {
      // M-004 has an issue / offline in maintenance and is not rerouted
      const isMaintenance = m4.status === 'maintenance';

      if (op27) {
        await prisma.operation.update({
          where: { id: 'OP-27' },
          data: {
            status: isMaintenance ? 'blocked' : 'delayed',
            delayHours: isMaintenance ? 6.5 : 5.5,
            delayReason: isMaintenance
              ? 'Machine M-004 taken offline for corrective spindle bearing overhaul (WO-204).'
              : 'Machine M-004 vibration excessive (4.85 mm/s). Feed rate throttled by 60%.',
          },
        });
      }

      if (op28) {
        await prisma.operation.update({
          where: { id: 'OP-28' },
          data: {
            status: 'delayed',
            delayHours: 6.0,
            delayReason: 'Cascading delay: Queued directly behind OP-27 on M-004.',
          },
        });
      }

      await prisma.order.update({
        where: { id: 'ORDER-1042' },
        data: {
          machineReadiness: isMaintenance ? 'blocked' : 'at_risk',
          deliveryRisk: 'high',
          riskReasons: JSON.stringify([
            `Machine M-004 ${isMaintenance ? 'offline in maintenance' : 'vibration anomaly'} throttled OP-27 by ${isMaintenance ? '6.5' : '5.5'}h`,
            'Contractual delivery buffer breached: Delivery penalty of ₹18,500/day triggered if not rerouted',
            'Quality inspection QI-404 flagged surface chatter Ra > 0.8µm',
          ]),
        },
      });

      await prisma.order.update({
        where: { id: 'ORDER-1048' },
        data: {
          machineReadiness: 'at_risk',
          deliveryRisk: 'high',
          riskReasons: JSON.stringify([
            'Dependent operation OP-28 cascade delayed on M-004.',
          ]),
        },
      });
    }

    // Recalculate inventory stockout risk
    const items = await prisma.inventoryItem.findMany();
    for (const item of items) {
      const available = Math.max(0, item.onHand - item.reserved);
      let stockoutRisk = 'low';
      if (available <= 0 || available <= item.reorderPoint) {
        stockoutRisk = 'high';
      } else if (available <= item.reorderPoint * 1.5) {
        stockoutRisk = 'medium';
      }

      await prisma.inventoryItem.update({
        where: { id: item.id },
        data: { available, stockoutRisk },
      });
    }

    // Update system lastUpdated
    await prisma.systemState.update({
      where: { id: 'singleton' },
      data: {
        lastUpdated: `Telemetry Engine Cycle - ${new Date().toLocaleTimeString('en-US')}`,
      },
    });
  }
}

export const consequenceEngineService = new ConsequenceEngineService();
