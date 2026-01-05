/**
 * NEXT LEVEL ELECTRIC EVENT DEFINITIONS
 *
 * This file defines the event types that NLE mobile app and office systems emit.
 * These are data structures, not logic.
 *
 * DO NOT ADD BUSINESS LOGIC HERE.
 */

import type { ExecutionEvent } from '../../kernel-client/interface'

/**
 * Event types emitted by NLE systems
 */
export type NLEEventType =
  | 'JOB_SCHEDULED'
  | 'TECHNICIAN_DISPATCHED'
  | 'TECHNICIAN_ARRIVED'
  | 'WORK_STARTED'
  | 'WORK_COMPLETED'
  | 'MATERIALS_LOGGED'
  | 'CHANGE_ORDER_REQUESTED'
  | 'PHOTO_CAPTURED'
  | 'VOICE_NOTE_RECORDED'
  | 'INSPECTION_SCHEDULED'
  | 'INSPECTION_PASSED'
  | 'INSPECTION_FAILED'
  | 'INVOICE_GENERATED'
  | 'PAYMENT_RECEIVED'
  | 'JOB_CLOSED'

/**
 * Technician clock-in event payload
 */
export interface TechnicianArrivedPayload {
  readonly technicianId: string
  readonly jobId: string
  readonly gpsLocation: {
    readonly latitude: number
    readonly longitude: number
  }
  readonly arrivalTime: string
}

/**
 * Work completion event payload
 */
export interface WorkCompletedPayload {
  readonly jobId: string
  readonly technicianId: string
  readonly completionTime: string
  readonly laborHours: number
  readonly materialsUsed: ReadonlyArray<MaterialUsed>
  readonly photos: ReadonlyArray<string>
  readonly notes?: string
}

/**
 * Material usage payload
 */
export interface MaterialUsed {
  readonly itemId: string
  readonly description: string
  readonly quantity: number
  readonly source: 'VAN' | 'PURCHASED'
  readonly cost?: number
}

/**
 * Change order request payload
 */
export interface ChangeOrderPayload {
  readonly jobId: string
  readonly description: string
  readonly estimatedCost: number
  readonly estimatedTime: number
  readonly reason: string
  readonly photos: ReadonlyArray<string>
}

/**
 * Helper to create type-safe NLE events
 * DO NOT ADD LOGIC HERE - this is data construction only
 */
export function createNLEEvent<T extends Record<string, unknown>>(
  type: NLEEventType,
  payload: Readonly<T>,
  sourceId: string
): ExecutionEvent {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
    sourceId
  }
}
