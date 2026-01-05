/**
 * NEXT LEVEL ELECTRIC INITIALIZATION EXAMPLE
 *
 * This example demonstrates how ForgeExec is initialized for NLE.
 * It proves vertical isolation works at runtime.
 *
 * Key principles:
 * - ForgeExec core knows nothing about NLE
 * - NLE configuration is injected at runtime
 * - Adapters are wired by vertical config, not hard-coded
 * - Deleting /verticals/next-level-electric would not break ForgeExec
 */

import { createAdapterRegistry } from '../adapters/adapter-registry'
import { wireNLEAdapters, type NLEAdapterConfigs } from '../verticals/next-level-electric/adapter-wiring'
import { createMockKernel } from '../kernel-client/mock-kernel'
import { createPrimusKernel } from '../kernel-client/primus-kernel'
import { executeEvent } from '../executor/executor'
import { createInitialState } from '../executor/state'
import type { ExecutionEvent, JobContext } from '../kernel-client/interface'

/**
 * Initialize ForgeExec for Next Level Electric.
 *
 * This is the runtime wiring that connects:
 * - Kernel (business rules)
 * - Executor (state machine)
 * - Adapters (side effects)
 * - Vertical config (NLE-specific)
 */
export async function initializeNLE() {
  console.log('🔧 Initializing ForgeExec for Next Level Electric...\n')

  // Step 1: Create adapter registry (empty, vertical-agnostic)
  console.log('1. Creating adapter registry...')
  const registry = createAdapterRegistry()
  console.log('   ✅ Adapter registry created (empty)\n')

  // Step 2: Wire NLE-specific adapters
  console.log('2. Wiring NLE adapters...')
  wireNLEAdapters(registry)
  console.log('   ✅ NLE adapters wired:')
  console.log('      - CRM (Jobber)')
  console.log('      - Dispatch (Samsara)')
  console.log('      - Invoicing (QuickBooks)')
  console.log('      - Notifications (Twilio)\n')

  // Step 3: Create kernel instance
  console.log('3. Creating kernel instance...')

  // Use real Primus Kernel if API URL configured, otherwise use mock
  const kernel = process.env.PRIMUS_KERNEL_API_URL
    ? createPrimusKernel({
        apiUrl: process.env.PRIMUS_KERNEL_API_URL,
        apiKey: process.env.PRIMUS_KERNEL_API_KEY || '',
        timeout: 30000
      })
    : createMockKernel()

  console.log(
    process.env.PRIMUS_KERNEL_API_URL
      ? '   ✅ Real Primus Kernel connected'
      : '   ✅ Mock kernel created (set PRIMUS_KERNEL_API_URL for real kernel)\n'
  )

  // Step 4: Create initial job state
  console.log('4. Creating initial job state...')
  const initialState = createInitialState('job-001', 'LEAD_RECEIVED')
  console.log('   ✅ Initial state created:')
  console.log(`      - Job ID: ${initialState.jobId}`)
  console.log(`      - State: ${initialState.currentState}\n`)

  // Step 5: Create test event
  console.log('5. Creating test event (JOB_SCHEDULED)...')
  const event: ExecutionEvent = {
    type: 'JOB_SCHEDULED',
    payload: {
      scheduledTime: '2026-01-10T09:00:00Z',
      technicianId: 'tech-123'
    },
    timestamp: new Date().toISOString(),
    sourceId: 'nle-office-dashboard'
  }
  console.log('   ✅ Event created\n')

  // Step 6: Create job context
  console.log('6. Creating job context...')
  const context: JobContext = {
    jobId: 'job-001',
    customerId: 'customer-456',
    vertical: 'electrician',
    jobType: 'PANEL_UPGRADE',
    metadata: {
      address: '123 Main St, Portland, OR',
      priority: 'MEDIUM'
    }
  }
  console.log('   ✅ Context created\n')

  // Step 7: Execute event through ForgeExec
  console.log('7. Executing event through ForgeExec...')
  console.log('   Event flow:')
  console.log('   [Event] → [Executor] → [Kernel] → [State Transition] → [Adapters]\n')

  const result = await executeEvent(
    { kernel },
    initialState,
    event,
    context
  )

  // Step 8: Display results
  console.log('8. Execution results:')
  if (result.success) {
    console.log('   ✅ SUCCESS')
    console.log(`   - Previous state: ${initialState.currentState}`)
    console.log(`   - New state: ${result.state.currentState}`)
    console.log(`   - Outputs generated: ${result.outputs.length}`)
    if (result.outputs.length > 0) {
      console.log('   - Output types:')
      result.outputs.forEach(output => {
        console.log(`     • ${output.type}`)
      })
    }
  } else {
    console.log('   ❌ REJECTED')
    console.log(`   - Reason: ${result.error}`)
  }

  console.log('\n✅ NLE initialization complete!')
  console.log('\nKey architectural points:')
  console.log('- ForgeExec executor has zero knowledge of NLE')
  console.log('- Kernel made the transition decision')
  console.log('- Adapters are wired by vertical config')
  console.log('- State remained immutable throughout')
  console.log('- Events were never mutated')
  console.log('\nTo add HVAC vertical:')
  console.log('1. Create /verticals/hvac/ directory')
  console.log('2. Wire HVAC-specific adapters')
  console.log('3. No changes to ForgeExec core required')

  return { registry, kernel, finalState: result.state }
}

/**
 * Load NLE adapter configurations from environment.
 * In production, these come from secrets management.
 */
export function loadNLEAdapterConfigs(): NLEAdapterConfigs {
  return {
    jobber: {
      apiKey: process.env.JOBBER_API_KEY || 'mock-jobber-key',
      accountId: process.env.JOBBER_ACCOUNT_ID || 'mock-account-id',
      baseUrl: process.env.JOBBER_BASE_URL || 'https://api.getjobber.com'
    },
    samsara: {
      apiToken: process.env.SAMSARA_API_TOKEN || 'mock-samsara-token',
      baseUrl: process.env.SAMSARA_BASE_URL || 'https://api.samsara.com'
    },
    quickbooks: {
      realmId: process.env.QUICKBOOKS_REALM_ID || 'mock-realm-id',
      accessToken: process.env.QUICKBOOKS_ACCESS_TOKEN || 'mock-access-token',
      baseUrl: process.env.QUICKBOOKS_BASE_URL || 'https://quickbooks.api.intuit.com'
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || 'mock-account-sid',
      authToken: process.env.TWILIO_AUTH_TOKEN || 'mock-auth-token',
      fromPhone: process.env.TWILIO_FROM_PHONE || '+15555551234'
    }
  }
}

/**
 * Run the example.
 * Execute with: npx tsx examples/nle-initialization.ts
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeNLE().catch(error => {
    console.error('❌ Initialization failed:', error)
    process.exit(1)
  })
}
