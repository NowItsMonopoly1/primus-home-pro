/**
 * NEXT LEVEL ELECTRIC ADAPTER WIRING
 *
 * This file wires NLE-specific adapters into the ForgeExec adapter registry.
 * This is the ONLY place that knows which adapters NLE uses.
 *
 * DO NOT ADD LOGIC HERE - this is dependency injection only.
 */

import type { AdapterRegistry } from '../../adapters/adapter-registry'
import { registerAdapter } from '../../adapters/adapter-registry'
import { updateJobStatus } from '../../adapters/crm/jobber-adapter'
import { dispatchTechnician } from '../../adapters/dispatch/samsara-adapter'
import { createInvoice, recordPayment } from '../../adapters/invoicing/quickbooks-adapter'
import { sendSMS, sendEmail } from '../../adapters/notifications/twilio-adapter'

/**
 * Wire NLE-specific adapters into the registry.
 * This is called during NLE initialization.
 *
 * DO NOT ADD LOGIC - just registration calls.
 */
export function wireNLEAdapters(registry: AdapterRegistry): void {
  // CRM adapters
  registerAdapter(registry, 'JOB_COMPLETED', updateJobStatus)

  // Dispatch adapters
  registerAdapter(registry, 'DISPATCH_REQUIRED', dispatchTechnician)

  // Invoicing adapters
  registerAdapter(registry, 'INVOICE_READY', createInvoice)
  registerAdapter(registry, 'PAYMENT_RECEIVED', recordPayment)

  // Notification adapters
  registerAdapter(registry, 'ALERT_RAISED', sendSMS)
  registerAdapter(registry, 'APPROVAL_REQUIRED', sendEmail)
  registerAdapter(registry, 'INSPECTION_REQUIRED', sendEmail)
}

/**
 * NLE adapter configuration.
 * This is what gets passed to the wired adapters.
 */
export interface NLEAdapterConfigs {
  readonly jobber: {
    readonly apiKey: string
    readonly accountId: string
    readonly baseUrl: string
  }
  readonly samsara: {
    readonly apiToken: string
    readonly baseUrl: string
  }
  readonly quickbooks: {
    readonly realmId: string
    readonly accessToken: string
    readonly baseUrl: string
  }
  readonly twilio: {
    readonly accountSid: string
    readonly authToken: string
    readonly fromPhone: string
  }
}
