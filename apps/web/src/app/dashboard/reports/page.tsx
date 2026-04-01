'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getUpsellAnalytics,
  getDeliveryStats,
  getPaymentSummary,
  getDashboardStats,
  getAuthToken,
  DashboardApiError,
  type UpsellAnalytics,
  type DeliveryStats,
  type PaymentSummary,
  type DashboardStats,
} from '@/lib/dashboard-api';
import { DateRangePicker, type DateRange } from '@/components/dashboard/DateRangePicker';
import { ReportChart } from '@/components/dashboard/ReportChart';

function parsePropertyId(token: string): string | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return p.propertyId ?? p.defaultPropertyId ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_PROPERTY_ID = process.env.NEXT_PUBLIC_DEFAULT_PROPERTY_ID ?? '';

function getDefaultRange(): DateRange {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return { from: from.toISOString().split('T')[0], to };
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(cents / 100);
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}
function KpiCard({ label, value, sub, color = 'text-[var(--color-text)]' }: KpiCardProps) {
  return (
    <div className="card p-5">
      <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultRange);
  const [propertyId, setPropertyId] = useState('');

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [upsellAnalytics, setUpsellAnalytics] = useState<UpsellAnalytics | null>(null);
  const [deliveryStats, setDeliveryStats] = useState<DeliveryStats | null>(null);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    const pid = (token ? parsePropertyId(token) : null) ?? FALLBACK_PROPERTY_ID;
    setPropertyId(pid);
  }, []);

  const loadReports = useCallback(async () => {
    if (!propertyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [statsData, upsellData, deliveryData, paymentData] = await Promise.allSettled([
        getDashboardStats(propertyId, dateRange.to),
        getUpsellAnalytics(propertyId, dateRange),
        getDeliveryStats(propertyId, dateRange),
        getPaymentSummary(propertyId, dateRange),
      ]);

      if (statsData.status === 'fulfilled') setStats(statsData.value);
      if (upsellData.status === 'fulfilled') setUpsellAnalytics(upsellData.value);
      if (deliveryData.status === 'fulfilled') setDeliveryStats(deliveryData.value);
      if (paymentData.status === 'fulfilled') setPaymentSummary(paymentData.value);
    } catch (err) {
      setError(err instanceof DashboardApiError ? err.message : 'Could not load report data.');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, dateRange]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  function handleExport() {
    console.log('export requested', { propertyId, dateRange });
    alert('Export requested — check the console. (CSV export coming soon)');
  }

  // Build bar chart data from weekly timeline
  const chartData =
    stats?.weeklyTimeline?.map((d) => ({
      label: d.date.slice(5), // MM-DD
      value: d.completed,
    })) ?? [];

  const completionRate =
    stats && stats.totalArrivals > 0
      ? ((stats.preCheckCompleted / stats.totalArrivals) * 100).toFixed(1)
      : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Reports</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Overview of pre-check-in performance, upsells, communications, and payments
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors"
        >
          Export
        </button>
      </div>

      {/* Date range */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading report data…</span>
          </div>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Pre-check Completion"
              value={completionRate != null ? `${completionRate}%` : '—'}
              sub={`${stats?.preCheckCompleted ?? 0} of ${stats?.totalArrivals ?? 0} arrivals`}
              color="text-blue-700"
            />
            <KpiCard
              label="Upsell Revenue"
              value={upsellAnalytics?.totalRevenueCents != null
                ? formatCurrency(upsellAnalytics.totalRevenueCents)
                : '—'}
              sub={`${upsellAnalytics?.selections ?? 0} selections`}
              color="text-green-700"
            />
            <KpiCard
              label="Email Open Rate"
              value={deliveryStats?.openRate != null
                ? `${(deliveryStats.openRate * 100).toFixed(1)}%`
                : '—'}
              sub={`${deliveryStats?.sent ?? 0} emails sent`}
              color="text-purple-700"
            />
            <KpiCard
              label="Payments Collected"
              value={paymentSummary?.totalCollectedCents != null
                ? formatCurrency(paymentSummary.totalCollectedCents)
                : '—'}
              sub={`${paymentSummary?.failed ?? 0} failed`}
              color="text-[var(--color-text)]"
            />
          </div>

          {/* Pre-check completion chart */}
          {chartData.length > 0 && (
            <div className="card p-6">
              <ReportChart
                data={chartData}
                title="Pre-check Completions (by date)"
                color="#2563eb"
              />
            </div>
          )}

          {/* Upsell performance table */}
          {upsellAnalytics?.offerBreakdown && upsellAnalytics.offerBreakdown.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-base font-semibold text-[var(--color-text)]">Upsell Performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-gray-50">
                      {['Offer', 'Impressions', 'Selections', 'Conversion', 'Revenue'].map((h) => (
                        <th key={h} className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {upsellAnalytics.offerBreakdown.map((row) => (
                      <tr key={row.offerId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">{row.offerTitle}</td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">{row.impressions}</td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">{row.selections}</td>
                        <td className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
                          {row.impressions > 0
                            ? `${((row.selections / row.impressions) * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-700 font-medium">
                          {formatCurrency(row.revenueCents ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Communication stats */}
          {deliveryStats && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-base font-semibold text-[var(--color-text)]">Communication Stats</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
                {[
                  { label: 'Sent', value: deliveryStats.sent ?? 0 },
                  { label: 'Delivered', value: deliveryStats.delivered ?? 0 },
                  { label: 'Opened', value: deliveryStats.opened ?? 0 },
                  { label: 'Clicked', value: deliveryStats.clicked ?? 0 },
                  { label: 'Bounced', value: deliveryStats.bounced ?? 0 },
                ].map((stat) => (
                  <div key={stat.label} className="px-6 py-5 text-center">
                    <p className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment summary */}
          {paymentSummary && (
            <div className="card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--color-border)]">
                <h2 className="text-base font-semibold text-[var(--color-text)]">Payment Summary</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
                {[
                  { label: 'Collected', value: formatCurrency(paymentSummary.totalCollectedCents ?? 0), color: 'text-green-700' },
                  { label: 'Pending', value: formatCurrency(paymentSummary.totalPendingCents ?? 0), color: 'text-yellow-700' },
                  { label: 'Failed', value: String(paymentSummary.failed ?? 0), color: 'text-red-600' },
                  { label: 'Refunded', value: formatCurrency(paymentSummary.totalRefundedCents ?? 0), color: 'text-[var(--color-text-muted)]' },
                ].map((stat) => (
                  <div key={stat.label} className="px-6 py-5 text-center">
                    <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
