/**
 * SAMSARA DISPATCH ADAPTER
 *
 * DO NOT ADD LOGIC HERE.
 * This is a side-effect sink only.
 *
 * Responsibilities:
 * - Execute dispatch operations exactly as instructed
 * - NO conditional logic
 * - NO transformations
 * - NO business decisions
 */

import type { KernelOutput } from '../../kernel-client/interface'

export interface SamsaraConfig {
  readonly apiToken: string
  readonly baseUrl: string
}

/**
 * Dispatch technician to job.
 * DO NOT ADD LOGIC - just call the external API.
 */
export async function dispatchTechnician(
  config: SamsaraConfig,
  output: Readonly<KernelOutput>
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/fleet/dispatch`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(output.payload)
  })

  if (!response.ok) {
    throw new Error(`Samsara API error: ${response.status}`)
  }
}

/**
 * Track technician GPS location.
 * DO NOT ADD LOGIC - just call the external API.
 */
export async function trackLocation(
  config: SamsaraConfig,
  _output: Readonly<KernelOutput>
): Promise<void> {
  const response = await fetch(`${config.baseUrl}/fleet/locations`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${config.apiToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Samsara API error: ${response.status}`)
  }
}
