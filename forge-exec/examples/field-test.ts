/**
 * FIELD TEST DRY RUN (DAY 5)
 *
 * This script executes a complete NLE job flow WITHOUT HUMAN INTERVENTION.
 * It logs all outputs, failures, and state transitions.
 *
 * Success Criteria:
 * - Job created → dispatched → completed → invoiced
 * - NO manual corrections required
 * - All failures logged for review
 *
 * Exit Conditions:
 * - ❌ Manual intervention required → FAIL WEEK
 * - ✅ Full flow executes → PASS WEEK
 */

import { createAdapterRegistry } from '../adapters/adapter-registry'
import { wireNLEAdapters } from '../verticals/next-level-electric/adapter-wiring'
import { createMockKernel } from '../kernel-client/mock-kernel'
import { executeEvent, acknowledgeOutputs } from '../executor/executor'
import { createInitialState } from '../executor/state'
import type { ExecutionEvent, JobContext, ExecutionState } from '../kernel-client/interface'

interface TestLog {
  timestamp: string
  level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN'
  message: string
  data?: unknown
}

const logs: TestLog[] = []

function log(level: TestLog['level'], message: string, data?: unknown) {
  const entry: TestLog = {
    timestamp: new Date().toISOString(),
    level,
    message,
    data
  }
  logs.push(entry)

  const emoji = {
    INFO: 'ℹ️',
    SUCCESS: '✅',
    ERROR: '❌',
    WARN: '⚠️'
  }[level]

  console.log(`${emoji} [${level}] ${message}`)
  if (data) {
    console.log('   ', JSON.stringify(data, null, 2))
  }
}

/**
 * Execute field test without human intervention.
 */
async function runFieldTest() {
  console.log('🔬 ForgeExec Field Test - Day 5\n')
  console.log('═'.repeat(60))
  console.log('GOAL: Execute complete job flow without manual intervention')
  console.log('═'.repeat(60))
  console.log()

  log('INFO', 'Field test started')

  // Initialize ForgeExec
  log('INFO', 'Initializing ForgeExec with NLE configuration')

  const registry = createAdapterRegistry()
  wireNLEAdapters(registry)
  const kernel = createMockKernel()

  log('SUCCESS', 'ForgeExec initialized')

  // Create test job
  const jobId = 'field-test-job-001'
  let state: ExecutionState = createInitialState(jobId, 'LEAD_RECEIVED')

  const context: JobContext = {
    jobId,
    customerId: 'field-test-customer-001',
    vertical: 'electrician',
    jobType: 'PANEL_UPGRADE',
    metadata: {
      customerName: 'Field Test Customer',
      address: '789 Test Ave, Portland, OR 97201',
      phone: '(503) 555-TEST',
      estimatedCost: 1500.00,
      priority: 'MEDIUM'
    }
  }

  log('INFO', 'Test job created', {
    jobId,
    customerName: context.metadata.customerName,
    jobType: context.jobType,
    initialState: state.currentState
  })

  const failures: Array<{ step: string; error: string }> = []
  let manualInterventionRequired = false

  // Helper to execute event and log result
  async function executeStep(
    step: string,
    eventType: string,
    payload: Record<string, unknown>
  ): Promise<boolean> {
    log('INFO', `Step: ${step}`, { eventType, payload })

    const event: ExecutionEvent = {
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      sourceId: 'field-test'
    }

    try {
      const result = await executeEvent({ kernel }, state, event, context)

      if (result.success) {
        log('SUCCESS', `${step} - Transition accepted`, {
          from: state.currentState,
          to: result.state.currentState,
          outputsGenerated: result.outputs.length
        })

        if (result.outputs.length > 0) {
          result.outputs.forEach(output => {
            log('INFO', `Output generated: ${output.type}`, output.payload)
          })
        }

        // Update state
        state = result.state

        // Acknowledge outputs
        if (state.pendingOutputs.length > 0) {
          state = acknowledgeOutputs(state)
        }

        return true
      } else {
        log('ERROR', `${step} - Transition rejected`, {
          reason: result.error,
          currentState: state.currentState
        })

        failures.push({
          step,
          error: result.error || 'Unknown error'
        })

        return false
      }
    } catch (error) {
      log('ERROR', `${step} - Exception thrown`, {
        error: error instanceof Error ? error.message : String(error)
      })

      failures.push({
        step,
        error: error instanceof Error ? error.message : String(error)
      })

      manualInterventionRequired = true
      return false
    }
  }

  // Execute job flow
  log('INFO', 'Beginning job flow execution')
  console.log()

  // Step 1: Office creates and schedules job
  const scheduled = await executeStep(
    '1. Schedule Job',
    'JOB_SCHEDULED',
    {
      scheduledTime: '2026-01-06T09:00:00Z',
      technicianId: 'tech-field-test-001',
      estimatedDuration: 3
    }
  )

  if (!scheduled) {
    log('WARN', 'Job scheduling failed - attempting to continue')
  }

  // Step 2: Office dispatches technician
  const dispatched = await executeStep(
    '2. Dispatch Technician',
    'TECHNICIAN_DISPATCHED',
    {
      technicianId: 'tech-field-test-001',
      dispatchedBy: 'office-field-test-001'
    }
  )

  if (!dispatched) {
    log('WARN', 'Technician dispatch failed - attempting to continue')
  }

  // Step 3: Technician arrives on site
  const arrived = await executeStep(
    '3. Technician Arrives',
    'TECHNICIAN_ARRIVED',
    {
      technicianId: 'tech-field-test-001',
      latitude: 45.5231,
      longitude: -122.6765,
      accuracy: 15
    }
  )

  if (!arrived) {
    log('WARN', 'Technician arrival failed - attempting to continue')
  }

  // Step 4: Work completed
  const completed = await executeStep(
    '4. Complete Work',
    'WORK_COMPLETED',
    {
      technicianId: 'tech-field-test-001',
      laborHours: 3.5,
      materialsUsed: [
        {
          itemId: 'panel-200a',
          description: '200A Main Panel',
          quantity: 1,
          cost: 450.00
        },
        {
          itemId: 'breaker-20a',
          description: '20A Breaker',
          quantity: 4,
          cost: 120.00
        }
      ],
      requiresInspection: true,
      notes: 'Panel upgrade completed successfully. All circuits tested.'
    }
  )

  if (!completed) {
    log('ERROR', 'Work completion failed - CRITICAL')
    manualInterventionRequired = true
  }

  // Step 5: Inspection passes
  const inspected = await executeStep(
    '5. Inspection Passed',
    'INSPECTION_PASSED',
    {
      inspectorId: 'inspector-field-test-001',
      inspectionDate: '2026-01-06T14:00:00Z',
      notes: 'All work meets NEC standards. Approved.'
    }
  )

  if (!inspected) {
    log('ERROR', 'Inspection failed - CRITICAL')
    manualInterventionRequired = true
  }

  // Step 6: Invoice generated
  const invoiced = await executeStep(
    '6. Generate Invoice',
    'INVOICE_GENERATED',
    {
      generatedBy: 'office-field-test-001',
      invoiceDate: '2026-01-06T15:00:00Z'
    }
  )

  if (!invoiced) {
    log('ERROR', 'Invoice generation failed - CRITICAL')
    manualInterventionRequired = true
  }

  // Step 7: Job closed
  const closed = await executeStep(
    '7. Close Job',
    'JOB_CLOSED',
    {
      closedBy: 'system',
      closureReason: 'COMPLETED_AND_INVOICED'
    }
  )

  if (!closed) {
    log('ERROR', 'Job closure failed - CRITICAL')
    manualInterventionRequired = true
  }

  // Final results
  console.log()
  console.log('═'.repeat(60))
  console.log('FIELD TEST RESULTS')
  console.log('═'.repeat(60))
  console.log()

  log('INFO', 'Final job state', {
    jobId: state.jobId,
    finalState: state.currentState,
    totalTransitions: state.history.length,
    pendingOutputs: state.pendingOutputs.length
  })

  if (failures.length === 0) {
    log('SUCCESS', 'PASS - No failures detected')
  } else {
    log('WARN', `${failures.length} failure(s) detected`, failures)
  }

  if (manualInterventionRequired) {
    log('ERROR', 'FAIL - Manual intervention required')
  } else {
    log('SUCCESS', 'PASS - Full flow executed without intervention')
  }

  // Week 1 Pass/Fail determination
  console.log()
  console.log('═'.repeat(60))
  console.log('WEEK 1 EXIT GATE')
  console.log('═'.repeat(60))
  console.log()

  const weekPassed = !manualInterventionRequired && state.currentState === 'CLOSED'

  if (weekPassed) {
    console.log('✅ PASS - Week 1 execution complete')
    console.log('   - Full job flow executed from LEAD_RECEIVED to CLOSED')
    console.log('   - Zero manual interventions required')
    console.log('   - All state transitions validated')
    console.log()
  } else {
    console.log('❌ FAIL - Week 1 incomplete')
    console.log(`   - Manual intervention required: ${manualInterventionRequired}`)
    console.log(`   - Final state: ${state.currentState} (expected: CLOSED)`)
    console.log()
  }

  // State transition history
  console.log('📜 State Transition History:')
  state.history.forEach((entry, index) => {
    console.log(`   ${index + 1}. ${entry.fromState} → ${entry.toState}`)
    console.log(`      Event: ${entry.event.type}`)
    console.log(`      Time: ${entry.timestamp}`)
  })
  console.log()

  // Failure summary
  if (failures.length > 0) {
    console.log('⚠️  Failures Logged:')
    failures.forEach((failure, index) => {
      console.log(`   ${index + 1}. ${failure.step}`)
      console.log(`      Error: ${failure.error}`)
    })
    console.log()
  }

  // Test log summary
  console.log('📊 Test Log Summary:')
  const logSummary = {
    total: logs.length,
    info: logs.filter(l => l.level === 'INFO').length,
    success: logs.filter(l => l.level === 'SUCCESS').length,
    warnings: logs.filter(l => l.level === 'WARN').length,
    errors: logs.filter(l => l.level === 'ERROR').length
  }
  console.log(`   Total entries: ${logSummary.total}`)
  console.log(`   ℹ️  Info: ${logSummary.info}`)
  console.log(`   ✅ Success: ${logSummary.success}`)
  console.log(`   ⚠️  Warnings: ${logSummary.warnings}`)
  console.log(`   ❌ Errors: ${logSummary.errors}`)
  console.log()

  return {
    passed: weekPassed,
    state,
    failures,
    logs,
    manualInterventionRequired
  }
}

/**
 * Run the field test.
 * Execute with: npm run test:field
 */
runFieldTest()
  .then(result => {
    if (result.passed) {
      console.log('✅ Field test PASSED')
      process.exit(0)
    } else {
      console.log('❌ Field test FAILED')
      process.exit(1)
    }
  })
  .catch(error => {
    console.error('💥 Field test crashed:', error)
    process.exit(1)
  })
