'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { StatusBadge } from './StatusBadge';
import type { ReservationSummary } from '@/lib/dashboard-api';

interface ArrivalRowProps {
  reservation: ReservationSummary;
  onCheckIn?: (id: string) => void;
  isCheckingIn?: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function ArrivalRow({
  reservation,
  onCheckIn,
  isCheckingIn,
}: ArrivalRowProps) {
  const guest = reservation.guest;
  const fullName = `${guest.firstName} ${guest.lastName}`;

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Guest */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[var(--color-text)]">
            {fullName}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {guest.email}
          </span>
        </div>
      </td>

      {/* Room */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--color-text)]">
        {reservation.roomNumber ? (
          <span className="font-medium">{reservation.roomNumber}</span>
        ) : (
          <span className="text-[var(--color-text-muted)] italic">Unassigned</span>
        )}
        {reservation.roomType && (
          <div className="text-xs text-[var(--color-text-muted)]">
            {reservation.roomType}
          </div>
        )}
      </td>

      {/* Check-in Date */}
      <td className="px-4 py-3 whitespace-nowrap text-sm text-[var(--color-text)]">
        {formatDate(reservation.checkInDate)}
        <div className="text-xs text-[var(--color-text-muted)]">
          {reservation.nightsCount} night{reservation.nightsCount !== 1 ? 's' : ''}
        </div>
      </td>

      {/* Pre-check Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        {reservation.status === 'CHECKED_IN' ? (
          <StatusBadge status="CHECKED_IN" />
        ) : (
          <StatusBadge status={reservation.preCheckStatus} />
        )}
      </td>

      {/* Confirmation # */}
      <td className="px-4 py-3 whitespace-nowrap text-xs text-[var(--color-text-muted)]">
        {reservation.confirmationNumber ?? '—'}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/arrivals/${reservation.id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 underline-offset-2 hover:underline"
          >
            View
          </Link>

          {reservation.status !== 'CHECKED_IN' &&
            reservation.status !== 'CHECKED_OUT' &&
            reservation.status !== 'CANCELLED' && (
              <button
                onClick={() => onCheckIn?.(reservation.id)}
                disabled={isCheckingIn}
                className={clsx(
                  'text-xs font-medium px-2.5 py-1 rounded-full transition-colors',
                  'bg-blue-600 text-white hover:bg-blue-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                )}
              >
                {isCheckingIn ? 'Checking in…' : 'Check In'}
              </button>
            )}
        </div>
      </td>
    </tr>
  );
}
