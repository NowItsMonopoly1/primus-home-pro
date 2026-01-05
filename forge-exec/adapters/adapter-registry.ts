/**
 * ADAPTER REGISTRY
 *
 * DO NOT HARD-CODE VERTICAL-SPECIFIC ADAPTERS HERE.
 * This registry is injected at runtime by the vertical configuration.
 *
 * The registry is a dumb map - it does not know about NLE, HVAC, or any vertical.
 */

import type { KernelOutput, OutputType } from '../kernel-client/interface'

export type AdapterFunction = (
  config: any,
  output: Readonly<KernelOutput>
) => Promise<void>

/**
 * Adapter registry interface.
 * Verticals inject their adapter mappings at runtime.
 */
export interface AdapterRegistry {
  readonly adapters: Map<OutputType, AdapterFunction>
}

/**
 * Create an empty adapter registry.
 * Vertical configurations populate this at runtime.
 */
export function createAdapterRegistry(): AdapterRegistry {
  return {
    adapters: new Map()
  }
}

/**
 * Register an adapter for an output type.
 * Called by vertical configuration during initialization.
 *
 * DO NOT ADD LOGIC - this is dependency injection only.
 */
export function registerAdapter(
  registry: AdapterRegistry,
  outputType: OutputType,
  adapter: AdapterFunction
): void {
  registry.adapters.set(outputType, adapter)
}

/**
 * Execute adapter for given output.
 * DO NOT ADD LOGIC - just lookup and call.
 */
export async function executeAdapter(
  registry: AdapterRegistry,
  outputType: OutputType,
  config: any,
  output: Readonly<KernelOutput>
): Promise<void> {
  const adapter = registry.adapters.get(outputType)

  if (!adapter) {
    throw new Error(`No adapter registered for output type: ${outputType}`)
  }

  await adapter(config, output)
}
