'use client';

interface UsageBarProps {
  used: number;
  allowance: number;
  label?: string;
  showNumbers?: boolean;
}

function getColorClass(pct: number): {
  bar: string;
  text: string;
  bg: string;
  border: string;
} {
  if (pct >= 90) {
    return {
      bar: 'bg-red-500',
      text: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
    };
  }
  if (pct >= 75) {
    return {
      bar: 'bg-amber-400',
      text: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
    };
  }
  return {
    bar: 'bg-emerald-500',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
  };
}

function getStatusLabel(pct: number): string {
  if (pct >= 100) return 'Allowance exceeded';
  if (pct >= 90) return 'Critical — near limit';
  if (pct >= 75) return 'Warning — approaching limit';
  return 'On track';
}

export function UsageBar({
  used,
  allowance,
  label = 'Check-in allowance used',
  showNumbers = true,
}: UsageBarProps) {
  const pct = allowance > 0 ? Math.min(100, (used / allowance) * 100) : 0;
  const colors = getColorClass(pct);
  const isOverage = used > allowance;
  const overageCount = isOverage ? used - allowance : 0;

  return (
    <div className="space-y-2">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text)]">
          {label}
        </span>
        {showNumbers && (
          <span className={`text-sm font-semibold ${colors.text}`}>
            {used.toLocaleString()} / {allowance.toLocaleString()}
          </span>
        )}
      </div>

      {/* Track */}
      <div className="relative h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={used}
          aria-valuemin={0}
          aria-valuemax={allowance}
          aria-label={`${label}: ${used.toLocaleString()} of ${allowance.toLocaleString()} used`}
        />
      </div>

      {/* Status row */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-medium ${colors.text}`}>
          {getStatusLabel(pct)}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          {pct.toFixed(1)}% used
        </span>
      </div>

      {/* Overage warning */}
      {isOverage && (
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${colors.bg} ${colors.border}`}
        >
          <span className="text-base" aria-hidden="true">
            ⚠
          </span>
          <span className={colors.text}>
            <strong>{overageCount.toLocaleString()}</strong> check-ins over
            allowance — overage charges apply.
          </span>
        </div>
      )}
    </div>
  );
}
