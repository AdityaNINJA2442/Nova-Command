import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/utils/prisma';

async function runTests() {
  console.log('--- Running Backend Phase 1 & 2 Verification Tests ---');
  let failures = 0;

  try {
    // Test 1: Root route
    console.log('[Test 1] GET / returns 200 with service metadata');
    const resRoot = await request(app).get('/');
    if (resRoot.status === 200 && resRoot.body.service === 'NOVA COMMAND Backend API') {
      console.log('✓ PASS: Root metadata endpoint verified');
    } else {
      console.error('✕ FAIL: Root endpoint returned:', resRoot.status, resRoot.body);
      failures++;
    }

    // Test 2: System Health endpoint
    console.log('[Test 2] GET /api/system/health returns 200 with database connection stats');
    const resHealth = await request(app).get('/api/system/health');
    if (resHealth.status === 200 && resHealth.body.status === 'UP' && resHealth.body.stats) {
      console.log('✓ PASS: Health check endpoint verified:', resHealth.body.stats);
    } else {
      console.error('✕ FAIL: Health check returned:', resHealth.status, resHealth.body);
      failures++;
    }

    // Test 3: System Status endpoint
    console.log('[Test 3] GET /api/system/status returns active shift, telemetry engine tag, and stats');
    const resStatus = await request(app).get('/api/system/status');
    if (
      resStatus.status === 200 &&
      resStatus.body.success === true &&
      resStatus.body.data.selectedMachineId === 'M-004' &&
      resStatus.body.data.dataSource.includes('Simulated')
    ) {
      console.log('✓ PASS: System status endpoint verified with correct demo metadata');
    } else {
      console.error('✕ FAIL: System status returned:', resStatus.status, resStatus.body);
      failures++;
    }

    // Test 4: Database query validation directly via Prisma
    console.log('[Test 4] Direct Prisma verification: M-004 vibration anomaly threshold');
    const m4 = await prisma.machine.findUnique({
      where: { id: 'M-004' },
      include: { telemetryHistory: true },
    });
    if (m4 && m4.vibration > m4.vibrationThreshold && m4.telemetryHistory.length > 0) {
      console.log(`✓ PASS: Machine M-004 found in database with vibration ${m4.vibration} > threshold ${m4.vibrationThreshold}, history points: ${m4.telemetryHistory.length}`);
    } else {
      console.error('✕ FAIL: Machine M-004 validation failed:', m4);
      failures++;
    }

    // Test 5: Verify Order ORDER-1042 exists with high risk
    console.log('[Test 5] Direct Prisma verification: ORDER-1042 customer contract');
    const order1042 = await prisma.order.findUnique({
      where: { id: 'ORDER-1042' },
      include: { operations: true },
    });
    if (order1042 && order1042.deliveryRisk === 'high' && order1042.operations.length > 0) {
      console.log(`✓ PASS: ORDER-1042 found in database, deliveryRisk: ${order1042.deliveryRisk}, linked operations: ${order1042.operations.length}`);
    } else {
      console.error('✕ FAIL: ORDER-1042 validation failed:', order1042);
      failures++;
    }

  } catch (err) {
    console.error('✕ UNHANDLED TEST ERROR:', err);
    failures++;
  } finally {
    await prisma.$disconnect();
  }

  if (failures > 0) {
    console.error(`\nFAILED: ${failures} test(s) failed.`);
    process.exit(1);
  } else {
    console.log('\nALL PHASE 1 & 2 TESTS PASSED SUCCESSFULLY! ✓');
    process.exit(0);
  }
}

runTests();
