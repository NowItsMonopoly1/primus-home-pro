/**
 * PRIMUS KERNEL INTERFACE (READ-ONLY)
 *
 * This is a vendored contract from Primus Kernel.
 * DO NOT MODIFY THIS FILE.
 *
 * The kernel owns all business logic, rules, and intelligence.
 * ForgeExec consumes this interface as a closed dependency.
 */

export interface KernelDecision {
  readonly accepted: boolean
  readonly reason?: string
  readonly nextState?: JobState
  readonly outputs?: ReadonlyArray<KernelOutput>
}

export interface KernelOutput {
  readonly type: OutputType
  readonly payload: Readonly<Record<string, unknown>>
  readonly timestamp: string
}

export type OutputType =
  | 'INVOICE_READY'
  | 'APPROVAL_REQUIRED'
  | 'JOB_COMPLETED'
  | 'PAYMENT_RECEIVED'
  | 'ALERT_RAISED'
  | 'DISPATCH_REQUIRED'
  | 'INSPECTION_REQUIRED'

export type JobState =
  | 'LEAD_RECEIVED'
  | 'SCHEDULED'
  | 'DISPATCHED'
  | 'ON_SITE'
  | 'WORK_COMPLETED'
  | 'INSPECTION_PASSED'
  | 'INVOICED'
  | 'CLOSED'

export interface DecisionRequest {
  readonly currentState: JobState
  readonly proposedState: JobState
  readonly event: Readonly<ExecutionEvent>
  readonly context: Readonly<JobContext>
}

export interface ExecutionEvent {
  readonly type: string
  readonly payload: Readonly<Record<string, unknown>>
  readonly timestamp: string
  readonly sourceId: string
}

export interface JobContext {
  readonly jobId: string
  readonly customerId: string
  readonly vertical: string
  readonly jobType: string
  readonly metadata: Readonly<Record<string, unknown>>
}

export interface KernelInterface {
  /**
   * Submit a state transition request to the kernel.
   * The kernel decides if the transition is allowed.
   *
   * @returns KernelDecision with accept/reject and next state
   */
  decide(request: DecisionRequest): Promise<KernelDecision>
}
