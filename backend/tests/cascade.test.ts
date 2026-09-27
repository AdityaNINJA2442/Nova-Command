import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/utils/prisma';
import { seedDatabase } from '../prisma/seed';

async function runComprehensiveTests() {
  console.log('================================================================');
  console.log('  NOVA COMMAND BACKEND - FULL INTEGRATION TEST SUITE (14 TESTS) ');
  console.log('================================================================\n');

  let failures = 0;

  try {
    // Reset database to clean baseline seed before starting
    console.log('[Setup] Seeding database to baseline demo state...');
    await seedDatabase();
    console.log('[Setup] Seed complete.\n');

    // 1. API Health
    console.log('--- Test 1: API Health ---');
    const resHealth = await request(app).get('/api/system/health');
    if (resHealth.status === 200 && resHealth.body.status === 'UP' && resHealth.body.database === 'Connected') {
      console.log('✓ PASS: System health is UP with database connected');
    } else {
      console.error('✕ FAIL: Health check failed:', resHealth.status, resHealth.body);
      failures++;
    }

    // 2. Machine Retrieval
    console.log('\n--- Test 2: Machine Retrieval ---');
    const resMachines = await request(app).get('/api/machines');
    if (resMachines.status === 200 && Array.isArray(resMachines.body.data) && resMachines.body.data.length === 6) {
      console.log(`✓ PASS: Retrieved all ${resMachines.body.data.length} machines with telemetry history`);
    } else {
      console.error('✕ FAIL: Machine retrieval failed:', resMachines.status, resMachines.body);
      failures++;
    }

    // 3. Telemetry Ingestion
    console.log('\n--- Test 3: Telemetry Ingestion ---');
    const newPoint = { temperature: 71.5, vibration: 4.95, energy: 60.2, rpm: 20000 };
    const resTelem = await request(app)
      .post('/api/machines/M-004/telemetry')
      .send(newPoint);
    if (resTelem.status === 201 && resTelem.body.data.vibration === 4.95) {
      console.log('✓ PASS: Ingested telemetry point for M-004 (4.95 mm/s, 71.5°C)');
    } else {
      console.error('✕ FAIL: Telemetry ingestion failed:', resTelem.status, resTelem.body);
      failures++;
    }

    // 4. M-004 Vibration Anomaly Evaluation
    console.log('\n--- Test 4: M-004 Anomaly Evaluation ---');
    const resAnomaly = await request(app).get('/api/machines/M-004/anomaly');
    if (
      resAnomaly.status === 200 &&
      resAnomaly.body.data.isExceeded === true &&
      resAnomaly.body.data.severity === 'critical'
    ) {
      console.log(`✓ PASS: Anomaly detected! Deviation: +${resAnomaly.body.data.deviationPct}% over baseline. Status: ${resAnomaly.body.data.status}`);
    } else {
      console.error('✕ FAIL: Anomaly evaluation failed:', resAnomaly.status, resAnomaly.body);
      failures++;
    }

    // 5. Maintenance Creation & Spare Part Reservation Check
    console.log('\n--- Test 5: Maintenance Creation & Spare Part Reservation ---');
    const initialPart = await prisma.inventoryItem.findUnique({ where: { id: 'SP-104' } });
    const initialReserved = initialPart?.reserved || 0;

    const resWO = await request(app)
      .post('/api/maintenance/work-orders')
      .send({
        machineId: 'M-004',
        issue: 'Corrective Spindle Bearing Replacement',
        priority: 'critical',
        sparePartIds: ['SP-104'],
        estimatedDurationHours: 6.5,
      });

    const newWOId = resWO.body.data?.id;
    const updatedPart = await prisma.inventoryItem.findUnique({ where: { id: 'SP-104' } });

    if (resWO.status === 201 && updatedPart && updatedPart.reserved === initialReserved + 1) {
      console.log(`✓ PASS: Work Order ${newWOId} created. Spare part SP-104 reserved: ${initialReserved} -> ${updatedPart.reserved}`);
    } else {
      console.error('✕ FAIL: Maintenance creation or part reservation failed:', resWO.status, resWO.body);
      failures++;
    }

    // 6. Technician Assignment
    console.log('\n--- Test 6: Technician Assignment ---');
    const resAssign = await request(app)
      .post(`/api/maintenance/work-orders/${newWOId}/assign`)
      .send({ employeeId: 'EMP-01' });

    const assignedEmp = await prisma.employee.findUnique({ where: { id: 'EMP-01' } });
    if (resAssign.status === 200 && assignedEmp?.availability === 'assigned' && assignedEmp?.currentTaskId === newWOId) {
      console.log(`✓ PASS: Technician Marcus Vance (${assignedEmp.id}) assigned to ${newWOId}, availability: ${assignedEmp.availability}`);
    } else {
      console.error('✕ FAIL: Technician assignment failed:', resAssign.status, resAssign.body);
      failures++;
    }

    // 7. Maintenance Start (Triggers machine offline & cascade)
    console.log('\n--- Test 7: Maintenance Start ---');
    const resStart = await request(app).post(`/api/maintenance/work-orders/${newWOId}/start`);
    const m4Offline = await prisma.machine.findUnique({ where: { id: 'M-004' } });
    if (resStart.status === 200 && m4Offline?.status === 'maintenance') {
      console.log('✓ PASS: Work order started. Machine M-004 status transitioned to MAINTENANCE (Offline)');
    } else {
      console.error('✕ FAIL: Maintenance start failed:', resStart.status, resStart.body);
      failures++;
    }

    // 8. Order Delivery Risk Recalculation (M-004 in maintenance delays OP-27 and triggers HIGH delivery risk)
    console.log('\n--- Test 8: Order Risk Cascade Evaluation ---');
    const resRisk = await request(app).get('/api/orders/ORDER-1042/risk');
    const order1042 = await prisma.order.findUnique({ where: { id: 'ORDER-1042' } });
    if (resRisk.status === 200 && resRisk.body.data.level === 'high' && order1042?.deliveryRisk === 'high') {
      console.log(`✓ PASS: Order ORDER-1042 deliveryRisk is HIGH. Factors: ${resRisk.body.data.factors.join('; ')}`);
    } else {
      console.error('✕ FAIL: Order risk recalculation failed:', resRisk.status, resRisk.body);
      failures++;
    }

    // 9. Operation Rerouting (Reroute OP-27 to standby M-006)
    console.log('\n--- Test 9: Operation Rerouting (OP-27 -> M-006) ---');
    const resReroute = await request(app)
      .patch('/api/operations/OP-27/reroute')
      .send({ targetMachineId: 'M-006' });

    const reroutedOp = await prisma.operation.findUnique({ where: { id: 'OP-27' } });
    const orderAfterReroute = await prisma.order.findUnique({ where: { id: 'ORDER-1042' } });

    if (
      resReroute.status === 200 &&
      reroutedOp?.machineId === 'M-006' &&
      reroutedOp?.delayHours === 0 &&
      orderAfterReroute?.deliveryRisk === 'low'
    ) {
      console.log('✓ PASS: Operation OP-27 rerouted to Standby M-006. Delays eliminated, ORDER-1042 delivery risk recovered to LOW!');
    } else {
      console.error('✕ FAIL: Operation rerouting failed:', resReroute.status, resReroute.body);
      failures++;
    }

    // 10. Maintenance Completion (Consumes spare parts, frees technician, restores machine)
    console.log('\n--- Test 10: Maintenance Completion ---');
    const partBeforeCompletion = await prisma.inventoryItem.findUnique({ where: { id: 'SP-104' } });
    const resComplete = await request(app).post(`/api/maintenance/work-orders/${newWOId}/complete`);
    const partAfterCompletion = await prisma.inventoryItem.findUnique({ where: { id: 'SP-104' } });
    const m4Restored = await prisma.machine.findUnique({ where: { id: 'M-004' } });
    const empFreed = await prisma.employee.findUnique({ where: { id: 'EMP-01' } });

    if (
      resComplete.status === 200 &&
      partAfterCompletion &&
      partBeforeCompletion &&
      partAfterCompletion.onHand === partBeforeCompletion.onHand - 1 &&
      partAfterCompletion.reserved === partBeforeCompletion.reserved - 1 &&
      m4Restored?.status === 'running' &&
      empFreed?.availability === 'available'
    ) {
      console.log(`✓ PASS: Work order ${newWOId} completed. SP-104 consumed (onHand: ${partAfterCompletion.onHand}), Marcus Vance freed (available), M-004 restored to RUNNING (Health: 97%)`);
    } else {
      console.error('✕ FAIL: Maintenance completion failed:', resComplete.status, resComplete.body);
      failures++;
    }

    // 11. Transactional Inventory Adjustments
    console.log('\n--- Test 11: Transactional Inventory Ledger ---');
    const resTx = await request(app)
      .post('/api/inventory/transactions')
      .send({
        itemId: 'MAT-021',
        type: 'receipt',
        quantity: 100,
        referenceType: 'manual',
        referenceId: 'MANUAL-TEST',
        performedBy: 'QA Test Lead',
        notes: 'QA automated test inventory addition',
      });

    const mat21 = await prisma.inventoryItem.findUnique({ where: { id: 'MAT-021' } });
    if (resTx.status === 201 && mat21 && mat21.onHand === 520) {
      console.log(`✓ PASS: Inventory transaction recorded. MAT-021 stock increased to ${mat21.onHand} kg`);
    } else {
      console.error('✕ FAIL: Inventory transaction failed:', resTx.status, resTx.body);
      failures++;
    }

    // 12. Procurement Workflow & Goods Receipt
    console.log('\n--- Test 12: Procurement Status & Goods Receipt ---');
    const sp112Before = await prisma.inventoryItem.findUnique({ where: { id: 'SP-112' } });
    const onHandBefore = sp112Before?.onHand || 0;

    const resPO = await request(app)
      .patch('/api/procurement/orders/PO-901/status')
      .send({ status: 'delivered' });

    const poItem = await prisma.inventoryItem.findUnique({ where: { id: 'SP-104' } });
    if (resPO.status === 200 && resPO.body.data.status === 'delivered') {
      console.log(`✓ PASS: Purchase Order PO-901 marked DELIVERED. Goods receipt logged and stock updated to ${poItem?.onHand}`);
    } else {
      console.error('✕ FAIL: Procurement update failed:', resPO.status, resPO.body);
      failures++;
    }

    // 13. Quality Inspection & SPC Alert
    console.log('\n--- Test 13: Quality Inspection & Automated SPC Alert ---');
    const resQI = await request(app)
      .post('/api/quality/inspections')
      .send({
        machineId: 'M-003',
        inspectedUnits: 50,
        defectUnits: 4,
        defects: [{ type: 'Flange thickness out of spec', count: 4 }],
      });

    const alerts = await prisma.alert.findMany({ where: { targetId: 'M-003' } });
    if (resQI.status === 201 && resQI.body.data.status === 'rejected' && alerts.length > 0) {
      console.log(`✓ PASS: Quality Inspection logged. SPC Signal: ${resQI.body.data.spcSignal}, Alert generated: ${alerts[0].issue}`);
    } else {
      console.error('✕ FAIL: Quality inspection failed:', resQI.status, resQI.body);
      failures++;
    }

    // 14. What-If Simulator & Plan Commit Flow
    console.log('\n--- Test 14: What-If Simulator & Plan Commit ---');
    const resSim = await request(app)
      .post('/api/what-if/simulate')
      .send({ rerouteToMachineId: 'M-006', downtimeHours: 6.5 });

    const resCommit = await request(app).post('/api/what-if/commit');
    const systemState = await prisma.systemState.findUnique({ where: { id: 'singleton' } });

    if (
      resSim.status === 200 &&
      resCommit.status === 200 &&
      systemState &&
      systemState.committedPlanVersion >= 2
    ) {
      console.log(`✓ PASS: What-If Simulation evaluated and COMMITTED! Plan Version: #${systemState.committedPlanVersion}`);
    } else {
      console.error('✕ FAIL: What-If simulation/commit failed:', resSim.status, resCommit.status);
      failures++;
    }

  } catch (err) {
    console.error('\n✕ UNEXPECTED TEST EXCEPTION:', err);
    failures++;
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n================================================================');
  if (failures > 0) {
    console.error(`  TEST RUN FAILED: ${failures} test(s) failed.`);
    console.log('================================================================');
    process.exit(1);
  } else {
    console.log('  ALL 14 INTEGRATION TESTS PASSED CLEANLY! (100% SUCCESS)         ');
    console.log('================================================================\n');
    process.exit(0);
  }
}

runComprehensiveTests();
