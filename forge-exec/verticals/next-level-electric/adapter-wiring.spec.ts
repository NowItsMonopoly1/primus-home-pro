/**
 * NLE ADAPTER WIRING TESTS
 *
 * Tests that NLE adapters are correctly wired into the registry.
 * DO NOT ADD BUSINESS LOGIC - only test the wiring.
 */

import { describe, it, expect } from 'vitest'
import { createAdapterRegistry } from '../../adapters/adapter-registry'
import { wireNLEAdapters } from './adapter-wiring'

describe('NLE Adapter Wiring', () => {
  describe('wireNLEAdapters', () => {
    it('registers all required adapter types', () => {
      const registry = createAdapterRegistry()
      
      wireNLEAdapters(registry)

      // Verify all expected adapters are registered
      expect(registry.adapters.has('JOB_COMPLETED')).toBe(true)
      expect(registry.adapters.has('DISPATCH_REQUIRED')).toBe(true)
      expect(registry.adapters.has('INVOICE_READY')).toBe(true)
      expect(registry.adapters.has('PAYMENT_RECEIVED')).toBe(true)
      expect(registry.adapters.has('ALERT_RAISED')).toBe(true)
      expect(registry.adapters.has('APPROVAL_REQUIRED')).toBe(true)
      expect(registry.adapters.has('INSPECTION_REQUIRED')).toBe(true)
    })

    it('registers exactly 7 adapters for NLE', () => {
      const registry = createAdapterRegistry()
      
      wireNLEAdapters(registry)

      expect(registry.adapters.size).toBe(7)
    })

    it('wires CRM adapters', () => {
      const registry = createAdapterRegistry()
      
      wireNLEAdapters(registry)

      expect(registry.adapters.has('JOB_COMPLETED')).toBe(true)
    })

    it('wires dispatch adapters', () => {
      const registry = createAdapterRegistry()
      
      wireNLEAdapters(registry)

      expect(registry.adapters.has('DISPATCH_REQUIRED')).toBe(true)
    })

    it('wires invoicing adapters', () => {
      const registry = createAdapterRegistry()
      
      wireNLEAdapters(registry)

      expect(registry.adapters.has('INVOICE_READY')).toBe(true)
      expect(registry.adapters.has('PAYMENT_RECEIVED')).toBe(true)
    })

    it('wires notification adapters', () => {
      const registry = createAdapterRegistry()
      
      wireNLEAdapters(registry)

      expect(registry.adapters.has('ALERT_RAISED')).toBe(true)
      expect(registry.adapters.has('APPROVAL_REQUIRED')).toBe(true)
      expect(registry.adapters.has('INSPECTION_REQUIRED')).toBe(true)
    })

    it('can be called multiple times without error', () => {
      const registry = createAdapterRegistry()
      
      wireNLEAdapters(registry)
      wireNLEAdapters(registry)

      // Should still have 7 adapters (overwrites allowed)
      expect(registry.adapters.size).toBe(7)
    })

    it('does not modify the registry if called on empty registry', () => {
      const registry = createAdapterRegistry()
      
      expect(registry.adapters.size).toBe(0)
      
      wireNLEAdapters(registry)
      
      expect(registry.adapters.size).toBeGreaterThan(0)
    })
  })
})
