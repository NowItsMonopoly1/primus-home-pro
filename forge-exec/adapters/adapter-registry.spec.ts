/**
 * ADAPTER REGISTRY TESTS
 *
 * Tests for the adapter registry system.
 * DO NOT ADD BUSINESS LOGIC - only test the registry mechanism.
 */

import { describe, it, expect, vi } from 'vitest'
import { createAdapterRegistry, registerAdapter, executeAdapter } from './adapter-registry'
import type { KernelOutput } from '../kernel-client/interface'

describe('AdapterRegistry', () => {
  describe('createAdapterRegistry', () => {
    it('creates an empty registry', () => {
      const registry = createAdapterRegistry()
      
      expect(registry.adapters.size).toBe(0)
    })
  })

  describe('registerAdapter', () => {
    it('registers an adapter for an output type', () => {
      const registry = createAdapterRegistry()
      const mockAdapter = vi.fn()

      registerAdapter(registry, 'JOB_COMPLETED', mockAdapter)

      expect(registry.adapters.get('JOB_COMPLETED')).toBe(mockAdapter)
    })

    it('allows multiple adapter types to be registered', () => {
      const registry = createAdapterRegistry()
      const crmAdapter = vi.fn()
      const smsAdapter = vi.fn()

      registerAdapter(registry, 'JOB_COMPLETED', crmAdapter)
      registerAdapter(registry, 'ALERT_RAISED', smsAdapter)

      expect(registry.adapters.size).toBe(2)
      expect(registry.adapters.get('JOB_COMPLETED')).toBe(crmAdapter)
      expect(registry.adapters.get('ALERT_RAISED')).toBe(smsAdapter)
    })

    it('overwrites existing adapter if re-registered', () => {
      const registry = createAdapterRegistry()
      const adapter1 = vi.fn()
      const adapter2 = vi.fn()

      registerAdapter(registry, 'JOB_COMPLETED', adapter1)
      registerAdapter(registry, 'JOB_COMPLETED', adapter2)

      expect(registry.adapters.get('JOB_COMPLETED')).toBe(adapter2)
    })
  })

  describe('executeAdapter', () => {
    it('executes the correct adapter for output type', async () => {
      const registry = createAdapterRegistry()
      const mockAdapter = vi.fn().mockResolvedValue(undefined)
      const mockConfig = { apiKey: 'test' }
      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: { jobId: 'job-123' },
        timestamp: '2026-01-04T12:00:00Z'
      }

      registerAdapter(registry, 'JOB_COMPLETED', mockAdapter)

      await executeAdapter(registry, 'JOB_COMPLETED', mockConfig, output)

      expect(mockAdapter).toHaveBeenCalledWith(mockConfig, output)
      expect(mockAdapter).toHaveBeenCalledTimes(1)
    })

    it('throws error if adapter not found for output type', async () => {
      const registry = createAdapterRegistry()
      const output: KernelOutput = {
        type: 'UNKNOWN_TYPE' as any,
        payload: {},
        timestamp: '2026-01-04T12:00:00Z'
      }

      await expect(
        executeAdapter(registry, 'UNKNOWN_TYPE' as any, {}, output)
      ).rejects.toThrow('No adapter registered for output type: UNKNOWN_TYPE')
    })

    it('passes adapter errors through unchanged', async () => {
      const registry = createAdapterRegistry()
      const mockAdapter = vi.fn().mockRejectedValue(new Error('API error'))
      const output: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: {},
        timestamp: '2026-01-04T12:00:00Z'
      }

      registerAdapter(registry, 'JOB_COMPLETED', mockAdapter)

      await expect(
        executeAdapter(registry, 'JOB_COMPLETED', {}, output)
      ).rejects.toThrow('API error')
    })

    it('handles multiple sequential adapter executions', async () => {
      const registry = createAdapterRegistry()
      const mockAdapter = vi.fn().mockResolvedValue(undefined)
      const output1: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: { jobId: 'job-1' },
        timestamp: '2026-01-04T12:00:00Z'
      }
      const output2: KernelOutput = {
        type: 'JOB_COMPLETED',
        payload: { jobId: 'job-2' },
        timestamp: '2026-01-04T12:01:00Z'
      }

      registerAdapter(registry, 'JOB_COMPLETED', mockAdapter)

      await executeAdapter(registry, 'JOB_COMPLETED', {}, output1)
      await executeAdapter(registry, 'JOB_COMPLETED', {}, output2)

      expect(mockAdapter).toHaveBeenCalledTimes(2)
      expect(mockAdapter).toHaveBeenNthCalledWith(1, {}, output1)
      expect(mockAdapter).toHaveBeenNthCalledWith(2, {}, output2)
    })
  })
})
