'use client';

interface BarDatum {
  label: string;
  value: number;
}

interface ReportChartProps {
  data: BarDatum[];
  title?: string;
  color?: string;
  valueFormatter?: (v: number) => string;
  height?: number;
}

export function ReportChart({
  data,
  title,
  color = '#2563eb',
  valueFormatter = (v) => String(v),
  height = 180,
}: ReportChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      {title && (
        <p className="text-sm font-medium text-[var(--color-text)]">{title}</p>
      )}
      {data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] italic">No data available.</p>
      ) : (
        <div
          className="flex items-end gap-1.5 w-full overflow-x-auto pb-1"
          style={{ height: `${height + 28}px` }}
          role="img"
          aria-label={title ?? 'Bar chart'}
        >
          {data.map((d, i) => {
            const pct = maxVal > 0 ? (d.value / maxVal) * 100 : 0;
            return (
              <div
                key={i}
                className="flex flex-col items-center gap-1 flex-1 min-w-6"
                title={`${d.label}: ${valueFormatter(d.value)}`}
              >
                {/* Value label on top */}
                <span
                  className="text-[10px] text-[var(--color-text-muted)] leading-none"
                  style={{ minHeight: 14 }}
                >
                  {d.value > 0 ? valueFormatter(d.value) : ''}
                </span>
                {/* Bar */}
                <div
                  className="w-full rounded-t transition-all"
                  style={{
                    height: `${(pct / 100) * height}px`,
                    backgroundColor: color,
                    minHeight: d.value > 0 ? 4 : 0,
                    opacity: 0.85,
                  }}
                />
                {/* X-axis label */}
                <span className="text-[9px] text-[var(--color-text-muted)] truncate w-full text-center leading-none">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
