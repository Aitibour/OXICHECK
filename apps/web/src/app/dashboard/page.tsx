'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getDashboardStats, getAuthToken, type DashboardStats } from '@/lib/dashboard-api';
import { StatsCard } from '@/components/dashboard/StatsCard';

function parsePropertyIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.propertyId ?? payload.defaultPropertyId ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_PROPERTY_ID = process.env.NEXT_PUBLIC_DEFAULT_PROPERTY_ID ?? '';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string>('');

  useEffect(() => {
    const token = getAuthToken();
    const pid = token ? parsePropertyIdFromToken(token) : null;
    setPropertyId(pid ?? FALLBACK_PROPERTY_ID);
  }, []);

  const loadStats = useCallback(async () => {
    if (!propertyId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats(propertyId);
      setStats(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load dashboard stats.');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const today = new Date().toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Dashboard
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{today}</p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2">
          <Link
            href="/dashboard/arrivals"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            View Today&apos;s Queue
          </Link>
          <button
            onClick={() =>
              alert(
                'Bulk reminder functionality will be added in the communications module.',
              )
            }
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Send Bulk Reminders
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}{' '}
          <button
            onClick={loadStats}
            className="underline font-medium hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="card p-5 h-28 animate-pulse bg-gray-100"
            />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatsCard
            title="Total Arrivals"
            value={stats.totalArrivals}
            icon="✈"
            colorClass="text-blue-600"
          />
          <StatsCard
            title="Pre-Check Complete"
            value={stats.preCheckCompleted}
            icon="✓"
            colorClass="text-green-600"
          />
          <StatsCard
            title="Partial"
            value={stats.preCheckPartial}
            icon="◑"
            colorClass="text-yellow-600"
          />
          <StatsCard
            title="Not Started"
            value={stats.preCheckNotStarted}
            icon="○"
            colorClass="text-red-600"
          />
          <StatsCard
            title="Checked In"
            value={stats.checkedIn}
            icon="⊙"
            colorClass="text-indigo-600"
          />
        </div>
      ) : null}

      {/* Weekly timeline */}
      {stats && stats.weeklyTimeline.length > 0 && (
        <section className="card p-6">
          <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-5">
            Arrivals — Next 7 Days
          </h2>

          <div className="flex items-end gap-3 h-36">
            {stats.weeklyTimeline.map((day, idx) => {
              const maxTotal = Math.max(
                ...stats.weeklyTimeline.map((d) => d.total),
                1,
              );
              const barHeight = Math.max(
                (day.total / maxTotal) * 100,
                day.total > 0 ? 8 : 0,
              );
              const completedHeight =
                day.total > 0
                  ? (day.completed / day.total) * barHeight
                  : 0;
              const isToday = idx === 0;

              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <span className="text-xs font-semibold text-[var(--color-text)]">
                    {day.total > 0 ? day.total : ''}
                  </span>

                  {/* Bar */}
                  <div
                    className="w-full rounded-t-sm relative overflow-hidden"
                    style={{ height: `${barHeight}%`, minHeight: day.total > 0 ? '8px' : '2px' }}
                    title={`${day.total} arrivals, ${day.completed} pre-checked`}
                  >
                    <div className="absolute inset-0 bg-blue-200 rounded-t-sm" />
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-blue-600 rounded-t-sm"
                      style={{ height: `${completedHeight}%` }}
                    />
                  </div>

                  <span
                    className={`text-xs ${
                      isToday
                        ? 'font-bold text-blue-600'
                        : 'text-[var(--color-text-muted)]'
                    }`}
                  >
                    {new Date(day.date + 'T12:00:00').toLocaleDateString(
                      'en-CA',
                      { weekday: 'short' },
                    )}
                  </span>
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {new Date(day.date + 'T12:00:00').toLocaleDateString(
                      'en-CA',
                      { month: 'short', day: 'numeric' },
                    )}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-600" />
              Pre-check complete
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-sm bg-blue-200" />
              Remaining
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
