import { whatIfRepository } from '../repositories/whatif.repository';
import { operationRepository } from '../repositories/operation.repository';
import { machineRepository } from '../repositories/machine.repository';
import { decisionRepository } from '../repositories/decision.repository';
import { systemRepository } from '../repositories/system.repository';
import { consequenceEngineService } from './consequence.service';
import { WhatIfSimulationInput } from '../types';

export class WhatIfService {
  async getActiveScenario() {
    const scenario = await whatIfRepository.getActiveScenario();
    if (!scenario) {
      throw new Error('No active What-If scenario found');
    }

    return {
      ...scenario,
      parameters: JSON.parse(scenario.parametersJson),
      currentMetrics: JSON.parse(scenario.currentMetricsJson),
      simulatedMetrics: JSON.parse(scenario.simulatedMetricsJson),
      impactChain: JSON.parse(scenario.impactChainJson),
      consequences: JSON.parse(scenario.consequencesJson),
    };
  }

  async simulate(params: WhatIfSimulationInput) {
    const scenario = await this.getActiveScenario();
    const mergedParams = { ...scenario.parameters, ...params };

    const willReroute = mergedParams.rerouteToMachineId === 'M-006';
    const baseline = scenario.currentMetrics;

    const simulatedMetrics = {
      productionOutputUnits: willReroute ? 492 : 410,
      oeePct: willReroute ? 89.4 : 72.1,
      activeOrders: 8,
      ordersAtRisk: willReroute ? 0 : 3,
      machineAvailabilityPct: willReroute ? 96.0 : 75.0,
      estimatedDowntimeHours: willReroute ? 6.5 : 18.0,
      laborOvertimeCostUsd: willReroute ? 1400 : 8600,
      totalCostUsd: willReroute ? 49800 : 96200,
      onTimeDeliveryPct: willReroute ? 100.0 : 62.5,
    };

    const consequences = {
      affectedOperations: willReroute ? ['OP-27', 'OP-28'] : ['OP-27', 'OP-28', 'OP-35'],
      affectedOrders: willReroute ? ['ORDER-1042', 'ORDER-1048'] : ['ORDER-1042', 'ORDER-1048', 'ORDER-1040'],
      costDeltaUsd: simulatedMetrics.totalCostUsd - baseline.totalCostUsd,
      delayDeltaHours: willReroute ? -5.5 : +8.0,
      oeeDeltaPct: Number((simulatedMetrics.oeePct - baseline.oeePct).toFixed(1)),
    };

    const updated = await whatIfRepository.updateScenario('SCENARIO-01', {
      parametersJson: JSON.stringify(mergedParams),
      simulatedMetricsJson: JSON.stringify(simulatedMetrics),
      consequencesJson: JSON.stringify(consequences),
    });

    return {
      ...updated,
      parameters: mergedParams,
      currentMetrics: baseline,
      simulatedMetrics,
      consequences,
      impactChain: scenario.impactChain,
    };
  }

  async commitPlan() {
    // 1. Reroute OP-27 to M-006
    const op27 = await operationRepository.getById('OP-27');
    if (op27) {
      await operationRepository.update('OP-27', {
        machineId: 'M-006',
        status: 'in_progress',
        delayHours: 0,
        delayReason: null,
      });
    }

    // 2. Set M-004 into maintenance
    await machineRepository.update('M-004', {
      status: 'maintenance',
      criticalIssue: 'Offline: Scheduled 6.5h spindle bearing overhaul in progress.',
    });

    // 3. Set M-006 standby into active running
    await machineRepository.update('M-006', {
      utilization: 84,
      currentOperationId: 'OP-27',
    });

    // 4. Update recommendation REC-01
    const rec1 = await decisionRepository.getById('REC-01');
    if (rec1) {
      await decisionRepository.updateStatus('REC-01', 'applied');
    }

    // 5. Increment committedPlanVersion
    const state = await systemRepository.getSystemState();
    const newVersion = state.committedPlanVersion + 1;
    await systemRepository.updateSystemState({
      committedPlanVersion: newVersion,
    });

    // 6. Propagate consequences
    await consequenceEngineService.propagate();

    return {
      committedPlanVersion: newVersion,
      status: 'COMMITTED',
      message: `Proposed Plan Version #${newVersion} COMMITTED by Operations Director. Schedule rerouted.`,
    };
  }
}

export const whatIfService = new WhatIfService();
