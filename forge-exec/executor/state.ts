/**
 * FORGEEXEC STATE DEFINITIONS
 *
 * DO NOT ADD LOGIC HERE.
 * Only add new states to existing enums.
 * All state transitions must return new state objects (immutability).
 */

import type { JobState, ExecutionEvent } from '../kernel-client/interface'

export interface ExecutionState {
  readonly jobId: string
  readonly currentState: JobState
  readonly history: ReadonlyArray<StateTransition>
  readonly pendingOutputs: ReadonlyArray<PendingOutput>
}

export interface StateTransition {
  readonly fromState: JobState
  readonly toState: JobState
  readonly event: Readonly<ExecutionEvent>
  readonly timestamp: string
  readonly accepted: boolean
  readonly reason?: string
}

export interface PendingOutput {
  readonly type: string
  readonly payload: Readonly<Record<string, unknown>>
  readonly timestamp: string
}

/**
 * Create initial execution state.
 * DO NOT ADD BUSINESS LOGIC.
 */
export function createInitialState(
  jobId: string,
  initialState: JobState
): ExecutionState {
  return {
    jobId,
    currentState: initialState,
    history: [],
    pendingOutputs: []
  }
}

/**
 * Transition state to new state.
 * DO NOT MUTATE. Return new state object.
 */
export function transitionState(
  current: Readonly<ExecutionState>,
  transition: StateTransition,
  outputs: ReadonlyArray<PendingOutput>
): ExecutionState {
  return {
    ...current,
    currentState: transition.toState,
    history: [...current.history, transition],
    pendingOutputs: [...current.pendingOutputs, ...outputs]
  }
}

/**
 * Clear pending outputs after adapter execution.
 * DO NOT MUTATE. Return new state object.
 */
export function clearPendingOutputs(
  current: Readonly<ExecutionState>
): ExecutionState {
  return {
    ...current,
    pendingOutputs: []
  }
}
