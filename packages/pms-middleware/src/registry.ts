// =============================================================================
// PMS Middleware — Adapter Registry
// =============================================================================
// Factory registry that maps vendor names to adapter constructors.

import type { PmsAdapter, PmsConfig } from './adapter';
import { createCloudbedsAdapter } from './adapters/cloudbeds.adapter';
import { createMewsAdapter } from './adapters/mews.adapter';

type AdapterFactory = (config: PmsConfig) => PmsAdapter;

export class PmsAdapterRegistry {
  private factories = new Map<string, AdapterFactory>();

  /** Register a factory for a given vendor name. */
  register(vendor: string, factory: AdapterFactory): void {
    this.factories.set(vendor.toLowerCase(), factory);
  }

  /** Create an adapter instance for the given vendor and config. */
  create(vendor: string, config: PmsConfig): PmsAdapter {
    const key = vendor.toLowerCase();
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(
        `No PMS adapter registered for vendor "${vendor}". ` +
          `Supported vendors: ${this.getSupportedVendors().join(', ')}`,
      );
    }
    return factory(config);
  }

  /** Return a list of all registered vendor names. */
  getSupportedVendors(): string[] {
    return Array.from(this.factories.keys());
  }
}

/**
 * Default registry instance pre-loaded with all built-in adapters.
 */
export function createDefaultRegistry(): PmsAdapterRegistry {
  const registry = new PmsAdapterRegistry();
  registry.register('cloudbeds', createCloudbedsAdapter);
  registry.register('mews', createMewsAdapter);
  return registry;
}
