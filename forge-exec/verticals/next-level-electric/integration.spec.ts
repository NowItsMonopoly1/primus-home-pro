/**
 * END-TO-END INTEGRATION TEST
 *
 * Tests the complete flow from event submission through kernel decision
 * to adapter execution for NLE vertical.
 *
 * DO NOT ADD BUSINESS LOGIC - only test the integration.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { executeEvent, acknowledgeOutputs } from '../../executor/executor'
import { createInitialState } from '../../executor/state'
import { createAdapterRegistry } from '../../adapters/adapter-registry'
import { wireNLEAdapters } from './adapter-wiring'
import { MockKernel } from '../../kernel-client/mock-kernel'
import type { ExecutionEvent, JobContext } from '../../kernel-client/interface'

describe('NLE End-to-End Integration', () => {
  let mockKernel: MockKernel
  let registry: ReturnType<typeof createAdapterRegistry>

  beforeEach(() => {
    mockKernel = new MockKernel()
    registry = createAdapterRegistry()
    wireNLEAdapters(registry)
  })

  describe('Complete Job Flow', () => {
    it('processes job from scheduled to dispatched', async () => {
      // Create initial state
      const initialState = createInitialState('job-123', 'SCHEDULED')

      // Create dispatch event
      const event: ExecutionEvent = {
        type: 'TECHNICIAN_DISPATCHED',
        payload: {
          jobId: 'job-123',
          technicianId: 'tech-456',
          dispatchTime: '2026-01-04T10:00:00Z'
        },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'office-dashboard'
      }

      const context: JobContext = {
        jobId: 'job-123',
        customerId: 'cust-789',
        vertical: 'electrician',
        jobType: 'SERVICE_CALL',
        metadata: {}
      }

      // Execute event
      const result = await executeEvent(
        { kernel: mockKernel },
        initialState,
        event,
        context
      )

      // Verify execution succeeded
      expect(result.success).toBe(true)
      expect(result.state.currentState).toBe('DISPATCHED')
      expect(result.state.history).toHaveLength(1)
      expect(result.state.history[0].fromState).toBe('SCHEDULED')
      expect(result.state.history[0].toState).toBe('DISPATCHED')
    })

    it('processes job from dispatched to on-site', async () => {
      const initialState = createInitialState('job-123', 'DISPATCHED')

      const event: ExecutionEvent = {
        type: 'TECHNICIAN_ARRIVED',
        payload: {
          jobId: 'job-123',
          technicianId: 'tech-456',
          arrivalTime: '2026-01-04T11:00:00Z',
          location: {
            latitude: 40.7128,
            longitude: -74.0060
          }
        },
        timestamp: '2026-01-04T11:00:00Z',
        sourceId: 'technician-app'
      }

      const context: JobContext = {
        jobId: 'job-123',
        customerId: 'cust-789',
        vertical: 'electrician',
        jobType: 'SERVICE_CALL',
        metadata: {}
      }

      const result = await executeEvent(
        { kernel: mockKernel },
        initialState,
        event,
        context
      )

      expect(result.success).toBe(true)
      expect(result.state.currentState).toBe('ON_SITE')
    })

    it('processes job from on-site to work completed', async () => {
      const initialState = createInitialState('job-123', 'ON_SITE')

      const event: ExecutionEvent = {
        type: 'WORK_COMPLETED',
        payload: {
          jobId: 'job-123',
          technicianId: 'tech-456',
          completionTime: '2026-01-04T14:00:00Z',
          laborHours: 3,
          materialsUsed: []
        },
        timestamp: '2026-01-04T14:00:00Z',
        sourceId: 'technician-app'
      }

      const context: JobContext = {
        jobId: 'job-123',
        customerId: 'cust-789',
        vertical: 'electrician',
        jobType: 'SERVICE_CALL',
        metadata: {}
      }

      const result = await executeEvent(
        { kernel: mockKernel },
        initialState,
        event,
        context
      )

      expect(result.success).toBe(true)
      expect(result.state.currentState).toBe('WORK_COMPLETED')
    })

    it('handles full job lifecycle', async () => {
      let state = createInitialState('job-123', 'SCHEDULED')
      const context: JobContext = {
        jobId: 'job-123',
        customerId: 'cust-789',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      // Step 1: Dispatch
      const dispatchEvent: ExecutionEvent = {
        type: 'TECHNICIAN_DISPATCHED',
        payload: { jobId: 'job-123', technicianId: 'tech-456' },
        timestamp: '2026-01-04T09:00:00Z',
        sourceId: 'office-dashboard'
      }

      let result = await executeEvent(
        { kernel: mockKernel },
        state,
        dispatchEvent,
        context
      )
      expect(result.success).toBe(true)
      state = result.state

      // Step 2: Arrival
      const arrivalEvent: ExecutionEvent = {
        type: 'TECHNICIAN_ARRIVED',
        payload: { jobId: 'job-123', technicianId: 'tech-456' },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'technician-app'
      }

      result = await executeEvent(
        { kernel: mockKernel },
        state,
        arrivalEvent,
        context
      )
      expect(result.success).toBe(true)
      state = result.state

      // Step 3: Work Completed
      const completionEvent: ExecutionEvent = {
        type: 'WORK_COMPLETED',
        payload: { jobId: 'job-123', technicianId: 'tech-456' },
        timestamp: '2026-01-04T15:00:00Z',
        sourceId: 'technician-app'
      }

      result = await executeEvent(
        { kernel: mockKernel },
        state,
        completionEvent,
        context
      )
      expect(result.success).toBe(true)
      state = result.state

      // Verify full history
      expect(state.history).toHaveLength(3)
      expect(state.currentState).toBe('WORK_COMPLETED')
      expect(state.history[0].fromState).toBe('SCHEDULED')
      expect(state.history[1].fromState).toBe('DISPATCHED')
      expect(state.history[2].fromState).toBe('ON_SITE')
    })
  })

  describe('Kernel Rejection Handling', () => {
    it('rejects invalid state transitions', async () => {
      const initialState = createInitialState('job-123', 'SCHEDULED')

      // Try to close job without going through proper states
      const event: ExecutionEvent = {
        type: 'JOB_CLOSED',
        payload: { jobId: 'job-123' },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'office-dashboard'
      }

      const context: JobContext = {
        jobId: 'job-123',
        customerId: 'cust-789',
        vertical: 'electrician',
        jobType: 'SERVICE_CALL',
        metadata: {}
      }

      // MockKernel will reject SCHEDULED -> CLOSED
      const result = await executeEvent(
        { kernel: mockKernel },
        initialState,
        event,
        context
      )

      expect(result.success).toBe(false)
      expect(result.state.currentState).toBe('SCHEDULED')
      expect(result.error).toContain('Invalid transition')
      expect(result.state.history).toHaveLength(0)
    })

    it('maintains state immutability on rejection', async () => {
      const initialState = createInitialState('job-123', 'DISPATCHED')
      const originalHistoryLength = initialState.history.length

      // Try invalid transition: DISPATCHED -> INVOICED (skips ON_SITE and WORK_COMPLETED)
      const event: ExecutionEvent = {
        type: 'INVOICE_GENERATED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'office-dashboard'
      }

      const context: JobContext = {
        jobId: 'job-123',
        customerId: 'cust-789',
        vertical: 'electrician',
        jobType: 'SERVICE_CALL',
        metadata: {}
      }

      const result = await executeEvent(
        { kernel: mockKernel },
        initialState,
        event,
        context
      )

      expect(result.success).toBe(false)
      expect(result.state.currentState).toBe('DISPATCHED')
      expect(result.state.history).toHaveLength(originalHistoryLength)
    })
  })

  describe('Output Management', () => {
    it('tracks pending outputs after successful transition', async () => {
      const initialState = createInitialState('job-123', 'INSPECTION_PASSED')

      const event: ExecutionEvent = {
        type: 'INVOICE_GENERATED',
        payload: { jobId: 'job-123' },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'office-dashboard'
      }

      const context: JobContext = {
        jobId: 'job-123',
        customerId: 'cust-789',
        vertical: 'electrician',
        jobType: 'SERVICE_CALL',
        metadata: {}
      }

      // MockKernel will emit INVOICE_READY output for INVOICED state
      const result = await executeEvent(
        { kernel: mockKernel },
        initialState,
        event,
        context
      )

      expect(result.success).toBe(true)
      expect(result.state.currentState).toBe('INVOICED')
      expect(result.state.pendingOutputs.length).toBeGreaterThan(0)
      expect(result.state.pendingOutputs[0].type).toBe('INVOICE_READY')
    })

    it('clears outputs after acknowledgment', () => {
      const stateWithOutputs = createInitialState('job-123', 'INVOICED')
      const stateWithPending = {
        ...stateWithOutputs,
        pendingOutputs: [
          {
            type: 'INVOICE_READY',
            payload: { jobId: 'job-123' },
            timestamp: '2026-01-04T10:00:00Z'
          }
        ]
      }

      const clearedState = acknowledgeOutputs(stateWithPending)

      expect(clearedState.pendingOutputs).toHaveLength(0)
      expect(clearedState.currentState).toBe('INVOICED')
      expect(clearedState.jobId).toBe('job-123')
    })
  })
})
