/**
 * REAL PRIMUS KERNEL CLIENT
 *
 * This is the production implementation of the Primus Kernel interface.
 * It communicates with the real Primus Kernel API over HTTP.
 *
 * DO NOT ADD BUSINESS LOGIC HERE - this is a network client only.
 *
 * Responsibilities:
 * - Send decision requests to Primus Kernel API
 * - Return kernel decisions verbatim
 * - Propagate errors explicitly
 * - NO enrichment, NO defaults, NO transformations
 */

import type {
  KernelInterface,
  DecisionRequest,
  KernelDecision
} from './interface'

export interface PrimusKernelConfig {
  readonly apiUrl: string
  readonly apiKey: string
  readonly timeout?: number
}

/**
 * Real Primus Kernel client implementation.
 * Communicates with Primus Kernel API over HTTP.
 *
 * DO NOT ADD LOGIC - just network transport.
 */
export class PrimusKernelClient implements KernelInterface {
  private readonly config: PrimusKernelConfig

  constructor(config: PrimusKernelConfig) {
    this.config = config
  }

  /**
   * Submit decision request to real Primus Kernel.
   * Returns kernel decision verbatim - no transformation.
   */
  async decide(request: DecisionRequest): Promise<KernelDecision> {
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.config.timeout || 30000
    )

    try {
      const response = await fetch(`${this.config.apiUrl}/decide`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Primus Kernel API error: ${response.status}`)
      }

      const decision = await response.json() as KernelDecision
      return decision
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Primus Kernel request timeout')
        }
        throw error
      }

      throw new Error('Unknown Primus Kernel error')
    }
  }
}

/**
 * Create a real Primus Kernel client instance.
 */
export function createPrimusKernel(config: PrimusKernelConfig): KernelInterface {
  return new PrimusKernelClient(config)
}
