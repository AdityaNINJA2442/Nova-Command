-- CreateTable
CREATE TABLE "Machine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "utilization" REAL NOT NULL,
    "healthScore" REAL NOT NULL,
    "temperature" REAL NOT NULL,
    "vibration" REAL NOT NULL,
    "vibrationThreshold" REAL NOT NULL,
    "energy" REAL NOT NULL,
    "currentOperationId" TEXT,
    "currentOrderId" TEXT,
    "activeWorkOrderId" TEXT,
    "uptimeHours" REAL NOT NULL,
    "downtimeHours" REAL NOT NULL,
    "lastMaintenance" TEXT NOT NULL,
    "nextScheduledMaintenance" TEXT NOT NULL,
    "criticalIssue" TEXT
);

-- CreateTable
CREATE TABLE "MachineTelemetry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "machineId" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "temperature" REAL NOT NULL,
    "vibration" REAL NOT NULL,
    "energy" REAL NOT NULL,
    "rpm" REAL NOT NULL,
    CONSTRAINT "MachineTelemetry_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer" TEXT NOT NULL,
    "product" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "valueUsd" REAL NOT NULL,
    "orderDate" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "materialReadiness" TEXT NOT NULL,
    "machineReadiness" TEXT NOT NULL,
    "deliveryRisk" TEXT NOT NULL,
    "riskReasons" TEXT NOT NULL,
    "currentOperationId" TEXT,
    "penaltyPerDayUsd" REAL NOT NULL
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "alternativeMachineId" TEXT,
    "line" TEXT NOT NULL,
    "durationHours" REAL NOT NULL,
    "scheduledStart" TEXT NOT NULL,
    "scheduledEnd" TEXT NOT NULL,
    "actualStart" TEXT,
    "status" TEXT NOT NULL,
    "progressPct" REAL NOT NULL,
    "delayHours" REAL NOT NULL,
    "delayReason" TEXT,
    "requiredSkill" TEXT NOT NULL,
    CONSTRAINT "Operation_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Operation_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "shift" TEXT NOT NULL,
    "availability" TEXT NOT NULL,
    "workloadPct" REAL NOT NULL,
    "assignedLine" TEXT NOT NULL,
    "hoursWorkedThisWeek" REAL NOT NULL,
    "currentTaskId" TEXT,
    "avatarInitials" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "onHand" REAL NOT NULL,
    "reserved" REAL NOT NULL,
    "available" REAL NOT NULL,
    "reorderPoint" REAL NOT NULL,
    "leadTimeDays" INTEGER NOT NULL,
    "unitCostUsd" REAL NOT NULL,
    "daysOfCover" REAL NOT NULL,
    "stockoutRisk" TEXT NOT NULL,
    "storageLocation" TEXT NOT NULL,
    "relatedMachineId" TEXT,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "InventoryTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "referenceType" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    CONSTRAINT "InventoryTransaction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplier" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPriceUsd" REAL NOT NULL,
    "totalPriceUsd" REAL NOT NULL,
    "orderDate" TEXT NOT NULL,
    "expectedDelivery" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "riskNotes" TEXT,
    CONSTRAINT "PurchaseOrder_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MaintenanceWorkOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "machineId" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "technicianId" TEXT,
    "technicianName" TEXT,
    "requiredSkill" TEXT NOT NULL,
    "sparePartsChecked" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,
    "created" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "estimatedDurationHours" REAL NOT NULL,
    "actualDurationHours" REAL,
    "notes" TEXT NOT NULL,
    CONSTRAINT "MaintenanceWorkOrder_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceWorkOrder_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkOrderSparePart" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "workOrderId" TEXT NOT NULL,
    "sparePartId" TEXT NOT NULL,
    CONSTRAINT "WorkOrderSparePart_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "MaintenanceWorkOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkOrderSparePart_sparePartId_fkey" FOREIGN KEY ("sparePartId") REFERENCES "InventoryItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QualityInspection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "machineName" TEXT NOT NULL,
    "line" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "inspectedUnits" INTEGER NOT NULL,
    "defectUnits" INTEGER NOT NULL,
    "defectRatePpm" REAL NOT NULL,
    "spcSignal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "defectsJson" TEXT NOT NULL,
    "correctiveActionId" TEXT,
    CONSTRAINT "QualityInspection_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "priority" TEXT NOT NULL,
    "issue" TEXT NOT NULL,
    "impact" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "relatedModule" TEXT NOT NULL,
    "targetId" TEXT
);

-- CreateTable
CREATE TABLE "DecisionRecommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "targetEntity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "evidence" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "estimatedImpact" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "actionPayloadJson" TEXT
);

-- CreateTable
CREATE TABLE "WhatIfScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "parametersJson" TEXT NOT NULL,
    "currentMetricsJson" TEXT NOT NULL,
    "simulatedMetricsJson" TEXT NOT NULL,
    "impactChainJson" TEXT NOT NULL,
    "consequencesJson" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AppUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "initials" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "avatarBg" TEXT NOT NULL,
    "description" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SystemState" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "committedPlanVersion" INTEGER NOT NULL DEFAULT 1,
    "plantShift" TEXT NOT NULL DEFAULT 'Shift A (06:00 - 14:00)',
    "plantTime" TEXT NOT NULL DEFAULT '13:42:15',
    "lastUpdated" TEXT NOT NULL DEFAULT 'Simulated Telemetry Stream',
    "demoStep" INTEGER NOT NULL DEFAULT 1,
    "selectedMachineId" TEXT NOT NULL DEFAULT 'M-004',
    "selectedOrderId" TEXT NOT NULL DEFAULT 'ORDER-1042'
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_email_key" ON "AppUser"("email");
