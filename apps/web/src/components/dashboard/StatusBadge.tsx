'use client';

import clsx from 'clsx';

export type PreCheckStatusValue =
  | 'NOT_STARTED'
  | 'PARTIAL'
  | 'COMPLETED'
  | 'CHECKED_IN'
  | string;

const statusConfig: Record<
  string,
  { label: string; classes: string }
> = {
  NOT_STARTED: {
    label: 'Not Started',
    classes: 'bg-red-100 text-red-700 border-red-200',
  },
  PARTIAL: {
    label: 'Partial',
    classes: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  COMPLETED: {
    label: 'Completed',
    classes: 'bg-green-100 text-green-700 border-green-200',
  },
  CHECKED_IN: {
    label: 'Checked In',
    classes: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  CONFIRMED: {
    label: 'Confirmed',
    classes: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  CHECKED_OUT: {
    label: 'Checked Out',
    classes: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  CANCELLED: {
    label: 'Cancelled',
    classes: 'bg-red-50 text-red-500 border-red-100',
  },
  NO_SHOW: {
    label: 'No Show',
    classes: 'bg-orange-100 text-orange-700 border-orange-200',
  },
};

interface StatusBadgeProps {
  status: PreCheckStatusValue;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    classes: 'bg-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.classes,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
