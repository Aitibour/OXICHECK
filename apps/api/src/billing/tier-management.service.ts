import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { prisma, BillingTier, UsageEventType } from '@hotelcheckin/database';
import { TIER_CONFIG } from './billing.constants';

export interface TierRecommendation {
  currentTier: BillingTier;
  recommendedTier: BillingTier;
  reason: string;
  currentMonthlyCostCad: number;
  recommendedMonthlyCostCad: number;
  monthlySavingsCad: number;
  trailing12mCheckIns: number;
  projectedAnnualCheckIns: number;
}

export interface TierOption {
  tier: BillingTier;
  annualAllowance: number;
  monthlyPriceCad: number;
  annualPriceCad: number;
  overagePerUnit: number;
}

export interface CostEstimate {
  tier: BillingTier;
  projectedMonthlyUsage: number;
  baseMonthlyPriceCad: number;
  estimatedOverageCad: number;
  estimatedTotalMonthlyCad: number;
  annualAllowance: number;
  monthlyAllowance: number;
  isWithinAllowance: boolean;
  overageUnits: number;
}

@Injectable()
export class TierManagementService {
  private readonly logger = new Logger(TierManagementService.name);

  /**
   * Return all available billing tiers with pricing details.
   */
  getAvailableTiers(): TierOption[] {
    return (Object.keys(TIER_CONFIG) as BillingTier[]).map((tier) => {
      const config = TIER_CONFIG[tier];
      const monthlyPriceCad = config.monthlyPrice / 100;
      return {
        tier,
        annualAllowance: config.annualAllowance,
        monthlyPriceCad,
        annualPriceCad: monthlyPriceCad * 12,
        overagePerUnit: config.overagePerUnit,
      };
    });
  }

  /**
   * Estimate the monthly cost for a given tier and projected monthly usage.
   * The annual allowance is divided by 12 to get a monthly baseline.
   */
  estimateMonthlyCost(
    tier: BillingTier,
    projectedMonthlyUsage: number,
  ): CostEstimate {
    const config = TIER_CONFIG[tier];
    const baseMonthlyPriceCad = config.monthlyPrice / 100;
    // Pro-rate the annual allowance to monthly
    const monthlyAllowance = Math.floor(config.annualAllowance / 12);

    const overageUnits = Math.max(0, projectedMonthlyUsage - monthlyAllowance);
    const estimatedOverageCad = overageUnits * config.overagePerUnit;
    const estimatedTotalMonthlyCad = baseMonthlyPriceCad + estimatedOverageCad;

    return {
      tier,
      projectedMonthlyUsage,
      baseMonthlyPriceCad,
      estimatedOverageCad,
      estimatedTotalMonthlyCad,
      annualAllowance: config.annualAllowance,
      monthlyAllowance,
      isWithinAllowance: overageUnits === 0,
      overageUnits,
    };
  }

  /**
   * Analyze trailing 12-month usage and recommend the best-fit tier.
   * Considers both cost efficiency and overage avoidance.
   */
  async evaluateTierFit(organizationId: string): Promise<TierRecommendation> {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId },
    });

    if (!subscription) {
      throw new NotFoundException(
        `No subscription found for organization ${organizationId}`,
      );
    }

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(twelveMonthsAgo.getFullYear() - 1);

    // Aggregate all check-in events over the last 12 months
    const usageAgg = await prisma.usageRecord.aggregate({
      where: {
        organizationId,
        eventType: UsageEventType.PRE_CHECK_COMPLETED,
        createdAt: { gte: twelveMonthsAgo },
      },
      _sum: { count: true },
    });

    const trailing12mCheckIns = usageAgg._sum.count ?? 0;
    // Project to 12 months if we have less data
    const projectedAnnualCheckIns = trailing12mCheckIns;

    // Find the cheapest tier that covers the projected usage without overage
    const tiers = Object.keys(TIER_CONFIG) as BillingTier[];
    const currentTierConfig = TIER_CONFIG[subscription.tier];
    const currentMonthlyCostCad = currentTierConfig.monthlyPrice / 100;

    // Calculate effective cost at each tier (base + any overage on projected usage)
    let recommendedTier: BillingTier = subscription.tier;
    let lowestEffectiveCost = this.calculateEffectiveAnnualCost(
      subscription.tier,
      projectedAnnualCheckIns,
    );

    for (const tier of tiers) {
      const effectiveCost = this.calculateEffectiveAnnualCost(
        tier,
        projectedAnnualCheckIns,
      );
      if (effectiveCost < lowestEffectiveCost) {
        lowestEffectiveCost = effectiveCost;
        recommendedTier = tier;
      }
    }

    const recommendedConfig = TIER_CONFIG[recommendedTier];
    const recommendedMonthlyCostCad = recommendedConfig.monthlyPrice / 100;

    const currentEffectiveMonthly = this.calculateEffectiveAnnualCost(
      subscription.tier,
      projectedAnnualCheckIns,
    ) / 12;
    const recommendedEffectiveMonthly = lowestEffectiveCost / 12;
    const monthlySavingsCad = currentEffectiveMonthly - recommendedEffectiveMonthly;

    let reason: string;
    if (recommendedTier === subscription.tier) {
      reason = `Your current ${subscription.tier} plan is the best fit for your projected usage of ${projectedAnnualCheckIns.toLocaleString()} check-ins/year.`;
    } else if (
      tiers.indexOf(recommendedTier) < tiers.indexOf(subscription.tier)
    ) {
      reason = `Your usage of ${projectedAnnualCheckIns.toLocaleString()} check-ins/year is well below the ${subscription.tier} allowance. Downgrading to ${recommendedTier} saves approximately $${Math.abs(monthlySavingsCad).toFixed(2)} CAD/month.`;
    } else {
      reason = `Your projected usage of ${projectedAnnualCheckIns.toLocaleString()} check-ins/year is approaching or exceeding your current ${subscription.tier} allowance. Upgrading to ${recommendedTier} will avoid overage charges and save approximately $${Math.abs(monthlySavingsCad).toFixed(2)} CAD/month.`;
    }

    this.logger.log(
      `Tier recommendation for org ${organizationId}: ${subscription.tier} → ${recommendedTier}`,
    );

    return {
      currentTier: subscription.tier,
      recommendedTier,
      reason,
      currentMonthlyCostCad,
      recommendedMonthlyCostCad,
      monthlySavingsCad,
      trailing12mCheckIns,
      projectedAnnualCheckIns,
    };
  }

  // ─── Private Helpers ────────────────────────────────────────────────

  private calculateEffectiveAnnualCost(
    tier: BillingTier,
    projectedAnnualUsage: number,
  ): number {
    const config = TIER_CONFIG[tier];
    const annualBase = (config.monthlyPrice / 100) * 12;
    const overageUnits = Math.max(0, projectedAnnualUsage - config.annualAllowance);
    const overageCost = overageUnits * config.overagePerUnit;
    return annualBase + overageCost;
  }
}
