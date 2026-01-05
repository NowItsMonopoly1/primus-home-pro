/**
 * ForgeExec Integration Service
 * 
 * This service replaces the Gemini-based validation with real ForgeExec backend calls.
 * Connects the UI to the actual deterministic execution engine.
 */

import { ExecutionEvent, JobState } from "../types";

const FORGEEXEC_API_URL = import.meta.env.VITE_FORGEEXEC_API || 'http://localhost:3000';

interface ValidationResult {
  accepted: boolean;
  newState: string;
  message: string;
  error?: string;
}

/**
 * Submits an event to the ForgeExec backend for validation and execution
 */
export async function submitEvent(event: ExecutionEvent): Promise<ValidationResult> {
  try {
    const response = await fetch(`${FORGEEXEC_API_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        accepted: false,
        newState: '',
        message: errorData.message || 'Event rejected by ForgeExec',
        error: errorData.error || 'VALIDATION_FAILED'
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('ForgeExec API Error:', error);
    return {
      accepted: false,
      newState: '',
      message: 'Unable to connect to ForgeExec backend',
      error: 'CONNECTION_FAILED'
    };
  }
}

/**
 * Fetches job details from ForgeExec
 */
export async function getJobDetails(jobId: string): Promise<any> {
  try {
    const response = await fetch(`${FORGEEXEC_API_URL}/api/jobs/${jobId}`);
    if (!response.ok) throw new Error('Job not found');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch job:', error);
    throw error;
  }
}

/**
 * Fetches all active jobs
 */
export async function getActiveJobs(): Promise<any[]> {
  try {
    const response = await fetch(`${FORGEEXEC_API_URL}/api/jobs?state=ACTIVE`);
    if (!response.ok) throw new Error('Failed to fetch jobs');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch active jobs:', error);
    return [];
  }
}

/**
 * Fetches technician status
 */
export async function getTechnicianStatus(technicianId: string): Promise<any> {
  try {
    const response = await fetch(`${FORGEEXEC_API_URL}/api/technicians/${technicianId}`);
    if (!response.ok) throw new Error('Technician not found');
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch technician status:', error);
    throw error;
  }
}

/**
 * Validates event with ForgeExec state machine rules
 * (For backwards compatibility with existing UI code)
 */
export async function validateKernelEvent(event: ExecutionEvent, currentJobState: JobState): Promise<ValidationResult> {
  // Add current state context to the event
  const contextualEvent = {
    ...event,
    metadata: {
      ...event.payload,
      currentState: currentJobState
    }
  };
  
  return submitEvent(contextualEvent);
}
