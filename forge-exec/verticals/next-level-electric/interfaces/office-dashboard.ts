/**
 * OFFICE DASHBOARD INTERFACE
 *
 * This defines the contract between the NLE office dashboard and ForgeExec.
 * This is an interface spec, not an implementation.
 *
 * DO NOT ADD BUSINESS LOGIC HERE.
 */

import type { JobState } from '../../../kernel-client/interface'

/**
 * NLE job types (duplicated from config to avoid cross-import)
 */
export type NLEJobType =
  | 'SERVICE_CALL'
  | 'PANEL_UPGRADE'
  | 'EV_CHARGER_INSTALL'
  | 'EMERGENCY_REPAIR'
  | 'NEW_INSTALLATION'
  | 'INSPECTION'

/**
 * Office dashboard capabilities
 */
export interface OfficeDashboardInterface {
  /**
   * Job management
   */
  getActiveJobs(): Promise<ReadonlyArray<JobSummary>>
  getJobDetails(jobId: string): Promise<JobDetails>
  approveChangeOrder(jobId: string, changeOrderId: string): Promise<void>
  rejectChangeOrder(
    jobId: string,
    changeOrderId: string,
    reason: string
  ): Promise<void>

  /**
   * Technician tracking
   */
  getTechnicianStatus(): Promise<ReadonlyArray<TechnicianStatus>>
  getTechnicianLocation(technicianId: string): Promise<TechnicianLocation>

  /**
   * Invoicing
   */
  getInvoiceReadyJobs(): Promise<ReadonlyArray<InvoiceReadyJob>>
  generateInvoice(jobId: string): Promise<string>

  /**
   * Reporting
   */
  getDailyReport(date: string): Promise<DailyReport>
  getWeeklyReport(startDate: string): Promise<WeeklyReport>
  getMaterialUsage(
    startDate: string,
    endDate: string
  ): Promise<MaterialUsageReport>
}

/**
 * Job summary for dashboard list view
 */
export interface JobSummary {
  readonly jobId: string
  readonly customerName: string
  readonly address: string
  readonly jobType: NLEJobType
  readonly currentState: JobState
  readonly assignedTechnician?: string
  readonly scheduledTime: string
  readonly estimatedDuration: number
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
}

/**
 * Full job details
 */
export interface JobDetails extends JobSummary {
  readonly customerPhone: string
  readonly customerEmail: string
  readonly jobNotes: string
  readonly workHistory: ReadonlyArray<WorkHistoryEntry>
  readonly materialsUsed: ReadonlyArray<MaterialUsed>
  readonly changeOrders: ReadonlyArray<ChangeOrder>
  readonly photos: ReadonlyArray<JobPhoto>
  readonly voiceNotes: ReadonlyArray<VoiceNote>
  readonly totalLaborHours: number
  readonly totalMaterialCost: number
  readonly invoiceId?: string
  readonly paymentStatus?: 'PENDING' | 'PAID' | 'OVERDUE'
}

export interface WorkHistoryEntry {
  readonly timestamp: string
  readonly technicianId: string
  readonly technicianName: string
  readonly action: string
  readonly duration?: number
  readonly notes?: string
}

export interface MaterialUsed {
  readonly itemId: string
  readonly description: string
  readonly quantity: number
  readonly source: 'VAN' | 'PURCHASED'
  readonly cost: number
  readonly timestamp: string
}

export interface ChangeOrder {
  readonly changeOrderId: string
  readonly description: string
  readonly estimatedCost: number
  readonly estimatedTime: number
  readonly reason: string
  readonly photos: ReadonlyArray<string>
  readonly requestedBy: string
  readonly requestedAt: string
  readonly status: 'PENDING' | 'APPROVED' | 'REJECTED'
  readonly reviewedBy?: string
  readonly reviewedAt?: string
  readonly reviewNotes?: string
}

export interface JobPhoto {
  readonly photoId: string
  readonly url: string
  readonly caption?: string
  readonly timestamp: string
  readonly uploadedBy: string
}

export interface VoiceNote {
  readonly noteId: string
  readonly url: string
  readonly duration: number
  readonly timestamp: string
  readonly uploadedBy: string
}

/**
 * Technician status for real-time tracking
 */
export interface TechnicianStatus {
  readonly technicianId: string
  readonly name: string
  readonly clockedIn: boolean
  readonly currentJob?: string
  readonly currentJobStatus?: JobState
  readonly jobsCompletedToday: number
  readonly totalHoursToday: number
  readonly lastKnownLocation?: TechnicianLocation
}

export interface TechnicianLocation {
  readonly technicianId: string
  readonly latitude: number
  readonly longitude: number
  readonly accuracy: number
  readonly timestamp: string
  readonly address?: string
}

/**
 * Invoice-ready job for billing
 */
export interface InvoiceReadyJob {
  readonly jobId: string
  readonly customerName: string
  readonly customerEmail: string
  readonly jobType: NLEJobType
  readonly completedAt: string
  readonly totalLaborHours: number
  readonly laborRate: number
  readonly totalMaterialCost: number
  readonly changeOrderCosts: number
  readonly subtotal: number
  readonly tax: number
  readonly total: number
}

/**
 * Daily operations report
 */
export interface DailyReport {
  readonly date: string
  readonly jobsScheduled: number
  readonly jobsCompleted: number
  readonly jobsInProgress: number
  readonly totalLaborHours: number
  readonly totalRevenue: number
  readonly materialsUsed: number
  readonly changeOrdersRequested: number
  readonly changeOrdersApproved: number
  readonly technicianUtilization: ReadonlyArray<TechnicianUtilization>
}

export interface TechnicianUtilization {
  readonly technicianId: string
  readonly name: string
  readonly hoursWorked: number
  readonly jobsCompleted: number
  readonly utilizationRate: number
}

/**
 * Weekly summary report
 */
export interface WeeklyReport {
  readonly startDate: string
  readonly endDate: string
  readonly totalJobs: number
  readonly totalRevenue: number
  readonly totalLaborHours: number
  readonly averageJobDuration: number
  readonly topJobTypes: ReadonlyArray<JobTypeStats>
  readonly topTechnicians: ReadonlyArray<TechnicianStats>
}

export interface JobTypeStats {
  readonly jobType: NLEJobType
  readonly count: number
  readonly averageDuration: number
  readonly totalRevenue: number
}

export interface TechnicianStats {
  readonly technicianId: string
  readonly name: string
  readonly jobsCompleted: number
  readonly totalHours: number
  readonly revenue: number
}

/**
 * Material usage report
 */
export interface MaterialUsageReport {
  readonly startDate: string
  readonly endDate: string
  readonly materials: ReadonlyArray<MaterialUsageSummary>
  readonly totalCost: number
  readonly vanUsage: number
  readonly purchasedUsage: number
}

export interface MaterialUsageSummary {
  readonly itemId: string
  readonly description: string
  readonly totalQuantity: number
  readonly fromVan: number
  readonly purchased: number
  readonly totalCost: number
  readonly averageCostPerUnit: number
}

/**
 * Dashboard screens (UI surface)
 */
export interface OfficeDashboardScreens {
  readonly overview: OverviewScreen
  readonly jobBoard: JobBoardScreen
  readonly technicianTracking: TechnicianTrackingScreen
  readonly invoicing: InvoicingScreen
  readonly changeOrders: ChangeOrdersScreen
  readonly reporting: ReportingScreen
}

export interface OverviewScreen {
  readonly todayStats: DailyReport
  readonly activeJobs: ReadonlyArray<JobSummary>
  readonly activeTechnicians: ReadonlyArray<TechnicianStatus>
  readonly pendingChangeOrders: number
  readonly invoicesPending: number
}

export interface JobBoardScreen {
  readonly scheduled: ReadonlyArray<JobSummary>
  readonly inProgress: ReadonlyArray<JobSummary>
  readonly completed: ReadonlyArray<JobSummary>
  readonly filters: JobFilters
}

export interface JobFilters {
  readonly jobType?: NLEJobType
  readonly technician?: string
  readonly dateRange?: { start: string; end: string }
  readonly priority?: string
}

export interface TechnicianTrackingScreen {
  readonly technicians: ReadonlyArray<TechnicianStatus>
  readonly mapView: boolean
  readonly listView: boolean
}

export interface InvoicingScreen {
  readonly readyToInvoice: ReadonlyArray<InvoiceReadyJob>
  readonly pendingPayment: ReadonlyArray<InvoiceReadyJob>
  readonly overdue: ReadonlyArray<InvoiceReadyJob>
}

export interface ChangeOrdersScreen {
  readonly pending: ReadonlyArray<ChangeOrder>
  readonly approved: ReadonlyArray<ChangeOrder>
  readonly rejected: ReadonlyArray<ChangeOrder>
}

export interface ReportingScreen {
  readonly dailyReport: DailyReport
  readonly weeklyReport: WeeklyReport
  readonly materialUsage: MaterialUsageReport
  readonly customDateRange?: { start: string; end: string }
}
