import { useState, useEffect } from 'react';
import {
  Machine,
  Operation,
  Order,
  Employee,
  InventoryItem,
  InventoryTransaction,
  PurchaseOrder,
  MaintenanceWorkOrder,
  QualityInspection,
  Alert,
  DecisionRecommendation,
  WhatIfScenario,
  ScenarioMetrics,
} from '../types';
import {
  initialMachines,
  initialOperations,
  initialOrders,
  initialEmployees,
  initialInventory,
  initialTransactions,
  initialPurchaseOrders,
  initialWorkOrders,
  initialQualityInspections,
  initialAlerts,
  initialRecommendations,
  initialWhatIfScenario,
} from '../data/initialData';
import { AppUser, UserRole, DEMO_USERS } from '../types/auth';

export interface StoreState {
  machines: Machine[];
  operations: Operation[];
  orders: Order[];
  employees: Employee[];
  inventory: InventoryItem[];
  inventoryTransactions: InventoryTransaction[];
  purchaseOrders: PurchaseOrder[];
  workOrders: MaintenanceWorkOrder[];
  qualityInspections: QualityInspection[];
  alerts: Alert[];
  recommendations: DecisionRecommendation[];
  whatIfScenario: WhatIfScenario;
  committedPlanVersion: number;
  plantShift: string;
  plantTime: string;
  lastUpdated: string;
  demoStep: number;
  selectedMachineId: string;
  selectedOrderId: string;
  activeTab: string;
  toastMessage: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null;
  users: AppUser[];
  currentUser: AppUser;
}

// Global in-memory singleton
let globalState: StoreState = {
  machines: JSON.parse(JSON.stringify(initialMachines)),
  operations: JSON.parse(JSON.stringify(initialOperations)),
  orders: JSON.parse(JSON.stringify(initialOrders)),
  employees: JSON.parse(JSON.stringify(initialEmployees)),
  inventory: JSON.parse(JSON.stringify(initialInventory)),
  inventoryTransactions: JSON.parse(JSON.stringify(initialTransactions)),
  purchaseOrders: JSON.parse(JSON.stringify(initialPurchaseOrders)),
  workOrders: JSON.parse(JSON.stringify(initialWorkOrders)),
  qualityInspections: JSON.parse(JSON.stringify(initialQualityInspections)),
  alerts: JSON.parse(JSON.stringify(initialAlerts)),
  recommendations: JSON.parse(JSON.stringify(initialRecommendations)),
  whatIfScenario: JSON.parse(JSON.stringify(initialWhatIfScenario)),
  committedPlanVersion: 1,
  plantShift: 'Shift A (06:00 - 14:00)',
  plantTime: '13:42:15',
  lastUpdated: 'Just now (Simulated Telemetry Stream)',
  demoStep: 1,
  selectedMachineId: 'M-004',
  selectedOrderId: 'ORDER-1042',
  activeTab: 'command-center',
  toastMessage: null,
  users: JSON.parse(JSON.stringify(DEMO_USERS)),
  currentUser: JSON.parse(JSON.stringify(DEMO_USERS[0])),
};

const listeners = new Set<(state: StoreState) => void>();

function notify() {
  const stateCopy = { ...globalState };
  listeners.forEach((listener) => listener(stateCopy));
}

// Recompute connected consequences across the entire manufacturing graph
export function propagateConsequences() {
  const m4 = globalState.machines.find((m) => m.id === 'M-004');
  const m6 = globalState.machines.find((m) => m.id === 'M-006');
  const op27 = globalState.operations.find((op) => op.id === 'OP-27');
  const op28 = globalState.operations.find((op) => op.id === 'OP-28');
  const order1042 = globalState.orders.find((o) => o.id === 'ORDER-1042');
  const order1048 = globalState.orders.find((o) => o.id === 'ORDER-1048');

  // Check if OP-27 has been rerouted to M-006
  const isReroutedToM6 = op27?.machineId === 'M-006';

  if (isReroutedToM6) {
    // OP-27 is successfully rerouted
    if (op27) {
      op27.status = 'in_progress';
      op27.delayHours = 0;
      op27.delayReason = undefined;
    }
    if (op28) {
      op28.status = 'scheduled';
      op28.delayHours = 0;
      op28.delayReason = undefined;
    }
    if (m6) {
      m6.utilization = 78;
      m6.currentOperationId = 'OP-27';
    }
    if (order1042) {
      order1042.machineReadiness = 'ready';
      order1042.deliveryRisk = 'low';
      order1042.riskReasons = [
        'Mitigated: Operation OP-27 rerouted to Standby Cell M-006.',
        'Production cycle restored with +3.5h margin before delivery window.',
      ];
    }
    if (order1048) {
      order1048.machineReadiness = 'ready';
      order1048.deliveryRisk = 'low';
      order1048.riskReasons = ['Schedule recovered. Standby cell absorbing balancing capacity.'];
    }
    // Update alert AL-102
    const al102 = globalState.alerts.find((a) => a.id === 'AL-102');
    if (al102) {
      al102.status = 'resolved';
    }
  } else if (m4 && (m4.status === 'warning' || m4.status === 'critical' || m4.status === 'maintenance')) {
    // M-004 has issue and is not rerouted
    const isMaintenance = m4.status === 'maintenance';
    if (op27) {
      op27.status = isMaintenance ? 'blocked' : 'delayed';
      op27.delayHours = isMaintenance ? 6.5 : 5.5;
      op27.delayReason = isMaintenance
        ? 'Machine M-004 taken offline for corrective spindle bearing overhaul (WO-204).'
        : 'Machine M-004 vibration excessive (4.85 mm/s). Feed rate throttled by 60%.';
    }
    if (op28) {
      op28.status = 'delayed';
      op28.delayHours = 6.0;
      op28.delayReason = 'Cascading delay: Queued directly behind OP-27 on M-004.';
    }
    if (order1042) {
      order1042.machineReadiness = isMaintenance ? 'blocked' : 'at_risk';
      order1042.deliveryRisk = 'high';
      order1042.riskReasons = [
        `Machine M-004 ${isMaintenance ? 'offline in maintenance' : 'vibration anomaly'} throttled OP-27 by ${op27?.delayHours || 5.5}h`,
        'Contractual delivery buffer breached: Delivery penalty of ₹18,500/day triggered if not rerouted',
        'Quality inspection QI-404 flagged surface chatter Ra > 0.8µm',
      ];
    }
    if (order1048) {
      order1048.machineReadiness = 'at_risk';
      order1048.deliveryRisk = 'high';
      order1048.riskReasons = ['Dependent operation OP-28 cascade delayed on M-004.'];
    }
  }

  // Update Inventory stockout risk for SP-104 and MAT-021
  globalState.inventory.forEach((item) => {
    item.available = Math.max(0, item.onHand - item.reserved);
    if (item.available <= 0) {
      item.stockoutRisk = 'high';
    } else if (item.available <= item.reorderPoint) {
      item.stockoutRisk = 'high';
    } else if (item.available <= item.reorderPoint * 1.5) {
      item.stockoutRisk = 'medium';
    } else {
      item.stockoutRisk = 'low';
    }
  });

  // Calculate What-If simulated delta
  const ordersAtRiskCount = globalState.orders.filter((o) => o.deliveryRisk === 'high').length;
  globalState.whatIfScenario.currentMetrics.ordersAtRisk = ordersAtRiskCount;
  globalState.whatIfScenario.currentMetrics.machineAvailabilityPct = Number(
    ((globalState.machines.filter((m) => m.status === 'running').length / globalState.machines.length) * 100).toFixed(1)
  );

  notify();
}

export function useManufacturingStore() {
  const [state, setState] = useState<StoreState>(globalState);

  useEffect(() => {
    const handler = (newState: StoreState) => setState(newState);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    ...state,
    setActiveTab: (tab: string) => {
      globalState.activeTab = tab;
      notify();
    },
    setSelectedMachineId: (id: string) => {
      globalState.selectedMachineId = id;
      notify();
    },
    setSelectedOrderId: (id: string) => {
      globalState.selectedOrderId = id;
      notify();
    },
    setToast: (toast: { text: string; type: 'success' | 'info' | 'warning' | 'error' } | null) => {
      globalState.toastMessage = toast;
      notify();
      if (toast) {
        setTimeout(() => {
          if (globalState.toastMessage === toast) {
            globalState.toastMessage = null;
            notify();
          }
        }, 4000);
      }
    },

    // 1. Machine Actions
    updateMachineStatus: (machineId: string, status: Machine['status']) => {
      const machine = globalState.machines.find((m) => m.id === machineId);
      if (machine) {
        machine.status = status;
        if (status === 'maintenance') {
          machine.healthScore = Math.min(machine.healthScore, 50);
        } else if (status === 'running') {
          machine.healthScore = 98;
          machine.vibration = 1.75;
          machine.temperature = 48.0;
        }
        propagateConsequences();
      }
    },

    // 2. Maintenance Work Order Lifecycle
    createWorkOrder: (wo: Partial<MaintenanceWorkOrder>) => {
      const newId = `WO-${200 + globalState.workOrders.length + 1}`;
      const machine = globalState.machines.find((m) => m.id === wo.machineId);

      // Check spare parts in inventory
      let sparePartsAvailable = true;
      (wo.sparePartIds || []).forEach((partId) => {
        const item = globalState.inventory.find((i) => i.id === partId);
        if (item) {
          if (item.available > 0) {
            item.reserved += 1;
            item.available -= 1;
            // Record reservation transaction
            globalState.inventoryTransactions.unshift({
              id: `TX-${1100 + globalState.inventoryTransactions.length}`,
              timestamp: new Date().toISOString(),
              itemId: item.id,
              itemName: item.name,
              type: 'reservation',
              quantity: 1,
              referenceType: 'work_order',
              referenceId: newId,
              performedBy: 'NOVA Command Dispatch',
              notes: `Reserved 1 set of ${item.name} for work order ${newId}`,
            });
          } else {
            sparePartsAvailable = false;
          }
        }
      });

      const newWO: MaintenanceWorkOrder = {
        id: newId,
        machineId: wo.machineId || 'M-004',
        machineName: machine?.name || 'Makino CNC Cell',
        issue: wo.issue || 'Spindle bearing vibration anomaly overhaul',
        priority: wo.priority || 'critical',
        type: wo.type || 'corrective',
        technicianId: wo.technicianId || 'EMP-01',
        technicianName: wo.technicianName || 'Marcus Vance',
        requiredSkill: wo.requiredSkill || 'CNC Vibration Diagnostics Level 3',
        sparePartIds: wo.sparePartIds || ['SP-104'],
        sparePartsChecked: sparePartsAvailable,
        status: wo.technicianId ? 'assigned' : 'open',
        created: new Date().toISOString(),
        dueDate: new Date(Date.now() + 86400000).toISOString(),
        estimatedDurationHours: wo.estimatedDurationHours || 6.5,
        notes: wo.notes || 'Corrective overhaul initiated from telemetry alert.',
      };

      globalState.workOrders.unshift(newWO);

      if (machine) {
        machine.activeWorkOrderId = newId;
        machine.status = 'warning';
      }

      globalState.toastMessage = {
        text: `Work Order ${newId} created for ${newWO.machineName}. Spare parts verified and reserved.`,
        type: 'success',
      };

      propagateConsequences();
    },

    assignTechnicianToWorkOrder: (workOrderId: string, employeeId: string) => {
      const wo = globalState.workOrders.find((w) => w.id === workOrderId);
      const emp = globalState.employees.find((e) => e.id === employeeId);

      if (!wo || !emp) return;

      wo.technicianId = emp.id;
      wo.technicianName = emp.name;
      wo.status = 'assigned';

      emp.availability = 'assigned';
      emp.currentTaskId = wo.id;
      emp.workloadPct = Math.min(100, emp.workloadPct + 20);

      globalState.toastMessage = {
        text: `Technician ${emp.name} successfully assigned to ${wo.id} (${wo.machineName}).`,
        type: 'info',
      };

      propagateConsequences();
    },

    startWorkOrder: (workOrderId: string) => {
      const wo = globalState.workOrders.find((w) => w.id === workOrderId);
      if (!wo) return;

      wo.status = 'in_progress';
      const machine = globalState.machines.find((m) => m.id === wo.machineId);
      if (machine) {
        machine.status = 'maintenance';
      }

      globalState.toastMessage = {
        text: `Work order ${wo.id} started. Machine ${wo.machineId} is now OFFLINE in Maintenance. Dependent operations flagged.`,
        type: 'warning',
      };

      propagateConsequences();
    },

    completeWorkOrder: (workOrderId: string) => {
      const wo = globalState.workOrders.find((w) => w.id === workOrderId);
      if (!wo) return;

      wo.status = 'completed';
      wo.actualDurationHours = wo.estimatedDurationHours;

      // Deduct reserved parts from onHand
      wo.sparePartIds.forEach((partId) => {
        const item = globalState.inventory.find((i) => i.id === partId);
        if (item && item.reserved > 0) {
          item.reserved -= 1;
          item.onHand -= 1;
          globalState.inventoryTransactions.unshift({
            id: `TX-${1100 + globalState.inventoryTransactions.length}`,
            timestamp: new Date().toISOString(),
            itemId: item.id,
            itemName: item.name,
            type: 'issue',
            quantity: 1,
            referenceType: 'work_order',
            referenceId: wo.id,
            performedBy: wo.technicianName || 'Maintenance Tech',
            notes: `Consumed for overhaul under ${wo.id}`,
          });
        }
      });

      // Free employee
      if (wo.technicianId) {
        const emp = globalState.employees.find((e) => e.id === wo.technicianId);
        if (emp) {
          emp.availability = 'available';
          emp.currentTaskId = undefined;
          emp.workloadPct = Math.max(20, emp.workloadPct - 20);
        }
      }

      // Restore machine
      const machine = globalState.machines.find((m) => m.id === wo.machineId);
      if (machine) {
        machine.status = 'running';
        machine.healthScore = 97;
        machine.vibration = 1.72;
        machine.temperature = 47.8;
        machine.criticalIssue = undefined;
      }

      // Resolve critical alert AL-101
      const al101 = globalState.alerts.find((a) => a.id === 'AL-101');
      if (al101) al101.status = 'resolved';

      globalState.toastMessage = {
        text: `Work order ${wo.id} COMPLETED! ${machine?.name} restored to optimal running condition.`,
        type: 'success',
      };

      propagateConsequences();
    },

    // 3. Production Scheduling & Rerouting
    rerouteOperation: (operationId: string, targetMachineId: string) => {
      const op = globalState.operations.find((o) => o.id === operationId);
      const targetMachine = globalState.machines.find((m) => m.id === targetMachineId);
      if (!op || !targetMachine) return;

      const previousMachineId = op.machineId;
      op.machineId = targetMachineId;
      op.status = 'in_progress';
      op.delayHours = 0;
      op.delayReason = undefined;

      targetMachine.utilization = 82;
      targetMachine.currentOperationId = op.id;

      globalState.toastMessage = {
        text: `Operation ${op.id} rerouted from ${previousMachineId} to ${targetMachine.id} (${targetMachine.name}). Delays eliminated!`,
        type: 'success',
      };

      propagateConsequences();
    },

    // 4. Inventory Actions
    addInventoryTransaction: (tx: Partial<InventoryTransaction>) => {
      const item = globalState.inventory.find((i) => i.id === tx.itemId);
      if (!item) return;

      const qty = tx.quantity || 1;
      if (tx.type === 'receipt') {
        item.onHand += qty;
      } else if (tx.type === 'issue') {
        item.onHand = Math.max(0, item.onHand - qty);
      } else if (tx.type === 'reservation') {
        item.reserved += qty;
      } else if (tx.type === 'adjustment') {
        item.onHand = qty;
      }

      const newTx: InventoryTransaction = {
        id: `TX-${1100 + globalState.inventoryTransactions.length}`,
        timestamp: new Date().toISOString(),
        itemId: item.id,
        itemName: item.name,
        type: tx.type || 'receipt',
        quantity: qty,
        referenceType: tx.referenceType || 'manual',
        referenceId: tx.referenceId || 'ADJ-MANUAL',
        performedBy: tx.performedBy || 'Zoe Martinez',
        notes: tx.notes || 'Inventory transaction recorded.',
      };

      globalState.inventoryTransactions.unshift(newTx);
      globalState.toastMessage = {
        text: `Inventory transaction logged: ${tx.type?.toUpperCase()} of ${qty} ${item.unit} for ${item.name}`,
        type: 'info',
      };

      propagateConsequences();
    },

    // 5. Procurement Actions
    updatePurchaseOrderStatus: (poId: string, status: PurchaseOrder['status']) => {
      const po = globalState.purchaseOrders.find((p) => p.id === poId);
      if (!po) return;

      po.status = status;
      if (status === 'delivered') {
        const item = globalState.inventory.find((i) => i.id === po.itemId);
        if (item) {
          item.onHand += po.quantity;
          globalState.inventoryTransactions.unshift({
            id: `TX-${1100 + globalState.inventoryTransactions.length}`,
            timestamp: new Date().toISOString(),
            itemId: item.id,
            itemName: item.name,
            type: 'receipt',
            quantity: po.quantity,
            referenceType: 'purchase_order',
            referenceId: po.id,
            performedBy: 'Dock Receiving Clerk',
            notes: `Goods received against PO ${po.id}`,
          });
        }
        globalState.toastMessage = {
          text: `PO ${po.id} delivered! ${po.quantity} units added to ${po.itemName} stock.`,
          type: 'success',
        };
      } else {
        globalState.toastMessage = {
          text: `PO ${po.id} status updated to ${status}.`,
          type: 'info',
        };
      }
      propagateConsequences();
    },

    // 6. Quality Inspection Logging
    addQualityInspection: (qi: Partial<QualityInspection>) => {
      const newId = `QI-${400 + globalState.qualityInspections.length + 1}`;
      const newQI: QualityInspection = {
        id: newId,
        timestamp: new Date().toISOString(),
        machineId: qi.machineId || 'M-004',
        machineName: qi.machineName || 'Makino Multi-Spindle Cell',
        line: qi.line || 'Line 2 - Stamping & Heavy Fabrication',
        batchId: qi.batchId || `BATCH-${Math.floor(8800 + Math.random() * 100)}`,
        productId: qi.productId || 'PROD-TI-01',
        productName: qi.productName || 'Titanium Turbine Impeller Array v4',
        inspectedUnits: qi.inspectedUnits || 50,
        defectUnits: qi.defectUnits || 0,
        defectRatePpm: qi.defectRatePpm || 0,
        spcSignal: qi.spcSignal || 'in_control',
        status: qi.status || 'passed',
        defects: qi.defects || [],
      };

      globalState.qualityInspections.unshift(newQI);

      if (newQI.defectUnits > 0) {
        globalState.alerts.unshift({
          id: `AL-${100 + globalState.alerts.length + 1}`,
          priority: newQI.defectUnits > 2 ? 'critical' : 'high',
          issue: `Quality Defect Spike: ${newQI.defectUnits} defects found in ${newQI.batchId} (${newQI.machineName})`,
          impact: 'Elevated scrap rate & risk to delivery tolerance.',
          owner: 'Aria Thorne (Quality Metrology)',
          recommendedAction: 'Perform tool wear check and calibrate spindle runout.',
          status: 'active',
          timestamp: new Date().toISOString(),
          relatedModule: 'quality',
          targetId: newQI.machineId,
        });
      }

      globalState.toastMessage = {
        text: `Quality inspection ${newId} logged. Result: ${newQI.status.toUpperCase()}`,
        type: newQI.status === 'rejected' ? 'error' : newQI.status === 'warning' ? 'warning' : 'success',
      };

      propagateConsequences();
    },

    // 7. Alert Actions
    updateAlertStatus: (alertId: string, status: Alert['status']) => {
      const alert = globalState.alerts.find((a) => a.id === alertId);
      if (alert) {
        alert.status = status;
        globalState.toastMessage = {
          text: `Alert ${alert.id} marked as ${status.toUpperCase()}.`,
          type: 'info',
        };
        notify();
      }
    },

    // 8. What-If Simulator & Commit Flow
    simulateWhatIf: (params: Partial<WhatIfScenario['parameters']>) => {
      const scenario = globalState.whatIfScenario;
      scenario.parameters = { ...scenario.parameters, ...params };

      // Calculate simulated metrics
      const baseline = scenario.currentMetrics;
      const willReroute = scenario.parameters.rerouteToMachineId === 'M-006';

      scenario.simulatedMetrics = {
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

      scenario.consequences = {
        affectedOperations: willReroute ? ['OP-27', 'OP-28'] : ['OP-27', 'OP-28', 'OP-35'],
        affectedOrders: willReroute ? ['ORDER-1042', 'ORDER-1048'] : ['ORDER-1042', 'ORDER-1048', 'ORDER-1040'],
        costDeltaUsd: scenario.simulatedMetrics.totalCostUsd - baseline.totalCostUsd,
        delayDeltaHours: willReroute ? -5.5 : +8.0,
        oeeDeltaPct: Number((scenario.simulatedMetrics.oeePct - baseline.oeePct).toFixed(1)),
      };

      globalState.toastMessage = {
        text: 'What-If Simulation calculated: Current Plan vs Proposed Plan ready for review.',
        type: 'info',
      };

      notify();
    },

    commitProposedPlan: () => {
      // Execute the What-If proposal
      const op27 = globalState.operations.find((o) => o.id === 'OP-27');
      const m4 = globalState.machines.find((m) => m.id === 'M-004');
      const m6 = globalState.machines.find((m) => m.id === 'M-006');

      if (op27) op27.machineId = 'M-006';
      if (m4) {
        m4.status = 'maintenance';
        m4.criticalIssue = 'Offline: Scheduled 6.5h spindle bearing overhaul in progress.';
      }
      if (m6) {
        m6.utilization = 84;
        m6.currentOperationId = 'OP-27';
      }

      globalState.committedPlanVersion += 1;

      // Update recommendation status
      const rec = globalState.recommendations.find((r) => r.id === 'REC-01');
      if (rec) rec.status = 'applied';

      globalState.toastMessage = {
        text: `Proposed Plan Version #${globalState.committedPlanVersion} COMMITTED by Operations Director! Schedule rerouted and consequences propagated.`,
        type: 'success',
      };

      propagateConsequences();
    },

    // 9. Hackathon Step-by-Step Demo Runner
    runDemoStep: (stepNumber: number) => {
      globalState.demoStep = stepNumber;

      switch (stepNumber) {
        case 1:
          // Command Center overview
          globalState.activeTab = 'command-center';
          break;
        case 2:
          // M-004 vibration spike
          const m4 = globalState.machines.find((m) => m.id === 'M-004');
          if (m4) {
            m4.status = 'warning';
            m4.vibration = 4.85;
            m4.temperature = 68.9;
            m4.healthScore = 54;
          }
          globalState.activeTab = 'machines';
          globalState.selectedMachineId = 'M-004';
          break;
        case 3:
          // View M-004 telemetry evidence
          globalState.activeTab = 'machines';
          globalState.selectedMachineId = 'M-004';
          break;
        case 4:
          // View AI Decision Recommendation
          globalState.activeTab = 'decision-center';
          break;
        case 5:
          // Create Maintenance Work Order
          globalState.activeTab = 'maintenance';
          break;
        case 6:
          // Check technician & spare part SP-104
          const sp104 = globalState.inventory.find((i) => i.id === 'SP-104');
          if (sp104 && sp104.reserved === 0) {
            sp104.reserved = 1;
            sp104.available = 1;
          }
          globalState.activeTab = 'inventory';
          break;
        case 7:
          // M-004 becomes unavailable in maintenance
          const m4Off = globalState.machines.find((m) => m.id === 'M-004');
          if (m4Off) m4Off.status = 'maintenance';
          propagateConsequences();
          globalState.activeTab = 'factory-floor';
          break;
        case 8:
          // Production schedule recalculates
          globalState.activeTab = 'production';
          break;
        case 9:
          // Customer orders identified at risk
          globalState.activeTab = 'orders';
          globalState.selectedOrderId = 'ORDER-1042';
          break;
        case 10:
          // Delivery risk updates to HIGH
          globalState.activeTab = 'orders';
          break;
        case 11:
          // Open What-If Simulator
          globalState.activeTab = 'what-if';
          break;
        case 12:
          // Compare alternative plan
          globalState.activeTab = 'what-if';
          break;
        case 13:
          // Manager reviews proposed plan
          globalState.activeTab = 'what-if';
          break;
        case 14:
          // Decision Center explains WHAT / WHY / EVIDENCE / METHOD / ACTION
          globalState.activeTab = 'decision-center';
          break;
        case 15:
          // Manager commits plan!
          const op = globalState.operations.find((o) => o.id === 'OP-27');
          if (op) op.machineId = 'M-006';
          const m6Active = globalState.machines.find((m) => m.id === 'M-006');
          if (m6Active) m6Active.utilization = 82;
          globalState.committedPlanVersion += 1;
          propagateConsequences();
          globalState.activeTab = 'command-center';
          break;
        default:
          break;
      }

      globalState.toastMessage = {
        text: `Demo Flow: Step ${stepNumber} activated.`,
        type: 'info',
      };

      notify();
    },

    // User & Role Switching
    switchUser: (userId: string) => {
      const targetUser = globalState.users.find((u) => u.id === userId);
      if (targetUser) {
        globalState.currentUser = { ...targetUser };
        globalState.toastMessage = {
          text: `Switched session to ${targetUser.name} (${targetUser.role})`,
          type: 'info',
        };
        notify();
      }
    },

    updateUserRole: (userId: string, newRole: UserRole) => {
      globalState.users = globalState.users.map((u) => {
        if (u.id === userId) {
          const updated = { ...u, role: newRole };
          if (globalState.currentUser.id === userId) {
            globalState.currentUser = { ...updated };
          }
          return updated;
        }
        return u;
      });
      globalState.toastMessage = {
        text: `User role updated to ${newRole}`,
        type: 'success',
      };
      notify();
    },

    addUser: (user: AppUser) => {
      globalState.users = [...globalState.users, user];
      globalState.toastMessage = {
        text: `User ${user.name} added as ${user.role}`,
        type: 'success',
      };
      notify();
    },

    // Reset everything
    resetAllData: () => {
      globalState = {
        machines: JSON.parse(JSON.stringify(initialMachines)),
        operations: JSON.parse(JSON.stringify(initialOperations)),
        orders: JSON.parse(JSON.stringify(initialOrders)),
        employees: JSON.parse(JSON.stringify(initialEmployees)),
        inventory: JSON.parse(JSON.stringify(initialInventory)),
        inventoryTransactions: JSON.parse(JSON.stringify(initialTransactions)),
        purchaseOrders: JSON.parse(JSON.stringify(initialPurchaseOrders)),
        workOrders: JSON.parse(JSON.stringify(initialWorkOrders)),
        qualityInspections: JSON.parse(JSON.stringify(initialQualityInspections)),
        alerts: JSON.parse(JSON.stringify(initialAlerts)),
        recommendations: JSON.parse(JSON.stringify(initialRecommendations)),
        whatIfScenario: JSON.parse(JSON.stringify(initialWhatIfScenario)),
        committedPlanVersion: 1,
        plantShift: 'Shift A (06:00 - 14:00)',
        plantTime: '13:42:15',
        lastUpdated: 'Just now (Simulated Telemetry Stream)',
        demoStep: 1,
        selectedMachineId: 'M-004',
        selectedOrderId: 'ORDER-1042',
        activeTab: 'command-center',
        toastMessage: { text: 'NOVA Command operational state reset to baseline demo seed.', type: 'info' },
        users: JSON.parse(JSON.stringify(DEMO_USERS)),
        currentUser: JSON.parse(JSON.stringify(DEMO_USERS[0])),
      };
      notify();
    },
  };
}
