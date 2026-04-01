import { BillingTier } from '@hotelcheckin/database';

export interface TierConfig {
  annualAllowance: number;
  monthlyPrice: number; // in cents CAD
  overagePerUnit: number; // in dollars CAD
}

/**
 * Billing tier configuration.
 * All prices in cents CAD except overagePerUnit which is in dollars.
 */
export const TIER_CONFIG: Record<BillingTier, TierConfig> = {
  STARTER: { annualAllowance: 500, monthlyPrice: 99_00, overagePerUnit: 0.5 },
  GROWTH: { annualAllowance: 2000, monthlyPrice: 249_00, overagePerUnit: 0.4 },
  SCALE: { annualAllowance: 5000, monthlyPrice: 499_00, overagePerUnit: 0.3 },
  ENTERPRISE: { annualAllowance: 20000, monthlyPrice: 999_00, overagePerUnit: 0.2 },
};

export const STRIPE_PROVIDER = 'STRIPE_CLIENT';
