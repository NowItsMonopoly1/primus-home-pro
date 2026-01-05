/**
 * CLI EVENT SOURCE (THIN REALITY INTERFACE)
 *
 * This is a minimal event source that demonstrates how real-world inputs
 * feed into ForgeExec with ZERO INTELLIGENCE.
 *
 * DO NOT ADD LOGIC HERE - this is a dumb event emitter only.
 *
 * Purpose:
 * - Accept user input from command line
 * - Convert to ExecutionEvent
 * - Pass to ForgeExec
 * - Display result
 *
 * Forbidden:
 * - Validation of event data
 * - State computation
 * - Business rules
 * - Conditional logic
 */

import * as readline from 'readline/promises'
import { stdin, stdout } from 'process'
import { createAdapterRegistry } from '../adapters/adapter-registry'
import { wireNLEAdapters } from '../verticals/next-level-electric/adapter-wiring'
import { createMockKernel } from '../kernel-client/mock-kernel'
import { executeEvent } from '../executor/executor'
import { createInitialState } from '../executor/state'
import type { ExecutionEvent, JobContext } from '../kernel-client/interface'

/**
 * Run the CLI event source.
 * This is a thin reality interface - NO LOGIC.
 */
async function main() {
  console.log('🔧 ForgeExec CLI Event Source\n')
  console.log('This is a THIN REALITY INTERFACE - it has zero intelligence.')
  console.log('It accepts events and passes them to ForgeExec verbatim.\n')

  // Initialize ForgeExec
  const registry = createAdapterRegistry()
  wireNLEAdapters(registry)
  const kernel = createMockKernel()

  console.log('✅ ForgeExec initialized with MockKernel\n')

  // Create initial job state
  const jobId = 'job-cli-001'
  let state = createInitialState(jobId, 'LEAD_RECEIVED')

  console.log(`📋 Job created: ${jobId}`)
  console.log(`   Initial state: ${state.currentState}\n`)

  const context: JobContext = {
    jobId,
    customerId: 'customer-cli-001',
    vertical: 'electrician',
    jobType: 'PANEL_UPGRADE',
    metadata: {
      source: 'cli'
    }
  }

  // Event loop - accept user commands
  const rl = readline.createInterface({ input: stdin, output: stdout })

  console.log('Available commands:')
  console.log('  schedule    - Emit JOB_SCHEDULED event')
  console.log('  dispatch    - Emit TECHNICIAN_DISPATCHED event')
  console.log('  arrive      - Emit TECHNICIAN_ARRIVED event')
  console.log('  start       - Emit WORK_STARTED event')
  console.log('  complete    - Emit WORK_COMPLETED event')
  console.log('  status      - Show current job state')
  console.log('  quit        - Exit\n')

  let running = true

  while (running) {
    const command = await rl.question('> ')

    switch (command.trim().toLowerCase()) {
      case 'schedule': {
        const event: ExecutionEvent = {
          type: 'JOB_SCHEDULED',
          payload: {
            scheduledTime: new Date().toISOString(),
            technicianId: 'tech-cli-001'
          },
          timestamp: new Date().toISOString(),
          sourceId: 'cli'
        }

        console.log('\n📤 Emitting event:', event.type)
        const result = await executeEvent({ kernel }, state, event, context)

        if (result.success) {
          state = result.state
          console.log(`✅ Success - State: ${state.currentState}`)
          if (result.outputs.length > 0) {
            console.log(`   Outputs generated: ${result.outputs.length}`)
            result.outputs.forEach(o => console.log(`   - ${o.type}`))
          }
        } else {
          console.log(`❌ Rejected - ${result.error}`)
          console.log(`   State unchanged: ${state.currentState}`)
        }
        console.log()
        break
      }

      case 'dispatch': {
        const event: ExecutionEvent = {
          type: 'TECHNICIAN_DISPATCHED',
          payload: {
            technicianId: 'tech-cli-001'
          },
          timestamp: new Date().toISOString(),
          sourceId: 'cli'
        }

        console.log('\n📤 Emitting event:', event.type)
        const result = await executeEvent({ kernel }, state, event, context)

        if (result.success) {
          state = result.state
          console.log(`✅ Success - State: ${state.currentState}`)
          if (result.outputs.length > 0) {
            console.log(`   Outputs generated: ${result.outputs.length}`)
            result.outputs.forEach(o => console.log(`   - ${o.type}`))
          }
        } else {
          console.log(`❌ Rejected - ${result.error}`)
          console.log(`   State unchanged: ${state.currentState}`)
        }
        console.log()
        break
      }

      case 'arrive': {
        const event: ExecutionEvent = {
          type: 'TECHNICIAN_ARRIVED',
          payload: {
            technicianId: 'tech-cli-001',
            latitude: 45.5231,
            longitude: -122.6765
          },
          timestamp: new Date().toISOString(),
          sourceId: 'cli'
        }

        console.log('\n📤 Emitting event:', event.type)
        const result = await executeEvent({ kernel }, state, event, context)

        if (result.success) {
          state = result.state
          console.log(`✅ Success - State: ${state.currentState}`)
          if (result.outputs.length > 0) {
            console.log(`   Outputs generated: ${result.outputs.length}`)
            result.outputs.forEach(o => console.log(`   - ${o.type}`))
          }
        } else {
          console.log(`❌ Rejected - ${result.error}`)
          console.log(`   State unchanged: ${state.currentState}`)
        }
        console.log()
        break
      }

      case 'start': {
        const event: ExecutionEvent = {
          type: 'WORK_STARTED',
          payload: {
            technicianId: 'tech-cli-001'
          },
          timestamp: new Date().toISOString(),
          sourceId: 'cli'
        }

        console.log('\n📤 Emitting event:', event.type)
        const result = await executeEvent({ kernel }, state, event, context)

        if (result.success) {
          state = result.state
          console.log(`✅ Success - State: ${state.currentState}`)
          if (result.outputs.length > 0) {
            console.log(`   Outputs generated: ${result.outputs.length}`)
            result.outputs.forEach(o => console.log(`   - ${o.type}`))
          }
        } else {
          console.log(`❌ Rejected - ${result.error}`)
          console.log(`   State unchanged: ${state.currentState}`)
        }
        console.log()
        break
      }

      case 'complete': {
        const event: ExecutionEvent = {
          type: 'WORK_COMPLETED',
          payload: {
            technicianId: 'tech-cli-001',
            laborHours: 2.5,
            requiresInspection: false
          },
          timestamp: new Date().toISOString(),
          sourceId: 'cli'
        }

        console.log('\n📤 Emitting event:', event.type)
        const result = await executeEvent({ kernel }, state, event, context)

        if (result.success) {
          state = result.state
          console.log(`✅ Success - State: ${state.currentState}`)
          if (result.outputs.length > 0) {
            console.log(`   Outputs generated: ${result.outputs.length}`)
            result.outputs.forEach(o => console.log(`   - ${o.type}`))
          }
        } else {
          console.log(`❌ Rejected - ${result.error}`)
          console.log(`   State unchanged: ${state.currentState}`)
        }
        console.log()
        break
      }

      case 'status': {
        console.log('\n📊 Current Job State:')
        console.log(`   Job ID: ${state.jobId}`)
        console.log(`   State: ${state.currentState}`)
        console.log(`   History entries: ${state.history.length}`)
        console.log(`   Pending outputs: ${state.pendingOutputs.length}`)
        console.log()
        break
      }

      case 'quit':
      case 'exit':
      case 'q': {
        console.log('\n👋 Exiting CLI event source\n')
        running = false
        break
      }

      default: {
        console.log(`\n❓ Unknown command: ${command}`)
        console.log('   Type "status" to see current state or "quit" to exit\n')
        break
      }
    }
  }

  rl.close()
}

/**
 * Run the CLI event source.
 * Execute with: npx tsx examples/cli-event-source.ts
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('❌ CLI event source failed:', error)
    process.exit(1)
  })
}
