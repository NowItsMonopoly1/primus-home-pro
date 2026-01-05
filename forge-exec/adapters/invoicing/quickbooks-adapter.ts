/**
 * QUICKBOOKS INVOICING ADAPTER
 *
 * DO NOT ADD LOGIC HERE.
 * This is a side-effect sink only.
 *
 * Responsibilities:
 * - Execute invoicing operations exactly as instructed
 * - NO conditional logic
 * - NO transformations
 * - NO business decisions
 */

import type { KernelOutput } from '../../kernel-client/interface'

export interface QuickBooksConfig {
  readonly realmId: string
  readonly accessToken: string
  readonly baseUrl: string
}

/**
 * Create invoice in QuickBooks.
 * DO NOT ADD LOGIC - just call the external API.
 */
export async function createInvoice(
  config: QuickBooksConfig,
  output: Readonly<KernelOutput>
): Promise<void> {
  const response = await fetch(
    `${config.baseUrl}/v3/company/${config.realmId}/invoice`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(output.payload)
    }
  )

  if (!response.ok) {
    throw new Error(`QuickBooks API error: ${response.status}`)
  }
}

/**
 * Record payment in QuickBooks.
 * DO NOT ADD LOGIC - just call the external API.
 */
export async function recordPayment(
  config: QuickBooksConfig,
  output: Readonly<KernelOutput>
): Promise<void> {
  const response = await fetch(
    `${config.baseUrl}/v3/company/${config.realmId}/payment`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(output.payload)
    }
  )

  if (!response.ok) {
    throw new Error(`QuickBooks API error: ${response.status}`)
  }
}
