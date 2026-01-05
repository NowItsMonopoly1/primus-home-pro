
export enum JobState {
  LEAD_RECEIVED = 'LEAD_RECEIVED',
  SCHEDULED = 'SCHEDULED',
  DISPATCHED = 'DISPATCHED',
  ON_SITE = 'ON_SITE',
  WORK_COMPLETED = 'WORK_COMPLETED',
  INSPECTION_PASSED = 'INSPECTION_PASSED',
  INVOICED = 'INVOICED',
  CLOSED = 'CLOSED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  EMERGENCY = 'EMERGENCY'
}

export interface MaterialLog {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

export interface ChangeOrder {
  id: string;
  description: string;
  estimatedCost: number;
  priority: Priority;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: string;
}

export interface ExecutionEvent {
  type: string;
  payload: Record<string, any>;
  timestamp: string;
  source: 'technician-app' | 'office-dashboard';
}

export interface JobDetails {
  jobId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  jobType: 'SERVICE_CALL' | 'PANEL_UPGRADE' | 'EV_CHARGER_INSTALL';
  currentState: JobState;
  assignedTechnician?: string;
  scheduledTime: string;
  estimatedDuration: number; // in minutes
  priority: Priority;
  notes: string;
  photos: string[];
  voiceNotes: string[];
  materialsUsed: MaterialLog[];
  changeOrders: ChangeOrder[];
  totalLaborHours: number;
  totalMaterialCost: number;
}

export interface TechnicianStatus {
  id: string;
  name: string;
  isClockedIn: boolean;
  currentLocation?: { lat: number; lng: number };
  currentJobId?: string;
  lastUpdate: string;
}
