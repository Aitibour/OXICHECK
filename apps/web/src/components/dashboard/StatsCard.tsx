'use client';

import clsx from 'clsx';
import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  colorClass?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  colorClass = 'text-blue-600',
  className,
}: StatsCardProps) {
  return (
    <div
      className={clsx(
        'card p-5 flex flex-col gap-3',
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-[var(--color-text-muted)] leading-tight">
          {title}
        </p>
        {icon && (
          <span className={clsx('text-2xl', colorClass)} aria-hidden="true">
            {icon}
          </span>
        )}
      </div>

      <p className={clsx('text-3xl font-bold', colorClass)}>
        {value}
      </p>

      {trend && (
        <p
          className={clsx(
            'text-xs font-medium',
            trend.positive === false
              ? 'text-red-600'
              : 'text-green-600',
          )}
        >
          {trend.positive !== false ? '+' : ''}
          {trend.value} {trend.label}
        </p>
      )}
    </div>
  );
}
