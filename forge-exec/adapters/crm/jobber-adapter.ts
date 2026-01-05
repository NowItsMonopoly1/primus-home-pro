/**
 * JOBBER CRM ADAPTER
 *
 * DO NOT ADD LOGIC HERE.
 * This is a side-effect sink only.
 *
 * Responsibilities:
 * - Execute CRM operations exactly as instructed
 * - NO conditional logic
 * - NO transformations
 * - NO business decisions
 *
 * Forbidden:
 * - if/else statements
 * - switch statements
 * - loops
 * - data transformation logic
 */

import type { KernelOutput } from '../../kernel-client/interface'

export interface JobberConfig {
  readonly apiKey: string
  readonly accountId: string
  readonly baseUrl: string
}

/**
 * Execute CRM sync.
 * DO NOT ADD LOGIC - just call the external API.
 */
export async function syncJobToJobber(
  config: JobberConfig,
  output: Readonly<KernelOutput>
): Promise<void> {
  // Side-effect execution only
  // No logic, no branching, no decisions

  const response = await fetch(`${config.baseUrl}/jobs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(output.payload)
  })

  if (!response.ok) {
    throw new Error(`Jobber API error: ${response.status}`)
  }
}

/**
 * Update job status in CRM.
 * DO NOT ADD LOGIC - just call the external API.
 */
export async function updateJobStatus(
  config: JobberConfig,
  output: Readonly<KernelOutput>
): Promise<void> {
  const { jobId, status } = output.payload as { jobId: string; status: string }

  const response = await fetch(`${config.baseUrl}/jobs/${jobId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  })

  if (!response.ok) {
    throw new Error(`Jobber API error: ${response.status}`)
  }
}
