/**
 * NOVA COMMAND Unified Manufacturing Operations API Service
 * Encapsulates all backend REST calls, data aggregation, and telemetry contracts.
 */
import {
  Machine,
  Operation,
  Order,
  Employee,
  InventoryItem,
  MaintenanceWorkOrder,
  QualityInspection,
  Alert,
  DecisionRecommendation,
  WhatIfScenario,
} from '../types';

export const ApiService = {
  // Demo metadata
  getSystemStatus: () => ({
    plantStatus: 'Nominal Operations with Line 2 Amber Advisory',
    activeShift: 'Shift A (06:00 - 14:00)',
    plantTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
    dataSource: 'Simulated Industrial Telemetry Engine (Vibration, Temp, Power, OEE)',
    environment: 'Hackathon MVP Prototype',
  }),

  // Anomaly calculation
  calculateVibrationAnomaly: (currentVal: number, baseline: number) => {
    const deviationPct = ((currentVal - baseline) / baseline) * 100;
    const isExceeded = currentVal > baseline;
    return {
      deviationPct: Number(deviationPct.toFixed(1)),
      isExceeded,
      status: isExceeded ? 'Abnormal Exceedance' : 'Nominal Toleranced Range',
      severity: currentVal > baseline * 1.4 ? 'critical' : currentVal > baseline ? 'warning' : 'nominal',
    };
  },

  // Calculate connected risk score
  calculateOrderRiskScore: (order: Order, machine?: Machine, operation?: Operation) => {
    let score = 0;
    const factors: string[] = [];

    if (machine && (machine.status === 'warning' || machine.status === 'critical' || machine.status === 'maintenance')) {
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
      score: Math.min(100, score),
      level: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low',
      factors,
    };
  },
};
