/**
 * NLE Event Type Mapping
 * 
 * Maps UI actions to ForgeExec NLE event types
 * Based on: verticals/next-level-electric/events.ts
 */

export const NLE_EVENT_TYPES = {
  // Job lifecycle events
  JOB_SCHEDULED: 'JOB_SCHEDULED',
  TECHNICIAN_DISPATCHED: 'TECHNICIAN_DISPATCHED',
  TECHNICIAN_ARRIVED: 'TECHNICIAN_ARRIVED',
  WORK_STARTED: 'WORK_STARTED',
  WORK_COMPLETED: 'WORK_COMPLETED',
  
  // Work capture events
  MATERIALS_LOGGED: 'MATERIALS_LOGGED',
  PHOTO_CAPTURED: 'PHOTO_CAPTURED',
  VOICE_NOTE_RECORDED: 'VOICE_NOTE_RECORDED',
  
  // Change management events
  CHANGE_ORDER_REQUESTED: 'CHANGE_ORDER_REQUESTED',
  CHANGE_ORDER_APPROVED: 'CHANGE_ORDER_APPROVED',
  CHANGE_ORDER_REJECTED: 'CHANGE_ORDER_REJECTED',
  
  // Completion events
  INSPECTION_SCHEDULED: 'INSPECTION_SCHEDULED',
  INSPECTION_PASSED: 'INSPECTION_PASSED',
  INSPECTION_FAILED: 'INSPECTION_FAILED',
  INVOICE_GENERATED: 'INVOICE_GENERATED',
  PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
  JOB_CLOSED: 'JOB_CLOSED',
} as const;

export type NLEEventType = typeof NLE_EVENT_TYPES[keyof typeof NLE_EVENT_TYPES];

/**
 * Helper to create properly formatted ForgeExec events
 */
export function createForgeExecEvent(
  type: NLEEventType,
  payload: Record<string, any>,
  source: 'technician-app' | 'office-dashboard'
): {
  type: string;
  payload: Record<string, any>;
  timestamp: string;
  sourceId: string;
} {
  return {
    type,
    payload,
    timestamp: new Date().toISOString(),
    sourceId: source
  };
}
