/**
 * NLE UI CONTRACTS (FROZEN)
 *
 * This file defines the ONLY operations UIs can perform:
 * 1. Emit events (write)
 * 2. Receive state snapshots (read)
 *
 * NO LOGIC. NO DERIVATION. NO DECISIONS.
 *
 * UIs are dumb terminals that:
 * - Display data exactly as received
 * - Emit events exactly as user actions occur
 * - Wait for ForgeExec to update state
 */

import type { JobState, ExecutionEvent } from '../../../kernel-client/interface'

/**
 * =============================================================================
 * TECHNICIAN APP CONTRACT
 * =============================================================================
 */

/**
 * Technician App Event Emitter
 *
 * This is the ONLY write interface for the technician app.
 * All methods emit events and return immediately.
 */
export interface TechnicianAppEmitter {
  /**
   * Clock in/out events
   * Event types: TECHNICIAN_CLOCKED_IN, TECHNICIAN_CLOCKED_OUT
   */
  emitEvent(event: ExecutionEvent): Promise<void>
}

/**
 * Technician App State Receiver
 *
 * This is the ONLY read interface for the technician app.
 * All data is passed verbatim from ForgeExec - NO TRANSFORMATION.
 */
export interface TechnicianAppState {
  /**
   * Current technician session
   */
  readonly session: {
    readonly technicianId: string
    readonly technicianName: string
    readonly clockInTime: string | null
    readonly currentJobId: string | null
  }

  /**
   * Assigned jobs (raw list from ForgeExec)
   */
  readonly assignedJobs: ReadonlyArray<{
    readonly jobId: string
    readonly customerName: string
    readonly address: string
    readonly jobType: string
    readonly scheduledTime: string
    readonly currentState: JobState
  }>

  /**
   * Current job detail (if job selected)
   */
  readonly currentJob: {
    readonly jobId: string
    readonly customerName: string
    readonly customerPhone: string
    readonly address: string
    readonly jobType: string
    readonly jobNotes: string
    readonly currentState: JobState
    readonly workStartTime: string | null
    readonly photosUploaded: ReadonlyArray<string>
    readonly voiceNotesUploaded: ReadonlyArray<string>
  } | null

  /**
   * Van inventory (read-only from external system)
   */
  readonly vanInventory: ReadonlyArray<{
    readonly itemId: string
    readonly description: string
    readonly quantityAvailable: number
    readonly unitCost: number
  }>
}

/**
 * =============================================================================
 * OFFICE DASHBOARD CONTRACT
 * =============================================================================
 */

/**
 * Office Dashboard Event Emitter
 *
 * This is the ONLY write interface for the office dashboard.
 * All methods emit events and return immediately.
 */
export interface OfficeDashboardEmitter {
  /**
   * All office dashboard events
   * Event types: JOB_CREATED, JOB_SCHEDULED, TECHNICIAN_DISPATCHED, etc.
   * See event-catalog.ts for full list
   */
  emitEvent(event: ExecutionEvent): Promise<void>
}

/**
 * Office Dashboard State Receiver
 *
 * This is the ONLY read interface for the office dashboard.
 * All data is passed verbatim from ForgeExec - NO TRANSFORMATION.
 */
export interface OfficeDashboardState {
  /**
   * All jobs (raw list from ForgeExec)
   */
  readonly jobs: ReadonlyArray<{
    readonly jobId: string
    readonly customerId: string
    readonly customerName: string
    readonly address: string
    readonly jobType: string
    readonly currentState: JobState
    readonly assignedTechnicianId: string | null
    readonly scheduledTime: string | null
    readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
  }>

  /**
   * All technicians (raw list from external system)
   */
  readonly technicians: ReadonlyArray<{
    readonly technicianId: string
    readonly name: string
    readonly clockedIn: boolean
    readonly currentJobId: string | null
    readonly lastGPSLatitude: number | null
    readonly lastGPSLongitude: number | null
    readonly lastGPSTimestamp: string | null
  }>

  /**
   * Pending change orders (raw list from ForgeExec)
   */
  readonly changeOrders: ReadonlyArray<{
    readonly changeOrderId: string
    readonly jobId: string
    readonly technicianId: string
    readonly description: string
    readonly estimatedCost: number
    readonly estimatedTime: number
    readonly reason: string
    readonly photos: ReadonlyArray<string>
    readonly requestedAt: string
    readonly status: 'PENDING' | 'APPROVED' | 'REJECTED'
    readonly reviewedBy: string | null
    readonly reviewedAt: string | null
    readonly reviewNotes: string | null
  }>

  /**
   * Completed jobs ready for invoicing (raw list from ForgeExec)
   */
  readonly invoiceReadyJobs: ReadonlyArray<{
    readonly jobId: string
    readonly customerId: string
    readonly customerName: string
    readonly customerEmail: string
    readonly completedAt: string
    readonly laborHours: number
    readonly materialsUsed: ReadonlyArray<{
      readonly itemId: string
      readonly description: string
      readonly quantity: number
      readonly cost: number
    }>
    readonly changeOrderCosts: number
  }>

  /**
   * Job detail (if job selected)
   */
  readonly selectedJob: {
    readonly jobId: string
    readonly customerId: string
    readonly customerName: string
    readonly customerPhone: string
    readonly customerEmail: string
    readonly address: string
    readonly jobType: string
    readonly currentState: JobState
    readonly assignedTechnicianId: string | null
    readonly scheduledTime: string | null
    readonly jobNotes: string
    readonly photos: ReadonlyArray<{
      readonly photoId: string
      readonly url: string
      readonly caption: string | null
      readonly timestamp: string
      readonly uploadedBy: string
    }>
    readonly voiceNotes: ReadonlyArray<{
      readonly noteId: string
      readonly url: string
      readonly duration: number
      readonly timestamp: string
      readonly uploadedBy: string
    }>
    readonly workHistory: ReadonlyArray<{
      readonly timestamp: string
      readonly technicianId: string
      readonly action: string
      readonly notes: string | null
    }>
  } | null
}

/**
 * =============================================================================
 * UI IMPLEMENTATION RULES
 * =============================================================================
 *
 * 1. Event Emission:
 *    - UI calls `emitX(event)`
 *    - Event flows: UI → ForgeExec → Kernel → Decision
 *    - UI waits for state update notification
 *    - UI NEVER assumes success or failure
 *
 * 2. State Reception:
 *    - ForgeExec pushes state updates to UI
 *    - UI renders state exactly as received
 *    - UI NEVER transforms, derives, or computes state
 *    - UI NEVER caches or stores state locally
 *
 * 3. Forbidden Operations:
 *    - ❌ if (job.state === 'SCHEDULED') { job.state = 'DISPATCHED' }
 *    - ❌ const total = laborHours * hourlyRate + materials
 *    - ❌ const isLate = scheduledTime < now
 *    - ❌ setLoading(true); await emit(); setLoading(false)
 *
 * 4. Allowed Operations:
 *    - ✅ Display data exactly as received
 *    - ✅ Emit events on user action
 *    - ✅ Show loading spinners during event emission
 *    - ✅ Map server timestamps to local timezone for display ONLY
 *
 * 5. Example Implementation:
 *
 * ```typescript
 * // ✅ CORRECT
 * function JobCard({ job }: { job: Job }) {
 *   return (
 *     <div>
 *       <h3>{job.customerName}</h3>
 *       <p>State: {job.currentState}</p>
 *       <p>Scheduled: {new Date(job.scheduledTime).toLocaleString()}</p>
 *     </div>
 *   )
 * }
 *
 * // ❌ WRONG
 * function JobCard({ job }: { job: Job }) {
 *   const isLate = new Date(job.scheduledTime) < new Date() // NO!
 *   const status = job.currentState === 'DISPATCHED' ? 'En Route' : 'Pending' // NO!
 *   return (
 *     <div className={isLate ? 'late' : ''}>
 *       <p>Status: {status}</p>
 *     </div>
 *   )
 * }
 * ```
 */
