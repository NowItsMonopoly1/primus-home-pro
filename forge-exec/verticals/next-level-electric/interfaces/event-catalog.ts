/**
 * NLE EVENT CATALOG (FROZEN)
 *
 * This is the authoritative list of ALL events the NLE UI can emit.
 * Once frozen, these become hard contracts.
 *
 * DO NOT ADD LOGIC HERE - only event type definitions.
 *
 * Event Flow:
 * UI emits event → ForgeExec executes → Kernel decides → State transitions
 *
 * UI NEVER:
 * - Assumes success
 * - Computes next state
 * - Adds business logic
 * - Optimistically updates
 */

import type { ExecutionEvent } from '../../../kernel-client/interface'

/**
 * =============================================================================
 * TECHNICIAN APP EVENTS
 * =============================================================================
 */

/**
 * Technician clocks in for shift
 * Emitted by: Technician App - Clock In Screen
 */
export interface TechnicianClockedInEvent extends ExecutionEvent {
  readonly type: 'TECHNICIAN_CLOCKED_IN'
  readonly payload: {
    readonly technicianId: string
    readonly latitude: number
    readonly longitude: number
    readonly accuracy: number
    readonly timestamp: string
  }
}

/**
 * Technician clocks out from shift
 * Emitted by: Technician App - Clock Out Screen
 */
export interface TechnicianClockedOutEvent extends ExecutionEvent {
  readonly type: 'TECHNICIAN_CLOCKED_OUT'
  readonly payload: {
    readonly technicianId: string
    readonly latitude: number
    readonly longitude: number
    readonly accuracy: number
    readonly timestamp: string
  }
}

/**
 * Technician arrives at job site
 * Emitted by: Technician App - Job Detail Screen → "Arrive" button
 */
export interface TechnicianArrivedEvent extends ExecutionEvent {
  readonly type: 'TECHNICIAN_ARRIVED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly latitude: number
    readonly longitude: number
    readonly accuracy: number
    readonly timestamp: string
  }
}

/**
 * Technician starts work on job
 * Emitted by: Technician App - Job Detail Screen → "Start Work" button
 */
export interface WorkStartedEvent extends ExecutionEvent {
  readonly type: 'WORK_STARTED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly timestamp: string
  }
}

/**
 * Technician completes work on job
 * Emitted by: Technician App - Work Capture Screen → "Complete Work" button
 */
export interface WorkCompletedEvent extends ExecutionEvent {
  readonly type: 'WORK_COMPLETED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly laborHours: number
    readonly requiresInspection: boolean
    readonly notes?: string
    readonly timestamp: string
  }
}

/**
 * Technician logs materials used
 * Emitted by: Technician App - Materials Log Screen → "Log Materials" button
 */
export interface MaterialsLoggedEvent extends ExecutionEvent {
  readonly type: 'MATERIALS_LOGGED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly materials: ReadonlyArray<{
      readonly itemId: string
      readonly description: string
      readonly quantity: number
      readonly source: 'VAN' | 'PURCHASED'
      readonly cost?: number
      readonly vendor?: string
      readonly receiptUrl?: string
    }>
    readonly timestamp: string
  }
}

/**
 * Technician requests change order
 * Emitted by: Technician App - Change Order Screen → "Submit Request" button
 */
export interface ChangeOrderRequestedEvent extends ExecutionEvent {
  readonly type: 'CHANGE_ORDER_REQUESTED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly description: string
    readonly estimatedCost: number
    readonly estimatedTime: number
    readonly reason: string
    readonly photos: ReadonlyArray<string>
    readonly priority: 'LOW' | 'MEDIUM' | 'HIGH'
    readonly timestamp: string
  }
}

/**
 * Technician captures photo
 * Emitted by: Technician App - Work Capture Screen → "Capture Photo" button
 */
export interface PhotoCapturedEvent extends ExecutionEvent {
  readonly type: 'PHOTO_CAPTURED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly photoUrl: string
    readonly caption?: string
    readonly timestamp: string
  }
}

/**
 * Technician records voice note
 * Emitted by: Technician App - Work Capture Screen → "Record Note" button
 */
export interface VoiceNoteRecordedEvent extends ExecutionEvent {
  readonly type: 'VOICE_NOTE_RECORDED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly audioUrl: string
    readonly duration: number
    readonly timestamp: string
  }
}

/**
 * =============================================================================
 * OFFICE DASHBOARD EVENTS
 * =============================================================================
 */

/**
 * Office approves change order
 * Emitted by: Office Dashboard - Change Orders Screen → "Approve" button
 */
export interface ChangeOrderApprovedEvent extends ExecutionEvent {
  readonly type: 'CHANGE_ORDER_APPROVED'
  readonly payload: {
    readonly jobId: string
    readonly changeOrderId: string
    readonly approvedBy: string
    readonly approvalNotes?: string
    readonly timestamp: string
  }
}

/**
 * Office rejects change order
 * Emitted by: Office Dashboard - Change Orders Screen → "Reject" button
 */
export interface ChangeOrderRejectedEvent extends ExecutionEvent {
  readonly type: 'CHANGE_ORDER_REJECTED'
  readonly payload: {
    readonly jobId: string
    readonly changeOrderId: string
    readonly rejectedBy: string
    readonly rejectionReason: string
    readonly timestamp: string
  }
}

/**
 * Office generates invoice for completed job
 * Emitted by: Office Dashboard - Invoicing Screen → "Generate Invoice" button
 */
export interface InvoiceGeneratedEvent extends ExecutionEvent {
  readonly type: 'INVOICE_GENERATED'
  readonly payload: {
    readonly jobId: string
    readonly generatedBy: string
    readonly timestamp: string
  }
}

/**
 * Office creates new job
 * Emitted by: Office Dashboard - Job Board Screen → "Create Job" button
 */
export interface JobCreatedEvent extends ExecutionEvent {
  readonly type: 'JOB_CREATED'
  readonly payload: {
    readonly jobId: string
    readonly customerId: string
    readonly customerName: string
    readonly address: string
    readonly jobType: string
    readonly scheduledTime: string
    readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
    readonly estimatedDuration: number
    readonly jobNotes?: string
    readonly createdBy: string
    readonly timestamp: string
  }
}

/**
 * Office schedules job
 * Emitted by: Office Dashboard - Job Board Screen → "Schedule Job" button
 */
export interface JobScheduledEvent extends ExecutionEvent {
  readonly type: 'JOB_SCHEDULED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly scheduledTime: string
    readonly estimatedDuration: number
    readonly scheduledBy: string
    readonly timestamp: string
  }
}

/**
 * Office dispatches technician to job
 * Emitted by: Office Dashboard - Job Board Screen → "Dispatch" button
 */
export interface TechnicianDispatchedEvent extends ExecutionEvent {
  readonly type: 'TECHNICIAN_DISPATCHED'
  readonly payload: {
    readonly jobId: string
    readonly technicianId: string
    readonly dispatchedBy: string
    readonly timestamp: string
  }
}

/**
 * Office cancels job
 * Emitted by: Office Dashboard - Job Detail Screen → "Cancel Job" button
 */
export interface JobCancelledEvent extends ExecutionEvent {
  readonly type: 'JOB_CANCELLED'
  readonly payload: {
    readonly jobId: string
    readonly cancelledBy: string
    readonly cancellationReason: string
    readonly timestamp: string
  }
}

/**
 * Office reschedules job
 * Emitted by: Office Dashboard - Job Detail Screen → "Reschedule" button
 */
export interface JobRescheduledEvent extends ExecutionEvent {
  readonly type: 'JOB_RESCHEDULED'
  readonly payload: {
    readonly jobId: string
    readonly newScheduledTime: string
    readonly rescheduledBy: string
    readonly reason?: string
    readonly timestamp: string
  }
}

/**
 * =============================================================================
 * EVENT TYPE UNION
 * =============================================================================
 */

/**
 * All possible NLE events
 */
export type NLEEvent =
  | TechnicianClockedInEvent
  | TechnicianClockedOutEvent
  | TechnicianArrivedEvent
  | WorkStartedEvent
  | WorkCompletedEvent
  | MaterialsLoggedEvent
  | ChangeOrderRequestedEvent
  | PhotoCapturedEvent
  | VoiceNoteRecordedEvent
  | ChangeOrderApprovedEvent
  | ChangeOrderRejectedEvent
  | InvoiceGeneratedEvent
  | JobCreatedEvent
  | JobScheduledEvent
  | TechnicianDispatchedEvent
  | JobCancelledEvent
  | JobRescheduledEvent

/**
 * =============================================================================
 * EVENT EMISSION PATTERN
 * =============================================================================
 *
 * UI components must follow this pattern:
 *
 * ```typescript
 * // ✅ CORRECT: Emit event, await acknowledgement, react to state change
 * async function handleArriveButton() {
 *   const event: TechnicianArrivedEvent = {
 *     type: 'TECHNICIAN_ARRIVED',
 *     payload: {
 *       jobId: currentJob.id,
 *       technicianId: currentTechnician.id,
 *       latitude: gps.latitude,
 *       longitude: gps.longitude,
 *       accuracy: gps.accuracy,
 *       timestamp: new Date().toISOString()
 *     },
 *     timestamp: new Date().toISOString(),
 *     sourceId: 'technician-app'
 *   }
 *
 *   await emitEvent(event)
 *
 *   // Wait for state update from ForgeExec
 *   // DO NOT optimistically update UI
 * }
 *
 * // ❌ WRONG: Compute next state, optimistically update
 * async function handleArriveButton() {
 *   setJobStatus('ON_SITE') // NO! Kernel decides this
 *   await api.arrive(jobId)  // NO! Not a direct API call
 * }
 * ```
 */
