/**
 * KERNEL SWAP TEST
 *
 * This test proves that ForgeExec executor works identically with:
 * - MockKernel (for testing)
 * - PrimusKernel (real implementation)
 *
 * NO executor code changes required to swap kernels.
 * This validates the KernelInterface abstraction works correctly.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { executeEvent } from './executor'
import { createInitialState } from './state'
import { createMockKernel } from '../kernel-client/mock-kernel'
import { createPrimusKernel } from '../kernel-client/primus-kernel'
import type { ExecutionEvent, JobContext, KernelDecision } from '../kernel-client/interface'

describe('Kernel Swap (Mock → Real)', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Happy Path', () => {
    it('executor works identically with MockKernel', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-001', 'LEAD_RECEIVED')

      const event: ExecutionEvent = {
        type: 'JOB_SCHEDULED',
        payload: { scheduledTime: '2026-01-10T09:00:00Z' },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
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
    })

    it('executor works identically with PrimusKernel', async () => {
      // Mock Primus Kernel API response
      const mockDecision: KernelDecision = {
        accepted: true,
        nextState: 'SCHEDULED',
        outputs: []
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecision
      })

      const kernel = createPrimusKernel({
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key'
      })

      const state = createInitialState('job-001', 'LEAD_RECEIVED')

      const event: ExecutionEvent = {
        type: 'JOB_SCHEDULED',
        payload: { scheduledTime: '2026-01-10T09:00:00Z' },
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-001',
        customerId: 'customer-001',
        vertical: 'electrician',
        jobType: 'PANEL_UPGRADE',
        metadata: {}
      }

      const result = await executeEvent({ kernel }, state, event, context)

      // Same result as MockKernel
      expect(result.success).toBe(true)
      expect(result.state.currentState).toBe('SCHEDULED')

      // Verify kernel was called correctly
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(callBody.currentState).toBe('LEAD_RECEIVED')
      expect(callBody.proposedState).toBe('SCHEDULED')
    })

    it('executor produces same results with both kernels for valid transition', async () => {
      // Run with MockKernel
      const mockKernel = createMockKernel()
      const state1 = createInitialState('job-002', 'SCHEDULED')

      const event: ExecutionEvent = {
        type: 'TECHNICIAN_DISPATCHED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z',
        sourceId: 'test'
      }

      const context: JobContext = {
        jobId: 'job-002',
        customerId: 'customer-002',
        vertical: 'electrician',
        jobType: 'SERVICE_CALL',
        metadata: {}
      }

      const mockResult = await executeEvent({ kernel: mockKernel }, state1, event, context)

      // Run with PrimusKernel (mocked API response matching MockKernel behavior)
      const primusDecision: KernelDecision = {
        accepted: true,
        nextState: 'DISPATCHED',
        outputs: [
          {
            type: 'DISPATCH_REQUIRED',
            payload: {
              jobId: 'job-002',
              customerId: 'customer-002'
            },
            timestamp: '2026-01-04T10:00:00Z'
          }
        ]
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => primusDecision
      })

      const primusKernel = createPrimusKernel({
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key'
      })

      const state2 = createInitialState('job-002', 'SCHEDULED')
      const primusResult = await executeEvent({ kernel: primusKernel }, state2, event, context)

      // Both kernels produce same state transition
      expect(mockResult.success).toBe(primusResult.success)
      expect(mockResult.state.currentState).toBe(primusResult.state.currentState)
      expect(mockResult.outputs.length).toBeGreaterThan(0)
      expect(primusResult.outputs.length).toBeGreaterThan(0)
    })
  })

  describe('Rejection Path', () => {
    it('executor handles rejection from MockKernel', async () => {
      const kernel = createMockKernel()
      const state = createInitialState('job-003', 'LEAD_RECEIVED')

      // Invalid transition: LEAD_RECEIVED -> CLOSED
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

    it('executor handles rejection from PrimusKernel', async () => {
      // Mock Primus Kernel rejection response
      const mockDecision: KernelDecision = {
        accepted: false,
        reason: 'Invalid transition: LEAD_RECEIVED -> CLOSED'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecision
      })

      const kernel = createPrimusKernel({
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key'
      })

      const state = createInitialState('job-003', 'LEAD_RECEIVED')

      // Invalid transition: LEAD_RECEIVED -> CLOSED
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

      // Same rejection behavior as MockKernel
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.state.currentState).toBe('LEAD_RECEIVED')
    })
  })

  describe('Determinism', () => {
    it('produces identical results with PrimusKernel for same inputs', async () => {
      const mockDecision: KernelDecision = {
        accepted: true,
        nextState: 'SCHEDULED',
        outputs: []
      }

      // First call
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecision
      })

      const kernel1 = createPrimusKernel({
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key'
      })

      const state1 = createInitialState('job-004', 'LEAD_RECEIVED')

      const event: ExecutionEvent = {
        type: 'JOB_SCHEDULED',
        payload: { scheduledTime: '2026-01-10T09:00:00Z' },
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

      const result1 = await executeEvent({ kernel: kernel1 }, state1, event, context)

      // Second call with identical inputs
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecision
      })

      const kernel2 = createPrimusKernel({
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key'
      })

      const state2 = createInitialState('job-004', 'LEAD_RECEIVED')
      const result2 = await executeEvent({ kernel: kernel2 }, state2, event, context)

      // Results must be identical
      expect(result1.success).toBe(result2.success)
      expect(result1.state.currentState).toBe(result2.state.currentState)
      expect(result1.state.history.length).toBe(result2.state.history.length)
    })
  })

  describe('Zero Executor Changes', () => {
    it('proves executeEvent function signature unchanged', async () => {
      // This test compiles = proof that executor signature works with both kernels
      const mockKernel = createMockKernel()

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accepted: true, nextState: 'SCHEDULED' })
      })

      const primusKernel = createPrimusKernel({
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key'
      })

      const state1 = createInitialState('job-005', 'LEAD_RECEIVED')
      const state2 = createInitialState('job-005', 'LEAD_RECEIVED')
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

      // Both kernels have identical interface - no executor changes required
      const mockResult = await executeEvent({ kernel: mockKernel }, state1, event, context)
      const primusResult = await executeEvent({ kernel: primusKernel }, state2, event, context)

      expect(mockResult).toBeDefined()
      expect(primusResult).toBeDefined()
      expect(mockResult.success).toBe(true)
      expect(primusResult.success).toBe(true)
    })
  })
})
