/**
 * NEXT LEVEL ELECTRIC VERTICAL CONFIGURATION
 *
 * This file configures ForgeExec for the electrician vertical.
 * It does NOT contain business logic.
 *
 * Allowed:
 * - Job type definitions
 * - State machine configuration
 * - Adapter wiring
 *
 * Forbidden:
 * - Business rules (belong in Kernel)
 * - Execution logic (belongs in ForgeExec)
 * - Adapter logic (belongs in adapter implementations)
 */

import type { JobState } from '../../kernel-client/interface'

export const NLE_VERTICAL_ID = 'electrician'

export type NLEJobType =
  | 'SERVICE_CALL'
  | 'PANEL_UPGRADE'
  | 'EV_CHARGER_INSTALL'
  | 'EMERGENCY_REPAIR'
  | 'NEW_INSTALLATION'
  | 'INSPECTION'

export interface NLEJobConfig {
  readonly vertical: typeof NLE_VERTICAL_ID
  readonly jobType: NLEJobType
  readonly initialState: JobState
}

/**
 * Valid state transitions for electrician jobs.
 * This is configuration, not logic.
 * The kernel validates if a specific transition is allowed.
 */
export const NLE_STATE_FLOW: ReadonlyArray<JobState> = [
  'LEAD_RECEIVED',
  'SCHEDULED',
  'DISPATCHED',
  'ON_SITE',
  'WORK_COMPLETED',
  'INSPECTION_PASSED',
  'INVOICED',
  'CLOSED'
]

/**
 * Adapter configuration for NLE.
 * Maps output types to adapter implementations.
 */
export interface NLEAdapterConfig {
  readonly crmAdapter: string
  readonly dispatchAdapter: string
  readonly invoicingAdapter: string
  readonly gpsAdapter: string
  readonly notificationAdapter: string
}

export const NLE_ADAPTER_CONFIG: NLEAdapterConfig = {
  crmAdapter: 'jobber', // or 'servicetitan' or 'custom'
  dispatchAdapter: 'samsara',
  invoicingAdapter: 'quickbooks',
  gpsAdapter: 'samsara',
  notificationAdapter: 'twilio'
}
