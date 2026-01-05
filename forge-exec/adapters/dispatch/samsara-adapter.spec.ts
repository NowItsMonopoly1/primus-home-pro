/**
 * SAMSARA DISPATCH ADAPTER TESTS
 *
 * Verify adapter is a pure side-effect sink with:
 * - Exact payload pass-through
 * - No conditionals
 * - No transformations
 * - Explicit error propagation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { dispatchTechnician, trackLocation } from './samsara-adapter'
import type { KernelOutput } from '../../kernel-client/interface'

describe('Samsara Dispatch Adapter', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('dispatchTechnician', () => {
    it('passes payload through verbatim to API', async () => {
      const config = {
        apiToken: 'test-token',
        baseUrl: 'https://api.samsara.test'
      }

      const output: KernelOutput = {
        type: 'DISPATCH_REQUIRED',
        payload: {
          jobId: 'job-001',
          technicianId: 'tech-123',
          location: { lat: 45.5, lon: -122.6 }
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await dispatchTechnician(config, output)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.samsara.test/fleet/dispatch',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(output.payload)
        })
      )
    })

    it('propagates API errors explicitly', async () => {
      const config = {
        apiToken: 'test-token',
        baseUrl: 'https://api.samsara.test'
      }

      const output: KernelOutput = {
        type: 'DISPATCH_REQUIRED',
        payload: { jobId: 'job-002' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 503
      })

      await expect(dispatchTechnician(config, output)).rejects.toThrow(
        'Samsara API error: 503'
      )
    })

    it('does not transform payload', async () => {
      const config = {
        apiToken: 'test-token',
        baseUrl: 'https://api.samsara.test'
      }

      const complexPayload = {
        jobId: 'job-003',
        technicianId: 'tech-456',
        route: {
          waypoints: [
            { lat: 45.5, lon: -122.6 },
            { lat: 45.6, lon: -122.7 }
          ]
        },
        metadata: {
          priority: 'HIGH',
          estimatedTime: 3600
        }
      }

      const output: KernelOutput = {
        type: 'DISPATCH_REQUIRED',
        payload: complexPayload,
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await dispatchTechnician(config, output)

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(callBody).toEqual(complexPayload)
    })

    it('contains no conditional logic', async () => {
      const config = {
        apiToken: 'test-token',
        baseUrl: 'https://api.samsara.test'
      }

      // Different payloads should not change adapter behavior
      const outputs = [
        {
          type: 'DISPATCH_REQUIRED' as const,
          payload: { jobId: 'job-004', priority: 'HIGH' },
          timestamp: '2026-01-04T10:00:00Z'
        },
        {
          type: 'DISPATCH_REQUIRED' as const,
          payload: { jobId: 'job-005', priority: 'LOW' },
          timestamp: '2026-01-04T10:01:00Z'
        }
      ]

      for (const output of outputs) {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200
        })

        await dispatchTechnician(config, output)
      }

      // Verify all calls use same method/endpoint
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock.mock.calls[0][0]).toBe('https://api.samsara.test/fleet/dispatch')
      expect(fetchMock.mock.calls[1][0]).toBe('https://api.samsara.test/fleet/dispatch')
      expect(fetchMock.mock.calls[0][1].method).toBe('POST')
      expect(fetchMock.mock.calls[1][1].method).toBe('POST')
    })
  })

  describe('trackLocation', () => {
    it('calls API without using output parameter', async () => {
      const config = {
        apiToken: 'test-token',
        baseUrl: 'https://api.samsara.test'
      }

      const output: KernelOutput = {
        type: 'DISPATCH_REQUIRED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await trackLocation(config, output)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.samsara.test/fleet/locations',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })

    it('propagates API errors explicitly', async () => {
      const config = {
        apiToken: 'test-token',
        baseUrl: 'https://api.samsara.test'
      }

      const output: KernelOutput = {
        type: 'DISPATCH_REQUIRED',
        payload: {},
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await expect(trackLocation(config, output)).rejects.toThrow(
        'Samsara API error: 401'
      )
    })
  })

  describe('Adapter Purity', () => {
    it('does not mutate config', async () => {
      const config = {
        apiToken: 'test-token',
        baseUrl: 'https://api.samsara.test'
      }

      const configCopy = { ...config }

      const output: KernelOutput = {
        type: 'DISPATCH_REQUIRED',
        payload: { jobId: 'job-006' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await dispatchTechnician(config, output)

      expect(config).toEqual(configCopy)
    })

    it('does not mutate output', async () => {
      const config = {
        apiToken: 'test-token',
        baseUrl: 'https://api.samsara.test'
      }

      const output: KernelOutput = {
        type: 'DISPATCH_REQUIRED',
        payload: { jobId: 'job-007' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      const outputCopy = JSON.parse(JSON.stringify(output))

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await dispatchTechnician(config, output)

      expect(output).toEqual(outputCopy)
    })
  })
})
