/**
 * MOCK KERNEL FOR TESTING
 *
 * This is a test implementation of the Primus Kernel interface.
 * It allows executor testing without a real kernel connection.
 *
 * DO NOT USE IN PRODUCTION.
 * DO NOT ADD BUSINESS LOGIC HERE - this is for testing only.
 *
 * The real Primus Kernel owns all business rules and intelligence.
 * This mock accepts all valid state transitions for testing purposes.
 */

import type {
  KernelInterface,
  DecisionRequest,
  KernelDecision,
  JobState,
  OutputType
} from './interface'

/**
 * Valid state transitions for testing.
 * This is a simplified state machine for executor testing only.
 *
 * Real business rules live in Primus Kernel.
 */
const VALID_TRANSITIONS: Record<JobState, ReadonlyArray<JobState>> = {
  'LEAD_RECEIVED': ['SCHEDULED'],
  'SCHEDULED': ['DISPATCHED'],
  'DISPATCHED': ['ON_SITE'],
  'ON_SITE': ['WORK_COMPLETED'],
  'WORK_COMPLETED': ['INSPECTION_PASSED', 'INVOICED'],
  'INSPECTION_PASSED': ['INVOICED'],
  'INVOICED': ['CLOSED'],
  'CLOSED': []
}

/**
 * Mock kernel implementation.
 * Accepts valid transitions, rejects invalid ones.
 *
 * NO BUSINESS LOGIC - just state machine validation for testing.
 */
export class MockKernel implements KernelInterface {
  /**
   * Decide if a state transition is allowed.
   * This is a simplified test implementation.
   */
  async decide(request: DecisionRequest): Promise<KernelDecision> {
    const { currentState, proposedState } = request

    // Check if transition is valid
    const allowedNextStates = VALID_TRANSITIONS[currentState]

    if (!allowedNextStates.includes(proposedState)) {
      return {
        accepted: false,
        reason: `Invalid transition: ${currentState} -> ${proposedState}`
      }
    }

    // Accept transition and generate outputs
    const outputs = this.generateOutputs(proposedState, request)

    return {
      accepted: true,
      nextState: proposedState,
      outputs
    }
  }

  /**
   * Generate mock outputs for testing.
   * Real output generation happens in Primus Kernel.
   *
   * DO NOT ADD BUSINESS LOGIC - this is test data only.
   */
  private generateOutputs(
    nextState: JobState,
    request: DecisionRequest
  ) {
    const outputs: Array<{ type: OutputType; payload: Record<string, unknown>; timestamp: string }> = []

    // Generate outputs based on state transitions (for testing only)
    switch (nextState) {
      case 'DISPATCHED':
        outputs.push({
          type: 'DISPATCH_REQUIRED',
          payload: {
            jobId: request.context.jobId,
            customerId: request.context.customerId
          },
          timestamp: new Date().toISOString()
        })
        break

      case 'WORK_COMPLETED':
        outputs.push({
          type: 'JOB_COMPLETED',
          payload: {
            jobId: request.context.jobId,
            status: 'completed'
          },
          timestamp: new Date().toISOString()
        })
        break

      case 'INSPECTION_PASSED':
        outputs.push({
          type: 'INSPECTION_REQUIRED',
          payload: {
            jobId: request.context.jobId,
            inspectionType: 'final'
          },
          timestamp: new Date().toISOString()
        })
        break

      case 'INVOICED':
        outputs.push({
          type: 'INVOICE_READY',
          payload: {
            jobId: request.context.jobId,
            customerId: request.context.customerId
          },
          timestamp: new Date().toISOString()
        })
        break

      case 'CLOSED':
        outputs.push({
          type: 'ALERT_RAISED',
          payload: {
            jobId: request.context.jobId,
            message: 'Job closed successfully'
          },
          timestamp: new Date().toISOString()
        })
        break
    }

    return outputs
  }
}

/**
 * Create a mock kernel instance for testing.
 */
export function createMockKernel(): KernelInterface {
  return new MockKernel()
}
