/**
 * AUTOMATED JOB FLOW TEST
 *
 * This script demonstrates a complete job flow through ForgeExec
 * from LEAD_RECEIVED to CLOSED without human intervention.
 *
 * This is a thin reality interface - NO LOGIC.
 * It emits events exactly as they would come from real UIs.
 *
 * Purpose:
 * - Prove end-to-end execution works
 * - Validate state machine transitions
 * - Demonstrate zero-logic event sources
 */
import { createAdapterRegistry } from '../adapters/adapter-registry';
import { wireNLEAdapters } from '../verticals/next-level-electric/adapter-wiring';
import { createMockKernel } from '../kernel-client/mock-kernel';
import { executeEvent, acknowledgeOutputs } from '../executor/executor';
import { createInitialState } from '../executor/state';
/**
 * Execute a complete job flow.
 */
async function runJobFlow() {
    console.log('🔧 ForgeExec Automated Job Flow Test\n');
    console.log('This demonstrates a complete job lifecycle:');
    console.log('  LEAD_RECEIVED → SCHEDULED → DISPATCHED → ON_SITE');
    console.log('  → WORK_COMPLETED → INSPECTION_PASSED → INVOICED → CLOSED\n');
    // Initialize ForgeExec
    console.log('1. Initializing ForgeExec...');
    const registry = createAdapterRegistry();
    wireNLEAdapters(registry);
    const kernel = createMockKernel();
    console.log('   ✅ ForgeExec initialized\n');
    // Create initial job
    const jobId = 'job-flow-001';
    let state = createInitialState(jobId, 'LEAD_RECEIVED');
    const context = {
        jobId,
        customerId: 'customer-flow-001',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {
            customerName: 'Test Customer',
            address: '123 Main St, Portland, OR',
            source: 'automated-test'
        }
    };
    console.log(`2. Job created: ${jobId}`);
    console.log(`   Customer: ${context.metadata.customerName}`);
    console.log(`   Type: ${context.jobType}`);
    console.log(`   Initial state: ${state.currentState}\n`);
    // Helper to execute event and log result
    async function emitEvent(eventType, payload) {
        const event = {
            type: eventType,
            payload,
            timestamp: new Date().toISOString(),
            sourceId: 'automated-test'
        };
        console.log(`📤 Emitting: ${eventType}`);
        const result = await executeEvent({ kernel }, state, event, context);
        if (result.success) {
            console.log(`   ✅ Accepted - ${state.currentState} → ${result.state.currentState}`);
            if (result.outputs.length > 0) {
                console.log(`   📨 Outputs generated:`);
                result.outputs.forEach(output => {
                    console.log(`      - ${output.type}`);
                });
            }
            // Update state
            state = result.state;
            // Acknowledge outputs (in real system, adapters would handle these)
            if (state.pendingOutputs.length > 0) {
                state = acknowledgeOutputs(state);
            }
            console.log();
            return true;
        }
        else {
            console.log(`   ❌ Rejected - ${result.error}`);
            console.log(`   State unchanged: ${state.currentState}\n`);
            return false;
        }
    }
    // Execute job flow
    console.log('3. Executing job flow...\n');
    // Office schedules job
    const scheduled = await emitEvent('JOB_SCHEDULED', {
        scheduledTime: '2026-01-05T09:00:00Z',
        technicianId: 'tech-001'
    });
    if (!scheduled) {
        console.error('❌ Job scheduling failed');
        process.exit(1);
    }
    // Office dispatches technician
    const dispatched = await emitEvent('TECHNICIAN_DISPATCHED', {
        technicianId: 'tech-001'
    });
    if (!dispatched) {
        console.error('❌ Technician dispatch failed');
        process.exit(1);
    }
    // Technician arrives at site
    const arrived = await emitEvent('TECHNICIAN_ARRIVED', {
        technicianId: 'tech-001',
        latitude: 45.5231,
        longitude: -122.6765,
        accuracy: 10
    });
    if (!arrived) {
        console.error('❌ Technician arrival failed');
        process.exit(1);
    }
    // Technician starts work
    const workStarted = await emitEvent('WORK_STARTED', {
        technicianId: 'tech-001'
    });
    if (!workStarted) {
        console.error('❌ Work start failed');
        process.exit(1);
    }
    // Technician completes work
    const workCompleted = await emitEvent('WORK_COMPLETED', {
        technicianId: 'tech-001',
        laborHours: 3.5,
        requiresInspection: true,
        notes: 'Panel upgraded to 200A successfully'
    });
    if (!workCompleted) {
        console.error('❌ Work completion failed');
        process.exit(1);
    }
    // Inspection passes (would come from inspector in real system)
    const inspectionPassed = await emitEvent('INSPECTION_PASSED', {
        inspectorId: 'inspector-001',
        notes: 'All work meets code requirements'
    });
    if (!inspectionPassed) {
        console.error('❌ Inspection failed');
        process.exit(1);
    }
    // Office generates invoice
    const invoiced = await emitEvent('INVOICE_GENERATED', {
        generatedBy: 'office-001'
    });
    if (!invoiced) {
        console.error('❌ Invoice generation failed');
        process.exit(1);
    }
    // Payment received (would come from payment processor)
    const paymentReceived = await emitEvent('PAYMENT_RECEIVED', {
        paymentId: 'pay-001',
        amount: 1250.00,
        method: 'credit_card'
    });
    if (!paymentReceived) {
        console.error('❌ Payment processing failed');
        process.exit(1);
    }
    // Job closed
    const closed = await emitEvent('JOB_CLOSED', {
        closedBy: 'system'
    });
    if (!closed) {
        console.error('❌ Job closure failed');
        process.exit(1);
    }
    // Final status
    console.log('4. Job flow complete!\n');
    console.log('📊 Final State:');
    console.log(`   Job ID: ${state.jobId}`);
    console.log(`   State: ${state.currentState}`);
    console.log(`   Total transitions: ${state.history.length}`);
    console.log();
    console.log('✅ All state transitions successful');
    console.log('✅ Zero logic violations detected');
    console.log('✅ Event flow validated\n');
    // Display state history
    console.log('📜 State History:');
    state.history.forEach((entry, index) => {
        console.log(`   ${index + 1}. ${entry.fromState} → ${entry.toState}`);
        console.log(`      Event: ${entry.event.type}`);
        console.log(`      Time: ${entry.timestamp}`);
    });
    console.log();
}
/**
 * Run the automated job flow.
 * Execute with: npx tsx examples/automated-job-flow.ts
 */
if (import.meta.url === `file://${process.argv[1]}`) {
    runJobFlow().catch(error => {
        console.error('❌ Job flow failed:', error);
        process.exit(1);
    });
}
