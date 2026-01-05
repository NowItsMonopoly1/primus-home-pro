/**
 * TECHNICIAN MOBILE APP INTERFACE
 *
 * This defines the contract between the NLE mobile app and ForgeExec.
 * This is an interface spec, not an implementation.
 *
 * DO NOT ADD BUSINESS LOGIC HERE.
 */

import type { ExecutionEvent } from '../../../kernel-client/interface'

/**
 * Technician app capabilities
 */
export interface TechnicianAppInterface {
  /**
   * Clock in/out with GPS verification
   */
  clockIn(technicianId: string, location: GPSLocation): Promise<ExecutionEvent>
  clockOut(technicianId: string, location: GPSLocation): Promise<ExecutionEvent>

  /**
   * Job selection and arrival
   */
  selectJob(technicianId: string, jobId: string): Promise<void>
  arriveAtSite(
    technicianId: string,
    jobId: string,
    location: GPSLocation
  ): Promise<ExecutionEvent>

  /**
   * Work status updates
   */
  startWork(technicianId: string, jobId: string): Promise<ExecutionEvent>
  completeWork(
    technicianId: string,
    jobId: string,
    completion: WorkCompletion
  ): Promise<ExecutionEvent>

  /**
   * Materials tracking
   */
  logMaterials(
    jobId: string,
    materials: ReadonlyArray<MaterialLog>
  ): Promise<ExecutionEvent>

  /**
   * Change orders
   */
  requestChangeOrder(
    jobId: string,
    changeOrder: ChangeOrderRequest
  ): Promise<ExecutionEvent>

  /**
   * Media capture
   */
  capturePhoto(jobId: string, photoUrl: string, caption?: string): Promise<ExecutionEvent>
  recordVoiceNote(jobId: string, audioUrl: string, duration: number): Promise<ExecutionEvent>
}

/**
 * GPS location data
 */
export interface GPSLocation {
  readonly latitude: number
  readonly longitude: number
  readonly accuracy: number
  readonly timestamp: string
}

/**
 * Work completion data
 */
export interface WorkCompletion {
  readonly laborHours: number
  readonly materialsUsed: ReadonlyArray<MaterialLog>
  readonly photos: ReadonlyArray<string>
  readonly voiceNotes: ReadonlyArray<string>
  readonly notes?: string
  readonly requiresInspection: boolean
}

/**
 * Material logging data
 */
export interface MaterialLog {
  readonly itemId: string
  readonly description: string
  readonly quantity: number
  readonly source: 'VAN' | 'PURCHASED'
  readonly cost?: number
  readonly vendor?: string
  readonly receiptUrl?: string
}

/**
 * Change order request data
 */
export interface ChangeOrderRequest {
  readonly description: string
  readonly estimatedCost: number
  readonly estimatedTime: number
  readonly reason: string
  readonly photos: ReadonlyArray<string>
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH'
}

/**
 * Technician app screens (UI surface)
 */
export interface TechnicianAppScreens {
  readonly clockIn: ClockInScreen
  readonly jobList: JobListScreen
  readonly jobDetail: JobDetailScreen
  readonly workCapture: WorkCaptureScreen
  readonly materialsLog: MaterialsLogScreen
  readonly changeOrder: ChangeOrderScreen
}

export interface ClockInScreen {
  readonly technicianName: string
  readonly currentLocation: GPSLocation
  readonly clockedIn: boolean
  readonly currentJob?: string
}

export interface JobListScreen {
  readonly assignedJobs: ReadonlyArray<AssignedJob>
  readonly completedToday: number
}

export interface AssignedJob {
  readonly jobId: string
  readonly customerName: string
  readonly address: string
  readonly jobType: string
  readonly scheduledTime: string
  readonly status: string
  readonly distance?: number
}

export interface JobDetailScreen {
  readonly job: AssignedJob
  readonly customerPhone: string
  readonly jobNotes: string
  readonly requiredMaterials: ReadonlyArray<string>
  readonly safetyNotes?: string
}

export interface WorkCaptureScreen {
  readonly jobId: string
  readonly startTime: string
  readonly currentDuration: number
  readonly photosCapture: ReadonlyArray<string>
  readonly voiceNotes: ReadonlyArray<string>
}

export interface MaterialsLogScreen {
  readonly jobId: string
  readonly materials: ReadonlyArray<MaterialLog>
  readonly totalCost: number
  readonly vanInventory: ReadonlyArray<VanInventoryItem>
}

export interface VanInventoryItem {
  readonly itemId: string
  readonly description: string
  readonly quantityAvailable: number
  readonly unitCost: number
}

export interface ChangeOrderScreen {
  readonly jobId: string
  readonly originalScope: string
  readonly proposedChange: string
  readonly estimatedCost: number
  readonly estimatedTime: number
  readonly photos: ReadonlyArray<string>
}
