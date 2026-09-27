export interface SystemStatusResponse {
  plantStatus: string;
  activeShift: string;
  plantTime: string;
  lastUpdated: string;
  dataSource: string;
  environment: string;
  committedPlanVersion: number;
  demoStep: number;
  selectedMachineId: string;
  selectedOrderId: string;
  databaseStats: {
    machineCount: number;
    orderCount: number;
    inventoryCount: number;
    employeeCount: number;
    alertCount: number;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface VibrationAnomalyResult {
  currentVal: number;
  baseline: number;
  deviationPct: number;
  isExceeded: boolean;
  status: string;
  severity: 'nominal' | 'warning' | 'critical';
}

export interface OrderRiskScoreResult {
  score: number;
  level: 'low' | 'medium' | 'high';
  factors: string[];
}

export interface CreateWorkOrderInput {
  machineId: string;
  issue: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  type?: 'corrective' | 'preventive';
  technicianId?: string;
  requiredSkill?: string;
  sparePartIds?: string[];
  estimatedDurationHours?: number;
  notes?: string;
}

export interface CreateInventoryTransactionInput {
  itemId: string;
  type: 'receipt' | 'issue' | 'reservation' | 'adjustment';
  quantity: number;
  referenceType?: 'work_order' | 'purchase_order' | 'production_order' | 'manual';
  referenceId?: string;
  performedBy?: string;
  notes?: string;
}

export interface CreateQualityInspectionInput {
  machineId: string;
  line?: string;
  batchId?: string;
  productId?: string;
  productName?: string;
  inspectedUnits: number;
  defectUnits: number;
  defects?: { type: string; count: number }[];
  correctiveActionId?: string;
}

export interface WhatIfSimulationInput {
  machineId?: string;
  downtimeHours?: number;
  rerouteToMachineId?: string;
  expediteSparePart?: boolean;
  urgentOrderId?: string;
  delayedSupplierItemId?: string;
  supplierDelayDays?: number;
}
