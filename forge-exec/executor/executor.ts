/**
 * FORGEEXEC EXECUTOR
 *
 * DO NOT ADD BUSINESS LOGIC HERE.
 * This is execution-only. All decisions come from Primus Kernel.
 *
 * Responsibilities:
 * - Validate state
 * - Assemble decision requests
 * - Enforce state transitions
 * - Emit outputs to adapters
 *
 * Forbidden:
 * - Business logic
 * - Conditional branching based on domain rules
 * - IO/network calls
 * - Nondeterministic operations
 * - State mutation
 * - Event mutation
 */

import type {
  KernelInterface,
  DecisionRequest,
  ExecutionEvent,
  JobContext,
  KernelOutput
} from '../kernel-client/interface'
import type { ExecutionState, StateTransition, PendingOutput } from './state'
import { transitionState, clearPendingOutputs } from './state'

export interface ExecutorConfig {
  readonly kernel: KernelInterface
}

export interface ExecutionResult {
  readonly success: boolean
  readonly state: Readonly<ExecutionState>
  readonly outputs: ReadonlyArray<KernelOutput>
  readonly error?: string
}

/**
 * Execute a single event against current state.
 *
 * DO NOT ADD LOGIC HERE.
 * Only implement the execution protocol.
 */
export async function executeEvent(
  config: ExecutorConfig,
  currentState: Readonly<ExecutionState>,
  event: Readonly<ExecutionEvent>,
  context: Readonly<JobContext>
): Promise<ExecutionResult> {
  // Assemble decision request for kernel
  const request: DecisionRequest = {
    currentState: currentState.currentState,
    proposedState: deriveProposedState(event),
    event,
    context
  }

  // Submit to kernel for decision
  const decision = await config.kernel.decide(request)

  // If rejected, return current state unchanged
  if (!decision.accepted) {
    return {
      success: false,
      state: currentState,
      outputs: [],
      error: decision.reason
    }
  }

  // If accepted, transition state
  const transition: StateTransition = {
    fromState: currentState.currentState,
    toState: decision.nextState!,
    event,
    timestamp: event.timestamp,
    accepted: true
  }

  const outputs: ReadonlyArray<PendingOutput> = (decision.outputs || []).map(output => ({
    type: output.type,
    payload: output.payload,
    timestamp: output.timestamp
  }))

  const newState = transitionState(currentState, transition, outputs)

  return {
    success: true,
    state: newState,
    outputs: decision.outputs || [],
    error: undefined
  }
}

/**
 * Derive proposed state from event type.
 *
 * DO NOT ADD BUSINESS LOGIC HERE.
 * This is a simple mapping from event type to proposed state.
 * The kernel makes the final decision.
 */
function deriveProposedState(event: Readonly<ExecutionEvent>) {
  // This is a state table, not business logic
  // Kernel will validate if transition is allowed
  const stateMap: Record<string, any> = {
    'JOB_SCHEDULED': 'SCHEDULED',
    'TECHNICIAN_DISPATCHED': 'DISPATCHED',
    'TECHNICIAN_ARRIVED': 'ON_SITE',
    'WORK_STARTED': 'ON_SITE',
    'WORK_COMPLETED': 'WORK_COMPLETED',
    'INSPECTION_PASSED': 'INSPECTION_PASSED',
    'INVOICE_GENERATED': 'INVOICED',
    'PAYMENT_RECEIVED': 'INVOICED',
    'JOB_CLOSED': 'CLOSED'
  }

  return stateMap[event.type] || 'LEAD_RECEIVED'
}

/**
 * Clear outputs after successful adapter execution.
 *
 * DO NOT ADD LOGIC HERE.
 */
export function acknowledgeOutputs(
  state: Readonly<ExecutionState>
): ExecutionState {
  return clearPendingOutputs(state)
}
