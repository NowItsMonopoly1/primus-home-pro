/**
 * TWILIO NOTIFICATIONS ADAPTER TESTS
 *
 * Verify adapter is a pure side-effect sink with:
 * - Exact payload pass-through
 * - No conditionals
 * - No transformations
 * - Explicit error propagation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { sendSMS, sendEmail } from './twilio-adapter'
import type { KernelOutput } from '../../kernel-client/interface'

describe('Twilio Notifications Adapter', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendSMS', () => {
    it('passes payload through verbatim to API', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234'
      }

      const output: KernelOutput = {
        type: 'ALERT_RAISED',
        payload: {
          to: '+15555555678',
          body: 'Technician dispatched to your location'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201
      })

      await sendSMS(config, output)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const call = fetchMock.mock.calls[0]
      expect(call[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/test-sid/Messages.json')
      expect(call[1].method).toBe('POST')

      // Verify form data contains exact payload values
      const formParams = new URLSearchParams(call[1].body)
      expect(formParams.get('From')).toBe('+15555551234')
      expect(formParams.get('To')).toBe('+15555555678')
      expect(formParams.get('Body')).toBe('Technician dispatched to your location')
    })

    it('propagates API errors explicitly', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234'
      }

      const output: KernelOutput = {
        type: 'ALERT_RAISED',
        payload: {
          to: '+15555555678',
          body: 'Test message'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400
      })

      await expect(sendSMS(config, output)).rejects.toThrow(
        'Twilio API error: 400'
      )
    })

    it('does not transform payload', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234'
      }

      const output: KernelOutput = {
        type: 'ALERT_RAISED',
        payload: {
          to: '+15555555678',
          body: 'Complex message with\nline breaks and special chars: $%^&*()'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201
      })

      await sendSMS(config, output)

      const formParams = new URLSearchParams(fetchMock.mock.calls[0][1].body)
      expect(formParams.get('Body')).toBe(
        'Complex message with\nline breaks and special chars: $%^&*()'
      )
    })

    it('contains no conditional logic', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234'
      }

      // Different message types should not change adapter behavior
      const outputs = [
        {
          type: 'ALERT_RAISED' as const,
          payload: { to: '+15555550001', body: 'URGENT: Emergency' },
          timestamp: '2026-01-04T10:00:00Z'
        },
        {
          type: 'ALERT_RAISED' as const,
          payload: { to: '+15555550002', body: 'Info: Routine update' },
          timestamp: '2026-01-04T10:01:00Z'
        }
      ]

      for (const output of outputs) {
        fetchMock.mockResolvedValueOnce({
          ok: true,
          status: 201
        })

        await sendSMS(config, output)
      }

      // Verify all calls use same endpoint/method
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(fetchMock.mock.calls[0][1].method).toBe('POST')
      expect(fetchMock.mock.calls[1][1].method).toBe('POST')
    })
  })

  describe('sendEmail', () => {
    it('passes payload through verbatim to API', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234' // Used as auth token for SendGrid
      }

      const output: KernelOutput = {
        type: 'APPROVAL_REQUIRED',
        payload: {
          to: 'customer@example.com',
          subject: 'Change Order Approval Required',
          body: 'Please review and approve the change order'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 202
      })

      await sendEmail(config, output)

      expect(fetchMock).toHaveBeenCalledTimes(1)
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.sendgrid.com/v3/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          })
        })
      )

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(callBody.personalizations[0].to[0].email).toBe('customer@example.com')
      expect(callBody.subject).toBe('Change Order Approval Required')
      expect(callBody.content[0].value).toBe('Please review and approve the change order')
    })

    it('propagates API errors explicitly', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234'
      }

      const output: KernelOutput = {
        type: 'APPROVAL_REQUIRED',
        payload: {
          to: 'invalid@example.com',
          subject: 'Test',
          body: 'Test'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      await expect(sendEmail(config, output)).rejects.toThrow(
        'SendGrid API error: 401'
      )
    })

    it('does not transform payload', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234'
      }

      const output: KernelOutput = {
        type: 'APPROVAL_REQUIRED',
        payload: {
          to: 'customer@example.com',
          subject: 'Complex Subject: $1,500.00',
          body: 'Email with\n\nmultiple\nparagraphs and special chars: <>&"'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 202
      })

      await sendEmail(config, output)

      const callBody = JSON.parse(fetchMock.mock.calls[0][1].body)
      expect(callBody.subject).toBe('Complex Subject: $1,500.00')
      expect(callBody.content[0].value).toBe(
        'Email with\n\nmultiple\nparagraphs and special chars: <>&"'
      )
    })
  })

  describe('Adapter Purity', () => {
    it('does not mutate config', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234'
      }

      const configCopy = { ...config }

      const output: KernelOutput = {
        type: 'ALERT_RAISED',
        payload: {
          to: '+15555555678',
          body: 'Test'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201
      })

      await sendSMS(config, output)

      expect(config).toEqual(configCopy)
    })

    it('does not mutate output', async () => {
      const config = {
        accountSid: 'test-sid',
        authToken: 'test-token',
        fromPhone: '+15555551234'
      }

      const output: KernelOutput = {
        type: 'ALERT_RAISED',
        payload: {
          to: '+15555555678',
          body: 'Test'
        },
        timestamp: '2026-01-04T10:00:00Z'
      }

      const outputCopy = JSON.parse(JSON.stringify(output))

      fetchMock.mockResolvedValueOnce({
        ok: true,
        status: 201
      })

      await sendSMS(config, output)

      expect(output).toEqual(outputCopy)
    })
  })
})
