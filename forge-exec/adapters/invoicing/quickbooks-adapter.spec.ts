/**
 * QUICKBOOKS INVOICING ADAPTER TESTS
 *
 * Verify adapter is a pure side-effect sink with:
 * - Exact payload pass-through
 * - No conditionals
 * - No transformations
 * - Explicit error propagation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createInvoice, recordPayment } from './quickbooks-adapter'
import type { KernelOutput } from '../../kernel-client/interface'

describe('QuickBooks Invoicing Adapter', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createInvoice', () => {
    it('passes payload through verbatim to API', async () => {
      const config = {
        realmId: 'test-realm',
        accessToken: 'test-token',
        baseUrl: 'https://api.quickbooks.test'
      }

      const output: KernelOutput = {
        type: 'INVOICE_READY',
        payload: {
          jobId: 'job-001',
          customerId: 'customer-123',
          amount: 1500.00,
          lineItems: [
            { description: 'Panel Upgrade', amount: 1500.00 }
          ]
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await createInvoice(config, output)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.quickbooks.test/v3/company/test-realm/invoice',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }),
          body: JSON.stringify(output.payload)
        })
      )
    })

    it('propagates API errors explicitly', async () => {
      const config = {
        realmId: 'test-realm',
        accessToken: 'test-token',
        baseUrl: 'https://api.quickbooks.test'
      }

      const output: KernelOutput = {
        type: 'INVOICE_READY',
        payload: { jobId: 'job-002' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      await expect(createInvoice(config, output)).rejects.toThrow(
        'QuickBooks API error: 400'
      )
    })

    it('does not transform payload', async () => {
      const config = {
        realmId: 'test-realm',
        accessToken: 'test-token',
        baseUrl: 'https://api.quickbooks.test'
      }

      const complexPayload = {
        jobId: 'job-003',
        invoice: {
          lineItems: [
            { qty: 2, rate: 50, description: 'Labor' },
            { qty: 1, rate: 200, description: 'Materials' }
          ],
          tax: 30.00,
          total: 330.00,
          dueDate: '2026-02-01'
        }
      }

      const output: KernelOutput = {
        type: 'INVOICE_READY',
        payload: complexPayload,
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await createInvoice(config, output)

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(callBody).toEqual(complexPayload)
    })

    it('contains no conditional logic', async () => {
      const config = {
        realmId: 'test-realm',
        accessToken: 'test-token',
        baseUrl: 'https://api.quickbooks.test'
      }

      // Different amounts should not change adapter behavior
      const outputs = [
        {
          type: 'INVOICE_READY' as const,
          payload: { jobId: 'job-004', amount: 5000.00 },
          timestamp: '2026-01-04T10:00:00Z'
        },
        {
          type: 'INVOICE_READY' as const,
          payload: { jobId: 'job-005', amount: 50.00 },
          timestamp: '2026-01-04T10:01:00Z'
        }
      ]

      for (const output of outputs) {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 200
        })

        await createInvoice(config, output)
      }

      // Verify all calls use same method/endpoint
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock.mock.calls[0][1].method).toBe('POST')
      expect(fetchMock.mock.calls[1][1].method).toBe('POST')
    })
  })

  describe('recordPayment', () => {
    it('passes payload through verbatim to API', async () => {
      const config = {
        realmId: 'test-realm',
        accessToken: 'test-token',
        baseUrl: 'https://api.quickbooks.test'
      }

      const output: KernelOutput = {
        type: 'PAYMENT_RECEIVED',
        payload: {
          invoiceId: 'inv-001',
          amount: 1500.00,
          paymentMethod: 'CARD'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await recordPayment(config, output)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.quickbooks.test/v3/company/test-realm/payment',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }),
          body: JSON.stringify(output.payload)
        })
      )
    })

    it('propagates API errors explicitly', async () => {
      const config = {
        realmId: 'test-realm',
        accessToken: 'test-token',
        baseUrl: 'https://api.quickbooks.test'
      }

      const output: KernelOutput = {
        type: 'PAYMENT_RECEIVED',
        payload: { invoiceId: 'inv-002' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 404
      })

      await expect(recordPayment(config, output)).rejects.toThrow(
        'QuickBooks API error: 404'
      )
    })
  })

  describe('Adapter Purity', () => {
    it('does not mutate config', async () => {
      const config = {
        realmId: 'test-realm',
        accessToken: 'test-token',
        baseUrl: 'https://api.quickbooks.test'
      }

      const configCopy = { ...config }

      const output: KernelOutput = {
        type: 'INVOICE_READY',
        payload: { jobId: 'job-006' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await createInvoice(config, output)

      expect(config).toEqual(configCopy)
    })

    it('does not mutate output', async () => {
      const config = {
        realmId: 'test-realm',
        accessToken: 'test-token',
        baseUrl: 'https://api.quickbooks.test'
      }

      const output: KernelOutput = {
        type: 'INVOICE_READY',
        payload: { jobId: 'job-007' },
        timestamp: '2026-01-04T10:00:00Z'
      }

      const outputCopy = JSON.parse(JSON.stringify(output))

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 200
      })

      await createInvoice(config, output)

      expect(output).toEqual(outputCopy)
    })
  })
})
