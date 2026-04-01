'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  getReservation,
  DashboardApiError,
  type ReservationDetail,
} from '@/lib/dashboard-api';
import { ReservationDetail as ReservationDetailComponent } from '@/components/dashboard/ReservationDetail';

interface Props {
  params: Promise<{ id: string }>;
}

export default function ReservationDetailPage({ params }: Props) {
  const { id } = use(params);
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getReservation(id);
        setReservation(data);
      } catch (err) {
        if (err instanceof DashboardApiError) {
          setError(
            err.status === 404
              ? 'Reservation not found.'
              : err.message,
          );
        } else {
          setError('Could not load reservation. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [id]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
        <Link
          href="/dashboard"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          Dashboard
        </Link>
        <span className="text-[var(--color-text-muted)]" aria-hidden="true">
          /
        </span>
        <Link
          href="/dashboard/arrivals"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          Arrivals
        </Link>
        <span className="text-[var(--color-text-muted)]" aria-hidden="true">
          /
        </span>
        <span className="text-[var(--color-text)] font-medium">
          {reservation
            ? `${reservation.guest.firstName} ${reservation.guest.lastName}`
            : 'Loading…'}
        </span>
      </nav>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="card p-5 h-40 bg-gray-100" />
              <div className="card p-5 h-52 bg-gray-100" />
            </div>
            <div className="card p-5 h-40 bg-gray-100" />
          </div>
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">⚠</p>
          <p className="text-lg font-semibold text-[var(--color-text)]">{error}</p>
          <Link
            href="/dashboard/arrivals"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Back to Arrivals
          </Link>
        </div>
      )}

      {/* Detail view */}
      {!isLoading && !error && reservation && (
        <ReservationDetailComponent
          reservation={reservation}
          onUpdated={(updated) => setReservation(updated)}
        />
      )}
    </div>
  );
}
