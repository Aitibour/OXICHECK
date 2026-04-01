'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getBillingSubscription,
  getOverageStatus,
  getAvailableTiers,
  getTierRecommendation,
  estimateMonthlyCost,
  getInvoiceHistory,
  changeBillingTier,
  getInvoicePdfUrl,
  DashboardApiError,
  type BillingSubscription,
  type OverageStatus,
  type TierOption,
  type TierRecommendation,
  type CostEstimate,
  type InvoiceHistoryResponse,
} from '@/lib/dashboard-api';
import { UsageBar } from '@/components/dashboard/UsageBar';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fmtCad(amount: number) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount);
}

function fmtDate(dateStr: string | null | undefined) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const TIER_ORDER: Record<string, number> = {
  STARTER: 0,
  GROWTH: 1,
  SCALE: 2,
  ENTERPRISE: 3,
};

const TIER_COLORS: Record<string, string> = {
  STARTER: 'bg-slate-100 text-slate-700 border-slate-200',
  GROWTH: 'bg-blue-100 text-blue-700 border-blue-200',
  SCALE: 'bg-purple-100 text-purple-700 border-purple-200',
  ENTERPRISE: 'bg-amber-100 text-amber-700 border-amber-200',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  TRIALING: 'bg-blue-100 text-blue-700',
  PAST_DUE: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const INVOICE_STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  open: 'bg-amber-100 text-amber-700',
  void: 'bg-gray-100 text-gray-500',
  uncollectible: 'bg-red-100 text-red-700',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">
      {children}
    </h2>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span className="text-sm">Loading billing data…</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Usage chart — daily check-in sparkline (simple SVG bar chart)
// ---------------------------------------------------------------------------

interface UsageChartProps {
  subscription: BillingSubscription;
}

function UsageChart({ subscription }: UsageChartProps) {
  const byType = subscription.usage?.byEventType ?? [];
  const checkIns =
    byType.find((e) => e.eventType === 'PRE_CHECK_COMPLETED')?.total ?? 0;
  const emails = byType.find((e) => e.eventType === 'EMAIL_SENT')?.total ?? 0;
  const sms = byType.find((e) => e.eventType === 'SMS_SENT')?.total ?? 0;

  const items = [
    { label: 'Pre-Check Completions', value: checkIns, color: '#2563eb' },
    { label: 'Emails Sent', value: emails, color: '#7c3aed' },
    { label: 'SMS Sent', value: sms, color: '#0891b2' },
  ];

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label}>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-[var(--color-text-muted)]">{item.label}</span>
            <span className="font-semibold text-[var(--color-text)]">
              {item.value.toLocaleString()}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tier selector with cost estimator
// ---------------------------------------------------------------------------

interface TierSelectorProps {
  currentTier: string;
  tiers: TierOption[];
  onChangeTier: (tier: string) => Promise<void>;
  isChanging: boolean;
}

function TierSelector({
  currentTier,
  tiers,
  onChangeTier,
  isChanging,
}: TierSelectorProps) {
  const [selectedTier, setSelectedTier] = useState(currentTier);
  const [projectedUsage, setProjectedUsage] = useState(100);
  const [estimate, setEstimate] = useState<CostEstimate | null>(null);
  const [estimating, setEstimating] = useState(false);

  const sortedTiers = [...tiers].sort(
    (a, b) => (TIER_ORDER[a.tier] ?? 99) - (TIER_ORDER[b.tier] ?? 99),
  );

  useEffect(() => {
    let cancelled = false;
    setEstimating(true);
    estimateMonthlyCost(selectedTier, projectedUsage)
      .then((est) => {
        if (!cancelled) setEstimate(est);
      })
      .catch(() => {
        if (!cancelled) setEstimate(null);
      })
      .finally(() => {
        if (!cancelled) setEstimating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedTier, projectedUsage]);

  const canChange = selectedTier !== currentTier && !isChanging;

  return (
    <div className="space-y-5">
      {/* Tier cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sortedTiers.map((t) => {
          const isCurrent = t.tier === currentTier;
          const isSelected = t.tier === selectedTier;
          return (
            <button
              key={t.tier}
              type="button"
              onClick={() => setSelectedTier(t.tier)}
              className={[
                'text-left p-4 rounded-xl border-2 transition-all',
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-[var(--color-border)] hover:border-blue-300 bg-white',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TIER_COLORS[t.tier] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
                >
                  {t.tier}
                </span>
                {isCurrent && (
                  <span className="text-xs text-blue-600 font-medium">
                    Current
                  </span>
                )}
              </div>
              <p className="text-lg font-bold text-[var(--color-text)]">
                {fmtCad(t.monthlyPriceCad)}
                <span className="text-xs font-normal text-[var(--color-text-muted)]">
                  /mo
                </span>
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {t.annualAllowance.toLocaleString()} check-ins/yr
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                Overage: {fmtCad(t.overagePerUnit)}/unit
              </p>
            </button>
          );
        })}
      </div>

      {/* Cost estimator */}
      <div className="bg-gray-50 rounded-xl border border-[var(--color-border)] p-5">
        <p className="text-sm font-semibold text-[var(--color-text)] mb-3">
          Cost Estimator
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label
              htmlFor="projected-usage"
              className="text-sm text-[var(--color-text-muted)] whitespace-nowrap"
            >
              Monthly check-ins:
            </label>
            <input
              id="projected-usage"
              type="number"
              min={0}
              value={projectedUsage}
              onChange={(e) =>
                setProjectedUsage(Math.max(0, parseInt(e.target.value) || 0))
              }
              className="w-24 px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {estimating ? (
            <span className="text-sm text-[var(--color-text-muted)]">
              Calculating…
            </span>
          ) : estimate ? (
            <div className="flex flex-wrap gap-4 text-sm">
              <span>
                Base:{' '}
                <strong>{fmtCad(estimate.baseMonthlyPriceCad)}</strong>
              </span>
              {estimate.estimatedOverageCad > 0 && (
                <span className="text-amber-700">
                  Overage:{' '}
                  <strong>{fmtCad(estimate.estimatedOverageCad)}</strong> (
                  {estimate.overageUnits.toLocaleString()} units)
                </span>
              )}
              <span className="font-bold text-blue-700">
                Total: {fmtCad(estimate.estimatedTotalMonthlyCad)}/mo
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Confirm change button */}
      {selectedTier !== currentTier && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChangeTier(selectedTier)}
            disabled={!canChange}
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isChanging
              ? 'Changing…'
              : `Switch to ${selectedTier}`}
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier(currentTier)}
            className="px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function BillingPage() {
  const [subscription, setSubscription] = useState<BillingSubscription | null>(
    null,
  );
  const [overage, setOverage] = useState<OverageStatus | null>(null);
  const [tiers, setTiers] = useState<TierOption[]>([]);
  const [recommendation, setRecommendation] =
    useState<TierRecommendation | null>(null);
  const [invoices, setInvoices] = useState<InvoiceHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isChangingTier, setIsChangingTier] = useState(false);
  const [tierChangeSuccess, setTierChangeSuccess] = useState<string | null>(
    null,
  );

  const loadBillingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [subResult, tiersResult, invoicesResult] = await Promise.allSettled([
        getBillingSubscription(),
        getAvailableTiers(),
        getInvoiceHistory({ limit: 10 }),
      ]);

      if (subResult.status === 'fulfilled') {
        setSubscription(subResult.value);
      }
      if (tiersResult.status === 'fulfilled') {
        setTiers(tiersResult.value);
      }
      if (invoicesResult.status === 'fulfilled') {
        setInvoices(invoicesResult.value);
      }

      // Load non-critical data after
      if (subResult.status === 'fulfilled') {
        const [overageResult, recResult] = await Promise.allSettled([
          getOverageStatus(),
          getTierRecommendation(),
        ]);
        if (overageResult.status === 'fulfilled') setOverage(overageResult.value);
        if (recResult.status === 'fulfilled') setRecommendation(recResult.value);
      }
    } catch (err) {
      setError(
        err instanceof DashboardApiError
          ? err.message
          : 'Could not load billing data.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  async function handleChangeTier(newTier: string) {
    setIsChangingTier(true);
    setTierChangeSuccess(null);
    try {
      const updated = await changeBillingTier(newTier);
      setSubscription(updated);
      setTierChangeSuccess(
        `Successfully switched to ${newTier} plan.`,
      );
      // Refresh overage and recommendation
      const [overageResult, recResult] = await Promise.allSettled([
        getOverageStatus(),
        getTierRecommendation(),
      ]);
      if (overageResult.status === 'fulfilled') setOverage(overageResult.value);
      if (recResult.status === 'fulfilled') setRecommendation(recResult.value);
    } catch (err) {
      setError(
        err instanceof DashboardApiError
          ? err.message
          : 'Failed to change subscription tier.',
      );
    } finally {
      setIsChangingTier(false);
    }
  }

  const checkInUsed =
    subscription?.usage?.byEventType?.find(
      (e) => e.eventType === 'PRE_CHECK_COMPLETED',
    )?.total ?? 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Billing
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Manage your subscription, monitor usage, and download invoices
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {tierChangeSuccess && (
        <div
          role="status"
          className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700"
        >
          {tierChangeSuccess}
        </div>
      )}

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {/* ── Current Subscription Card ── */}
          {subscription && (
            <div className="card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                <div>
                  <SectionHeading>Current Subscription</SectionHeading>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${TIER_COLORS[subscription.tier] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}
                    >
                      {subscription.tier}
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[subscription.status] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {subscription.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {fmtCad(
                      (subscription.tierConfig?.monthlyPrice ?? 0) / 100,
                    )}
                    <span className="text-sm font-normal text-[var(--color-text-muted)]">
                      {' '}
                      / month
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Period: {fmtDate(subscription.currentPeriodStart)} —{' '}
                    {fmtDate(subscription.currentPeriodEnd)}
                  </p>
                </div>
              </div>

              {/* Usage bar */}
              <div className="mb-6">
                <UsageBar
                  used={checkInUsed}
                  allowance={subscription.annualCheckInAllowance}
                  label="Annual check-in allowance"
                />
              </div>

              {/* Usage breakdown chart */}
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)] mb-3">
                  Current Period Usage
                </p>
                <UsageChart subscription={subscription} />
              </div>
            </div>
          )}

          {/* ── Overage Card (only when there is overage) ── */}
          {overage?.isOverage && (
            <div className="card p-6 border-amber-300 bg-amber-50">
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">
                  ⚠
                </span>
                <div>
                  <p className="font-semibold text-amber-800 mb-1">
                    Overage Charges Active
                  </p>
                  <p className="text-sm text-amber-700">
                    You have used{' '}
                    <strong>{overage.used.toLocaleString()}</strong> check-ins
                    against your allowance of{' '}
                    <strong>{overage.allowance.toLocaleString()}</strong>.
                    Overage units:{' '}
                    <strong>{overage.overageUnits.toLocaleString()}</strong> @{' '}
                    {fmtCad(overage.overageRatePerUnit)} each ={' '}
                    <strong>{fmtCad(overage.overageAmountCad)}</strong> CAD.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Tier Recommendation ── */}
          {recommendation &&
            recommendation.recommendedTier !== recommendation.currentTier && (
              <div className="card p-6 border-blue-200 bg-blue-50">
                <div className="flex items-start gap-3">
                  <span className="text-2xl" aria-hidden="true">
                    💡
                  </span>
                  <div>
                    <p className="font-semibold text-blue-800 mb-1">
                      Tier Recommendation
                    </p>
                    <p className="text-sm text-blue-700">
                      {recommendation.reason}
                    </p>
                    {Math.abs(recommendation.monthlySavingsCad) > 0 && (
                      <p className="text-sm font-semibold text-blue-800 mt-1">
                        {recommendation.monthlySavingsCad > 0
                          ? `Save ~${fmtCad(recommendation.monthlySavingsCad)}/month`
                          : `Estimated additional cost: ~${fmtCad(Math.abs(recommendation.monthlySavingsCad))}/month`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* ── Tier Selector ── */}
          {tiers.length > 0 && subscription && (
            <div className="card p-6">
              <SectionHeading>Change Plan</SectionHeading>
              <TierSelector
                currentTier={subscription.tier}
                tiers={tiers}
                onChangeTier={handleChangeTier}
                isChanging={isChangingTier}
              />
            </div>
          )}

          {/* ── Invoice History ── */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <SectionHeading>Invoice History</SectionHeading>
            </div>

            {!invoices || invoices.data.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-[var(--color-text-muted)]">
                No invoices found. Invoices will appear here once your first
                billing cycle completes.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-gray-50">
                      {[
                        'Invoice #',
                        'Period',
                        'Amount',
                        'Status',
                        'Actions',
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {invoices.data.map((inv) => (
                      <tr
                        key={inv.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">
                          {inv.number ?? inv.id.slice(0, 12)}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                          {fmtDate(inv.periodStart)} — {fmtDate(inv.periodEnd)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[var(--color-text)]">
                          {fmtCad(inv.amountDueCad)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${INVOICE_STATUS_COLORS[inv.status ?? ''] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {inv.status ?? 'unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {inv.hostedInvoiceUrl && (
                              <a
                                href={inv.hostedInvoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View
                              </a>
                            )}
                            {inv.periodStart && inv.periodEnd && (
                              <a
                                href={getInvoicePdfUrl(
                                  inv.id,
                                  inv.periodStart,
                                  inv.periodEnd,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Download PDF
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {invoices?.hasMore && (
              <div className="px-6 py-4 border-t border-[var(--color-border)]">
                <button
                  type="button"
                  onClick={() => {
                    const lastId =
                      invoices.data[invoices.data.length - 1]?.id;
                    if (lastId) {
                      getInvoiceHistory({ limit: 10, startingAfter: lastId })
                        .then((more) => {
                          setInvoices((prev) =>
                            prev
                              ? {
                                  data: [...prev.data, ...more.data],
                                  hasMore: more.hasMore,
                                }
                              : more,
                          );
                        })
                        .catch(() => {});
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Load more invoices
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
