
import { JobState, Priority } from './types';

export const STATE_COLORS: Record<JobState, string> = {
  [JobState.LEAD_RECEIVED]: 'border-zinc-700 text-zinc-500',
  [JobState.SCHEDULED]: 'border-blue-500 text-blue-400',
  [JobState.DISPATCHED]: 'border-purple-500 text-purple-400',
  [JobState.ON_SITE]: 'border-amber-500 text-amber-400',
  [JobState.WORK_COMPLETED]: 'border-emerald-500 text-emerald-400',
  [JobState.INSPECTION_PASSED]: 'border-cyan-500 text-cyan-400',
  [JobState.INVOICED]: 'border-white text-white bg-white/10',
  [JobState.CLOSED]: 'border-zinc-800 text-zinc-700',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.LOW]: 'border-zinc-700 text-zinc-500',
  [Priority.MEDIUM]: 'border-zinc-400 text-zinc-200',
  [Priority.HIGH]: 'border-white text-white',
  [Priority.EMERGENCY]: 'border-red-600 text-red-500 bg-red-500/10',
};

export const MOCK_JOBS: any[] = [
  {
    jobId: 'JOB-001',
    customerName: 'Alice Johnson',
    customerPhone: '555-0123',
    address: '123 Pine St, San Francisco, CA',
    jobType: 'PANEL_UPGRADE',
    currentState: JobState.SCHEDULED,
    assignedTechnician: 'Tech-01',
    scheduledTime: '2026-01-04T09:00:00Z',
    estimatedDuration: 240,
    priority: Priority.HIGH,
    notes: 'Main panel is 40 years old. Replace with 200A service. Requires careful routing through basement.',
    photos: [],
    voiceNotes: [],
    materialsUsed: [],
    changeOrders: [],
    totalLaborHours: 0,
    totalMaterialCost: 0
  },
  {
    jobId: 'JOB-002',
    customerName: 'Bob Smith',
    customerPhone: '555-9876',
    address: '456 Oak Rd, Oakland, CA',
    jobType: 'EV_CHARGER_INSTALL',
    currentState: JobState.ON_SITE,
    assignedTechnician: 'Tech-01',
    scheduledTime: '2026-01-04T13:30:00Z',
    estimatedDuration: 120,
    priority: Priority.MEDIUM,
    notes: 'Installing Tesla Wall Connector in garage. Verify breaker capacity before load testing.',
    photos: ['https://picsum.photos/400/300?random=1'],
    voiceNotes: [],
    materialsUsed: [{ id: 'm1', name: '60A Breaker', quantity: 1, cost: 45 }],
    changeOrders: [],
    totalLaborHours: 1.5,
    totalMaterialCost: 45
  },
  {
    jobId: 'JOB-003',
    customerName: 'Charlie Davis',
    customerPhone: '555-4433',
    address: '789 Maple Ave, San Jose, CA',
    jobType: 'SERVICE_CALL',
    currentState: JobState.DISPATCHED,
    assignedTechnician: 'Tech-02',
    scheduledTime: '2026-01-04T10:00:00Z',
    estimatedDuration: 60,
    priority: Priority.EMERGENCY,
    notes: 'Partial power loss in kitchen. Sparking outlet reported. Possible short circuit in main branch.',
    photos: [],
    voiceNotes: [],
    materialsUsed: [],
    changeOrders: [],
    totalLaborHours: 0,
    totalMaterialCost: 0
  }
];
