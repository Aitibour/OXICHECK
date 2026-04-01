'use client';

import { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { manualCheckIn, updateReservation, type ReservationDetail as ReservationDetailType } from '@/lib/dashboard-api';
import clsx from 'clsx';

interface ReservationDetailProps {
  reservation: ReservationDetailType;
  onUpdated?: (updated: ReservationDetailType) => void;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency || 'CAD',
  }).format(cents / 100);
}

export function ReservationDetail({
  reservation,
  onUpdated,
}: ReservationDetailProps) {
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomNumber, setRoomNumber] = useState(reservation.roomNumber ?? '');
  const [isSavingRoom, setIsSavingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const guest = reservation.guest;

  const preCheckLink = `${
    typeof window !== 'undefined' ? window.location.origin : ''
  }/checkin/${reservation.id}`;

  async function handleCheckIn() {
    setIsCheckingIn(true);
    setError(null);
    try {
      const updated = await manualCheckIn(reservation.id);
      setSuccessMsg('Guest successfully checked in.');
      onUpdated?.(updated as ReservationDetailType);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Check-in failed. Please try again.');
    } finally {
      setIsCheckingIn(false);
    }
  }

  async function handleSaveRoom() {
    setIsSavingRoom(true);
    setError(null);
    try {
      const updated = await updateReservation(reservation.id, { roomNumber });
      setIsEditingRoom(false);
      setSuccessMsg('Room assignment saved.');
      onUpdated?.(updated as ReservationDetailType);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save room assignment.');
    } finally {
      setIsSavingRoom(false);
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(preCheckLink).then(() => {
      setSuccessMsg('Pre-check link copied to clipboard.');
      setTimeout(() => setSuccessMsg(null), 3000);
    });
  }

  const totalUpsells = reservation.upsellSelections
    ?.filter((s) => s.status !== 'CANCELLED')
    .reduce((sum, s) => sum + s.upsellOffer.priceInCents, 0) ?? 0;

  const canCheckIn =
    reservation.status !== 'CHECKED_IN' &&
    reservation.status !== 'CHECKED_OUT' &&
    reservation.status !== 'CANCELLED';

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">
            {guest.firstName} {guest.lastName}
          </h1>
          {reservation.confirmationNumber && (
            <p className="text-sm text-[var(--color-text-muted)]">
              Confirmation #{reservation.confirmationNumber}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge
            status={
              reservation.status === 'CHECKED_IN'
                ? 'CHECKED_IN'
                : reservation.preCheckStatus
            }
          />
          <StatusBadge status={reservation.status} />
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Guest + Stay */}
        <div className="lg:col-span-2 space-y-6">
          {/* Guest Profile */}
          <section className="card p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
              Guest Profile
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Full Name</dt>
                <dd className="text-sm font-medium">
                  {guest.firstName} {guest.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Email</dt>
                <dd className="text-sm">
                  <a
                    href={`mailto:${guest.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {guest.email}
                  </a>
                </dd>
              </div>
              {guest.phone && (
                <div>
                  <dt className="text-xs text-[var(--color-text-muted)]">Phone</dt>
                  <dd className="text-sm">{guest.phone}</dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Preferred Locale</dt>
                <dd className="text-sm uppercase">{guest.locale}</dd>
              </div>
            </dl>
          </section>

          {/* Stay Details */}
          <section className="card p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
              Stay Details
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Check-in</dt>
                <dd className="text-sm font-medium">
                  {formatDate(reservation.checkInDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Check-out</dt>
                <dd className="text-sm font-medium">
                  {formatDate(reservation.checkOutDate)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Nights</dt>
                <dd className="text-sm">{reservation.nightsCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Guests</dt>
                <dd className="text-sm">
                  {reservation.adultsCount} adult
                  {reservation.adultsCount !== 1 ? 's' : ''}
                  {reservation.childrenCount > 0 &&
                    `, ${reservation.childrenCount} child${reservation.childrenCount !== 1 ? 'ren' : ''}`}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Room Type</dt>
                <dd className="text-sm">{reservation.roomType ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--color-text-muted)]">Room Number</dt>
                <dd className="text-sm">
                  {isEditingRoom ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="form-input w-24 py-1 text-sm"
                        placeholder="e.g. 204"
                      />
                      <button
                        onClick={handleSaveRoom}
                        disabled={isSavingRoom}
                        className="text-xs px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSavingRoom ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingRoom(false);
                          setRoomNumber(reservation.roomNumber ?? '');
                        }}
                        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span>
                      {reservation.roomNumber ?? (
                        <span className="italic text-[var(--color-text-muted)]">
                          Unassigned
                        </span>
                      )}{' '}
                      <button
                        onClick={() => setIsEditingRoom(true)}
                        className="text-xs text-blue-600 hover:underline ml-1"
                      >
                        Edit
                      </button>
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {/* Pre-check Status */}
          <section className="card p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
              Pre-Check-In Status
            </h2>
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={reservation.preCheckStatus} />
              {reservation.preCheckCompletedAt && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  Completed{' '}
                  {new Date(reservation.preCheckCompletedAt).toLocaleString(
                    'en-CA',
                  )}
                </span>
              )}
            </div>

            {reservation.preCheckSubmission?.stepsCompleted &&
              reservation.preCheckSubmission.stepsCompleted.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-[var(--color-text-muted)] mb-2">
                    Completed steps:
                  </p>
                  <ul className="flex flex-wrap gap-2">
                    {reservation.preCheckSubmission.stepsCompleted.map((step) => (
                      <li
                        key={step}
                        className="text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full border border-green-200"
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {reservation.preCheckSubmission?.specialRequests && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs font-medium text-yellow-800 mb-1">
                  Special Requests
                </p>
                <p className="text-sm text-yellow-900">
                  {reservation.preCheckSubmission.specialRequests}
                </p>
              </div>
            )}
          </section>

          {/* Upsell Selections */}
          {reservation.upsellSelections && reservation.upsellSelections.length > 0 && (
            <section className="card p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
                Upsell Selections
              </h2>
              <ul className="space-y-2">
                {reservation.upsellSelections.map((sel) => (
                  <li
                    key={sel.id}
                    className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {sel.upsellOffer.title}
                      </p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {sel.upsellOffer.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          'text-xs px-2 py-0.5 rounded-full font-medium',
                          sel.status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : sel.status === 'CANCELLED'
                              ? 'bg-gray-100 text-gray-500 line-through'
                              : 'bg-yellow-100 text-yellow-700',
                        )}
                      >
                        {sel.status}
                      </span>
                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          sel.upsellOffer.priceInCents,
                          sel.upsellOffer.currency,
                        )}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {totalUpsells > 0 && (
                <div className="flex justify-between pt-3 mt-1 border-t border-[var(--color-border)]">
                  <span className="text-sm font-semibold">Total Upsells</span>
                  <span className="text-sm font-bold text-blue-700">
                    {formatCurrency(
                      totalUpsells,
                      reservation.upsellSelections[0]?.upsellOffer.currency ?? 'CAD',
                    )}
                  </span>
                </div>
              )}
            </section>
          )}

          {/* Payments */}
          {reservation.payments && reservation.payments.length > 0 && (
            <section className="card p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
                Payments
              </h2>
              <ul className="space-y-2">
                {reservation.payments.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{p.type}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        {new Date(p.createdAt).toLocaleDateString('en-CA')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={p.status} />
                      <span className="text-sm font-semibold">
                        {formatCurrency(p.amountInCents, p.currency)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <section className="card p-5">
            <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-4">
              Actions
            </h2>
            <div className="space-y-2">
              {canCheckIn && (
                <button
                  onClick={handleCheckIn}
                  disabled={isCheckingIn}
                  className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCheckingIn ? 'Checking In…' : 'Manual Check-In'}
                </button>
              )}

              {reservation.status === 'CHECKED_IN' && (
                <div className="py-2.5 rounded-lg bg-green-50 border border-green-200 text-center text-sm font-semibold text-green-700">
                  Guest is Checked In
                </div>
              )}

              <button
                onClick={copyLink}
                className="w-full py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors"
              >
                Copy Pre-Check Link
              </button>

              <button
                onClick={() =>
                  alert(
                    'Reminder functionality will be implemented in the communications module.',
                  )
                }
                className="w-full py-2 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text)] hover:bg-gray-50 transition-colors"
              >
                Send Reminder
              </button>
            </div>
          </section>

          {/* Property info */}
          {reservation.property && (
            <section className="card p-5">
              <h2 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
                Property
              </h2>
              <p className="text-sm font-medium">{reservation.property.name}</p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {reservation.property.city}, {reservation.property.province}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
