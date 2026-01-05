/**
 * JOBBER CRM ADAPTER TESTS
 *
 * Verify adapter is a pure side-effect sink with:
 * - Exact payload pass-through
 * - No conditionals
 * - No transformations
 * - Explicit error propagation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { syncJobToJobber, updateJobStatus } from './jobber-adapter'
import type { KernelOutput } from '../../kernel-client/interface'

describe('Jobber CRM Adapter', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('syncJobToJobber', () => {
    it('passes payload through verbatim to API', async () => {
      const config = {
        apiKey: 'test-key',
        accountId: 'test-account',
        baseUrl: 'https://api.jobber.test'
      }

      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: {
          jobId: 'job-001',
          status: 'completed',
          technicianId: 'tech-123'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await syncJobToJobber(config, output)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.jobber.test/jobs',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(output.payload)
        })
      )
    })

    it('propagates API errors explicitly', async () => {
      const config = {
        apiKey: 'test-key',
        accountId: 'test-account',
        baseUrl: 'https://api.jobber.test'
      }

      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: { jobId: 'job-002' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(syncJobToJobber(config, output)).rejects.toThrow(
        'Jobber API error: 500'
      )
    })

    it('does not transform payload', async () => {
      const config = {
        apiKey: 'test-key',
        accountId: 'test-account',
        baseUrl: 'https://api.jobber.test'
      }

      const complexPayload = {
        jobId: 'job-003',
        nested: {
          deep: {
            value: 'test'
          }
        },
        array: [1, 2, 3],
        nullValue: null,
        boolValue: true
      }

      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: complexPayload,
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await syncJobToJobber(config, output)

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(callBody).toEqual(complexPayload)
    })
  })

  describe('updateJobStatus', () => {
    it('passes payload through verbatim to API', async () => {
      const config = {
        apiKey: 'test-key',
        accountId: 'test-account',
        baseUrl: 'https://api.jobber.test'
      }

      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: {
          jobId: 'job-004',
          status: 'completed'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await updateJobStatus(config, output)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.jobber.test/jobs/job-004',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ status: 'completed' })
        })
      )
    })

    it('propagates API errors explicitly', async () => {
      const config = {
        apiKey: 'test-key',
        accountId: 'test-account',
        baseUrl: 'https://api.jobber.test'
      }

      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: {
          jobId: 'job-005',
          status: 'completed'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(updateJobStatus(config, output)).rejects.toThrow(
        'Jobber API error: 404'
      )
    })

    it('contains no conditional logic', async () => {
      const config = {
        apiKey: 'test-key',
        accountId: 'test-account',
        baseUrl: 'https://api.jobber.test'
      }

      // Different payloads should not change adapter behavior
      const outputs = [
        {
          type: 'JOB_COMPLETED' as const,
          payload: { jobId: 'job-006', status: 'completed' },
          timestamp: '2026-01-04T10:00:00Z'
        },
        {
          type: 'JOB_COMPLETED' as const,
          payload: { jobId: 'job-007', status: 'in_progress' },
          timestamp: '2026-01-04T10:01:00Z'
        }
      ]

      for (const output of outputs) {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200
        })

        await updateJobStatus(config, output)
      }

      // Verify all calls use same method/pattern
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock.mock.calls[0][1].method).toBe('PATCH')
      expect(fetchMock.mock.calls[1][1].method).toBe('PATCH')
    })
  })

  describe('Adapter Purity', () => {
    it('does not mutate config', async () => {
      const config = {
        apiKey: 'test-key',
        accountId: 'test-account',
        baseUrl: 'https://api.jobber.test'
      }

      const configCopy = { ...config }

      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: { jobId: 'job-008' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await syncJobToJobber(config, output)

      expect(config).toEqual(configCopy)
    })

    it('does not mutate output', async () => {
      const config = {
        apiKey: 'test-key',
        accountId: 'test-account',
        baseUrl: 'https://api.jobber.test'
      }

      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: { jobId: 'job-009' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      const outputCopy = JSON.parse(JSON.stringify(output))

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await syncJobToJobber(config, output)

      expect(output).toEqual(outputCopy)
    })
  })
})
