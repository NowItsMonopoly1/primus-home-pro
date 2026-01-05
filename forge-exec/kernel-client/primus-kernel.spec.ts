/**
 * PRIMUS KERNEL CLIENT TESTS
 *
 * Verify client is a pure transport layer:
 * - Exact payload pass-through to API
 * - Exact response pass-through from API
 * - No enrichment, defaults, or transformations
 * - Explicit error propagation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPrimusKernel } from './primus-kernel'
import type { DecisionRequest, KernelDecision } from './interface'

describe('Primus Kernel Client', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Contract Compliance', () => {
    it('sends request payload verbatim to kernel API', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123'
      }

      const request: DecisionRequest = {
        currentState: 'LEAD_RECEIVED',
        proposedState: 'SCHEDULED',
        event: {
          type: 'JOB_SCHEDULED',
          payload: { scheduledTime: '2026-01-10T09:00:00Z' },
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-001',
          customerId: 'customer-001',
          vertical: 'electrician',
          jobType: 'PANEL_UPGRADE',
          metadata: {}
        }
      }

      const mockDecision: KernelDecision = {
        accepted: true,
        nextState: 'SCHEDULED',
        outputs: []
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecision
      })

      const kernel = createPrimusKernel(config)
      await kernel.decide(request)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://kernel.example.com/decide',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key-123',
            'Content-Type': 'application/json'
          })
        })
      )

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(callBody).toEqual(request)
    })

    it('returns kernel decision verbatim without transformation', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123'
      }

      const request: DecisionRequest = {
        currentState: 'SCHEDULED',
        proposedState: 'DISPATCHED',
        event: {
          type: 'TECHNICIAN_DISPATCHED',
          payload: {},
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-002',
          customerId: 'customer-002',
          vertical: 'electrician',
          jobType: 'SERVICE_CALL',
          metadata: {}
        }
      }

      const mockDecision: KernelDecision = {
        accepted: true,
        nextState: 'DISPATCHED',
        outputs: [
          {
            type: 'DISPATCH_REQUIRED',
            payload: {
              jobId: 'job-002',
              technicianId: 'tech-456',
              customField: 'kernel-generated-value'
            },
            timestamp: '2026-01-04T10:00:00Z'
          }
        ]
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecision
      })

      const kernel = createPrimusKernel(config)
      const result = await kernel.decide(request)

      // Result must match kernel decision exactly
      expect(result).toEqual(mockDecision)
      expect(result.outputs).toEqual(mockDecision.outputs)
    })

    it('does not enrich or add defaults to request', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123'
      }

      // Minimal request with no optional fields
      const request: DecisionRequest = {
        currentState: 'LEAD_RECEIVED',
        proposedState: 'SCHEDULED',
        event: {
          type: 'JOB_SCHEDULED',
          payload: {},
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-003',
          customerId: 'customer-003',
          vertical: 'electrician',
          jobType: 'PANEL_UPGRADE',
          metadata: {}
        }
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accepted: true, nextState: 'SCHEDULED' })
      })

      const kernel = createPrimusKernel(config)
      await kernel.decide(request)

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)

      // Should not add any fields not in original request
      expect(Object.keys(callBody)).toEqual(Object.keys(request))
      expect(callBody.event.payload).toEqual({})
      expect(callBody.context.metadata).toEqual({})
    })

    it('does not transform or filter kernel outputs', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123'
      }

      const request: DecisionRequest = {
        currentState: 'WORK_COMPLETED',
        proposedState: 'INVOICED',
        event: {
          type: 'WORK_COMPLETED',
          payload: {},
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-004',
          customerId: 'customer-004',
          vertical: 'electrician',
          jobType: 'PANEL_UPGRADE',
          metadata: {}
        }
      }

      // Kernel returns multiple outputs with complex payloads
      const mockDecision: KernelDecision = {
        accepted: true,
        nextState: 'INVOICED',
        outputs: [
          {
            type: 'INVOICE_READY',
            payload: {
              invoiceId: 'inv-123',
              amount: 1500.00,
              lineItems: [
                { description: 'Labor', amount: 1000 },
                { description: 'Materials', amount: 500 }
              ]
            },
            timestamp: '2026-01-04T10:00:00Z'
          },
          {
            type: 'ALERT_RAISED',
            payload: {
              message: 'Invoice ready for review',
              priority: 'HIGH'
            },
            timestamp: '2026-01-04T10:00:01Z'
          }
        ]
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDecision
      })

      const kernel = createPrimusKernel(config)
      const result = await kernel.decide(request)

      // Outputs must match kernel response exactly
      expect(result.outputs).toHaveLength(2)
      expect(result.outputs).toEqual(mockDecision.outputs)
    })
  })

  describe('Error Handling', () => {
    it('propagates API errors explicitly', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123'
      }

      const request: DecisionRequest = {
        currentState: 'LEAD_RECEIVED',
        proposedState: 'SCHEDULED',
        event: {
          type: 'JOB_SCHEDULED',
          payload: {},
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-005',
          customerId: 'customer-005',
          vertical: 'electrician',
          jobType: 'PANEL_UPGRADE',
          metadata: {}
        }
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      const kernel = createPrimusKernel(config)

      await expect(kernel.decide(request)).rejects.toThrow(
        'Primus Kernel API error: 500'
      )
    })

    it('handles timeout explicitly', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123',
        timeout: 100
      }

      const request: DecisionRequest = {
        currentState: 'LEAD_RECEIVED',
        proposedState: 'SCHEDULED',
        event: {
          type: 'JOB_SCHEDULED',
          payload: {},
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-006',
          customerId: 'customer-006',
          vertical: 'electrician',
          jobType: 'PANEL_UPGRADE',
          metadata: {}
        }
      }

      // Mock fetch that respects AbortSignal
      fetchMock.mockImplementationOnce((_url, options) => {
        return new Promise((_resolve, reject) => {
          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              reject(new DOMException('The operation was aborted', 'AbortError'))
            })
          }
        })
      })

      const kernel = createPrimusKernel(config)

      await expect(kernel.decide(request)).rejects.toThrow(
        'Primus Kernel request timeout'
      )
    })

    it('handles network errors explicitly', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123'
      }

      const request: DecisionRequest = {
        currentState: 'LEAD_RECEIVED',
        proposedState: 'SCHEDULED',
        event: {
          type: 'JOB_SCHEDULED',
          payload: {},
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-007',
          customerId: 'customer-007',
          vertical: 'electrician',
          jobType: 'PANEL_UPGRADE',
          metadata: {}
        }
      }

      fetchMock.mockRejectedValueOnce(new Error('Network error'))

      const kernel = createPrimusKernel(config)

      await expect(kernel.decide(request)).rejects.toThrow('Network error')
    })
  })

  describe('Client Purity', () => {
    it('does not mutate request', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123'
      }

      const request: DecisionRequest = {
        currentState: 'LEAD_RECEIVED',
        proposedState: 'SCHEDULED',
        event: {
          type: 'JOB_SCHEDULED',
          payload: { scheduledTime: '2026-01-10T09:00:00Z' },
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-008',
          customerId: 'customer-008',
          vertical: 'electrician',
          jobType: 'PANEL_UPGRADE',
          metadata: { priority: 'HIGH' }
        }
      }

      const requestCopy = JSON.parse(JSON.stringify(request))

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accepted: true, nextState: 'SCHEDULED' })
      })

      const kernel = createPrimusKernel(config)
      await kernel.decide(request)

      expect(request).toEqual(requestCopy)
    })

    it('does not mutate config', async () => {
      const config = {
        apiUrl: 'https://kernel.example.com',
        apiKey: 'test-key-123',
        timeout: 5000
      }

      const configCopy = { ...config }

      const request: DecisionRequest = {
        currentState: 'LEAD_RECEIVED',
        proposedState: 'SCHEDULED',
        event: {
          type: 'JOB_SCHEDULED',
          payload: {},
          timestamp: '2026-01-04T10:00:00Z',
          sourceId: 'test'
        },
        context: {
          jobId: 'job-009',
          customerId: 'customer-009',
          vertical: 'electrician',
          jobType: 'PANEL_UPGRADE',
          metadata: {}
        }
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accepted: true, nextState: 'SCHEDULED' })
      })

      const kernel = createPrimusKernel(config)
      await kernel.decide(request)

      expect(config).toEqual(configCopy)
    })
  })
})
