/**
 * FORGEEXEC EXECUTOR TESTS
 *
 * Tests verify executor correctness against MockKernel.
 * NO adapters, NO real kernel, NO UI.
 */

import { describe, it, expect } from 'vitest'
import { executeEvent, acknowledgeOutputs } from './executor'
import { createInitialState } from './state'
import { createMockKernel } from '../kernel-client/mock-kernel'
import type { ExecutionEvent, JobContext } from '../kernel-client/interface'

describe('ForgeExec Executor', () => {
  // Test 1: Valid Transition Passes
  describe('Valid Transitions', () => {
    it('accepts valid state transition from kernel', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-001', 'LEAD_RECEIVED')

      const event: ExecutionEvent = {
        type: 'JOB_SCHEDULED',
        payload: { scheduledTime: '2026-01-10T09:00:00Z' },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test-source'
      }

      const context: JobContext = {
        jobId: 'job-001',
        customerId: 'customer-001',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      const result = await executeEvent({ kernel }, state, event, context)

      expect(result.success).toBe(true)
      expect(result.state.currentState).toBe('SCHEDULED')
      expect(result.error).toBeUndefined()
    })

    it('transitions through multiple valid states', async () => {
      const kernel = createMockKernel()
      let state = createInitialState('job-002', 'LEAD_RECEIVED')

      const context: JobContext = {
        jobId: 'job-002',
        customerId: 'customer-002',
        vertical: 'electrician',
        jobType: 'SERVICE_CALL',
        metadata: {}
      }

      // LEAD_RECEIVED -> SCHEDULED
      let result = await executeEvent(
        { kernel },
        state,
        {
          type: 'JOB_SCHEDULED',
          payload: {},
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context
      )
      expect(result.success).toBe(true)
      expect(result.state.currentState).toBe('SCHEDULED')
      state = result.state

      // SCHEDULED -> DISPATCHED
      result = await executeEvent(
        { kernel },
        state,
        {
          type: 'TECHNICIAN_DISPATCHED',
          payload: {},
          timestamp: '2026-01-04T10:01:00Z',
          sourceId: 'test'
        },
        context
      )
      expect(result.success).toBe(true)
      expect(result.state.currentState).toBe('DISPATCHED')
    })
  })

  // Test 2: Invalid Transition Fails
  describe('Invalid Transitions', () => {
    it('rejects invalid state transition with explicit failure', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-003', 'LEAD_RECEIVED')

      // Try to jump directly to CLOSED (invalid)
      const event: ExecutionEvent = {
        type: 'JOB_CLOSED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-003',
        customerId: 'customer-003',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      const result = await executeEvent({ kernel }, state, event, context)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.state.currentState).toBe('LEAD_RECEIVED') // State unchanged
    })

    it('returns explicit error message on rejection', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-004', 'SCHEDULED')

      // Try invalid transition
      const event: ExecutionEvent = {
        type: 'JOB_CLOSED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-004',
        customerId: 'customer-004',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      const result = await executeEvent({ kernel }, state, event, context)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid transition')
    })
  })

  // Test 3: State Immutability
  describe('State Immutability', () => {
    it('does not mutate input state on success', async () => {
      const kernel = createMockKernel()
      const originalState = createInitialState('job-005', 'LEAD_RECEIVED')
      const stateCopy = JSON.parse(JSON.stringify(originalState))

      const event: ExecutionEvent = {
        type: 'JOB_SCHEDULED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-005',
        customerId: 'customer-005',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      await executeEvent({ kernel }, originalState, event, context)

      // Original state must be unchanged
      expect(originalState).toEqual(stateCopy)
      expect(originalState.currentState).toBe('LEAD_RECEIVED')
    })

    it('does not mutate input state on failure', async () => {
      const kernel = createMockKernel()
      const originalState = createInitialState('job-006', 'LEAD_RECEIVED')
      const stateCopy = JSON.parse(JSON.stringify(originalState))

      const event: ExecutionEvent = {
        type: 'JOB_CLOSED', // Invalid transition
        payload: {},
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-006',
        customerId: 'customer-006',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      await executeEvent({ kernel }, originalState, event, context)

      // Original state must be unchanged
      expect(originalState).toEqual(stateCopy)
    })
  })

  // Test 4: Event Immutability
  describe('Event Immutability', () => {
    it('does not mutate input event', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-007', 'LEAD_RECEIVED')

      const originalEvent: ExecutionEvent = {
        type: 'JOB_SCHEDULED',
        payload: { scheduledTime: '2026-01-10T09:00:00Z' },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }
      const eventCopy = JSON.parse(JSON.stringify(originalEvent))

      const context: JobContext = {
        jobId: 'job-007',
        customerId: 'customer-007',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      await executeEvent({ kernel }, state, originalEvent, context)

      // Event must be unchanged
      expect(originalEvent).toEqual(eventCopy)
    })
  })

  // Test 5: Output Emission
  describe('Output Emission', () => {
    it('emits outputs exactly as kernel decides', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-008', 'SCHEDULED')

      const event: ExecutionEvent = {
        type: 'TECHNICIAN_DISPATCHED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-008',
        customerId: 'customer-008',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      const result = await executeEvent({ kernel }, state, event, context)

      expect(result.success).toBe(true)
      expect(result.outputs).toBeDefined()
      expect(Array.isArray(result.outputs)).toBe(true)

      // MockKernel should emit DISPATCH_REQUIRED for DISPATCHED state
      if (result.outputs.length > 0) {
        expect(result.outputs[0].type).toBe('DISPATCH_REQUIRED')
        expect(result.outputs[0].payload).toHaveProperty('jobId')
      }
    })

    it('includes outputs in state.pendingOutputs', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-009', 'SCHEDULED')

      const event: ExecutionEvent = {
        type: 'TECHNICIAN_DISPATCHED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-009',
        customerId: 'customer-009',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      const result = await executeEvent({ kernel }, state, event, context)

      expect(result.state.pendingOutputs.length).toBeGreaterThan(0)
    })
  })

  // Test 6: Determinism
  describe('Determinism', () => {
    it('produces identical results for identical inputs', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-010', 'LEAD_RECEIVED')

      const event: ExecutionEvent = {
        type: 'JOB_SCHEDULED',
        payload: { scheduledTime: '2026-01-10T09:00:00Z' },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-010',
        customerId: 'customer-010',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      // Execute twice with identical inputs
      const result1 = await executeEvent({ kernel }, state, event, context)
      const result2 = await executeEvent({ kernel }, state, event, context)

      // Results must be identical
      expect(result1.success).toBe(result2.success)
      expect(result1.state.currentState).toBe(result2.state.currentState)
      expect(result1.state.history.length).toBe(result2.state.history.length)
    })
  })

  // Test 7: Acknowledge Outputs
  describe('Output Acknowledgement', () => {
    it('clears pending outputs after acknowledgement', () => {
      const stateWithOutputs = {
        jobId: 'job-011',
        currentState: 'DISPATCHED' as const,
        history: [],
        pendingOutputs: [
          {
            type: 'DISPATCH_REQUIRED' as const,
            payload: { jobId: 'job-011' },
            timestamp: '2026-01-04T10:00:00Z'
          }
        ]
      }

      const clearedState = acknowledgeOutputs(stateWithOutputs)

      expect(clearedState.pendingOutputs.length).toBe(0)
      expect(clearedState.currentState).toBe('DISPATCHED')
      expect(clearedState.jobId).toBe('job-011')
    })

    it('does not mutate input state when clearing outputs', () => {
      const stateWithOutputs = {
        jobId: 'job-012',
        currentState: 'DISPATCHED' as const,
        history: [],
        pendingOutputs: [
          {
            type: 'DISPATCH_REQUIRED' as const,
            payload: { jobId: 'job-012' },
            timestamp: '2026-01-04T10:00:00Z'
          }
        ]
      }

      const originalLength = stateWithOutputs.pendingOutputs.length

      acknowledgeOutputs(stateWithOutputs)

      // Original state unchanged
      expect(stateWithOutputs.pendingOutputs.length).toBe(originalLength)
    })
  })
})
