'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getArrivals,
  manualCheckIn,
  getAuthToken,
  DashboardApiError,
  type ReservationSummary,
  type PaginatedArrivals,
} from '@/lib/dashboard-api';
import { ArrivalRow } from '@/components/dashboard/ArrivalRow';
import { StatusBadge } from '@/components/dashboard/StatusBadge';

type FilterTab = 'ALL' | 'COMPLETED' | 'PARTIAL' | 'NOT_STARTED' | 'CHECKED_IN';

const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'PARTIAL', label: 'Partial' },
  { key: 'NOT_STARTED', label: 'Not Started' },
  { key: 'CHECKED_IN', label: 'Checked In' },
];

function getTodayISO() {
  return new Date().toISOString().split('T')[0];
}

function parsePropertyId(token: string): string | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return p.propertyId ?? p.defaultPropertyId ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_PROPERTY_ID = process.env.NEXT_PUBLIC_DEFAULT_PROPERTY_ID ?? '';

export default function ArrivalsPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [arrivals, setArrivals] = useState<PaginatedArrivals | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [propertyId, setPropertyId] = useState('');

  // Init property ID
  useEffect(() => {
    const token = getAuthToken();
    const pid = token ? parsePropertyId(token) : null;
    setPropertyId(pid ?? FALLBACK_PROPERTY_ID);
  }, []);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadArrivals = useCallback(async () => {
    if (!propertyId) return;
    setIsLoading(true);
    setError(null);

    try {
      const params: Record<string, unknown> = {
        dateFrom: selectedDate,
        dateTo: selectedDate,
        page,
        limit: 25,
      };

      // For CHECKED_IN tab we rely on status filtering; others map to preCheckStatus
      if (activeTab === 'CHECKED_IN') {
        // no preCheckStatus filter — show all for that day and filter client-side
        // (API doesn't expose reservationStatus filter yet)
      } else if (activeTab !== 'ALL') {
        params.preCheckStatus = activeTab;
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const data = await getArrivals(propertyId, params as Parameters<typeof getArrivals>[1]);
      setArrivals(data);
    } catch (err) {
      if (err instanceof DashboardApiError) {
        setError(err.message);
      } else {
        setError('Could not load arrivals. Please refresh.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, selectedDate, activeTab, debouncedSearch, page]);

  useEffect(() => {
    loadArrivals();
  }, [loadArrivals]);

  async function handleCheckIn(id: string) {
    setCheckingInId(id);
    setError(null);
    try {
      await manualCheckIn(id);
      setSuccessMsg('Guest checked in successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
      loadArrivals();
    } catch (err) {
      if (err instanceof DashboardApiError) {
        setError(err.message);
      } else {
        setError('Check-in failed. Please try again.');
      }
    } finally {
      setCheckingInId(null);
    }
  }

  // Client-side filter for CHECKED_IN tab
  const displayedRows: ReservationSummary[] =
    arrivals?.data.filter((r) =>
      activeTab === 'CHECKED_IN' ? r.status === 'CHECKED_IN' : true,
    ) ?? [];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Arrivals Queue
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Manage today&apos;s and upcoming guest check-ins
        </p>
      </div>

      {/* Alerts */}
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}
      {successMsg && (
        <div
          role="status"
          className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700"
        >
          {successMsg}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Date picker */}
        <div>
          <label htmlFor="arrival-date" className="sr-only">
            Arrival date
          </label>
          <input
            id="arrival-date"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setPage(1);
            }}
            className="form-input py-1.5 text-sm w-40"
          />
        </div>

        {/* Search */}
        <div className="flex-1 min-w-48 max-w-sm">
          <label htmlFor="arrival-search" className="sr-only">
            Search guests
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-[var(--color-text-muted)] pointer-events-none">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
              </svg>
            </span>
            <input
              id="arrival-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest name or email…"
              className="form-input py-1.5 pl-9 text-sm w-full"
            />
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]" role="tablist">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab.label}
            {tab.key !== 'ALL' && activeTab !== tab.key && arrivals && (
              <span className="ml-1.5 text-xs bg-gray-100 px-1.5 py-0.5 rounded-full">
                {tab.key === 'CHECKED_IN'
                  ? arrivals.data.filter((r) => r.status === 'CHECKED_IN').length
                  : arrivals.data.filter((r) => r.preCheckStatus === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading arrivals…</span>
            </div>
          </div>
        ) : displayedRows.length === 0 ? (
          <div className="py-16 text-center text-[var(--color-text-muted)]">
            <p className="text-4xl mb-3">🛎</p>
            <p className="text-sm font-medium">No arrivals found</p>
            <p className="text-xs mt-1">
              {search
                ? 'Try a different search term'
                : 'No guests arriving on this date with the selected filter'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-gray-50">
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Room
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Check-in
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Confirmation
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {displayedRows.map((r) => (
                  <ArrivalRow
                    key={r.id}
                    reservation={r}
                    onCheckIn={handleCheckIn}
                    isCheckingIn={checkingInId === r.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {arrivals && arrivals.meta.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-text-muted)]">
              Showing {(page - 1) * arrivals.meta.limit + 1}–
              {Math.min(page * arrivals.meta.limit, arrivals.meta.total)} of{' '}
              {arrivals.meta.total} arrivals
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs rounded-lg border border-[var(--color-border)] disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(arrivals.meta.totalPages, p + 1))}
                disabled={page === arrivals.meta.totalPages}
                className="px-3 py-1 text-xs rounded-lg border border-[var(--color-border)] disabled:opacity-40 hover:bg-gray-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)]">
        {(['COMPLETED', 'PARTIAL', 'NOT_STARTED', 'CHECKED_IN'] as const).map((s) => (
          <span key={s} className="flex items-center gap-1">
            <StatusBadge status={s} />
          </span>
        ))}
      </div>
    </div>
  );
}
