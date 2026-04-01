'use client';

import { useState } from 'react';

export interface DateRange {
  from: string;
  to: string;
}

type Preset = 'today' | 'last7' | 'last30' | 'custom';

const PRESETS: Array<{ key: Preset; label: string }> = [
  { key: 'today', label: 'Today' },
  { key: 'last7', label: 'Last 7 days' },
  { key: 'last30', label: 'Last 30 days' },
  { key: 'custom', label: 'Custom' },
];

function toISO(date: Date) {
  return date.toISOString().split('T')[0];
}

function getPresetRange(preset: Preset): DateRange {
  const today = new Date();
  const to = toISO(today);
  if (preset === 'today') return { from: to, to };
  if (preset === 'last7') {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { from: toISO(from), to };
  }
  if (preset === 'last30') {
    const from = new Date(today);
    from.setDate(today.getDate() - 29);
    return { from: toISO(from), to };
  }
  return { from: to, to };
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<Preset>('last30');

  function selectPreset(preset: Preset) {
    setActivePreset(preset);
    if (preset !== 'custom') {
      onChange(getPresetRange(preset));
    }
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => selectPreset(p.key)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            activePreset === p.key
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-gray-50 hover:text-[var(--color-text)]'
          }`}
        >
          {p.label}
        </button>
      ))}

      {activePreset === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={value.from}
            max={value.to}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="form-input py-1.5 text-sm w-36"
            aria-label="From date"
          />
          <span className="text-sm text-[var(--color-text-muted)]">to</span>
          <input
            type="date"
            value={value.to}
            min={value.from}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="form-input py-1.5 text-sm w-36"
            aria-label="To date"
          />
        </div>
      )}

      {activePreset !== 'custom' && (
        <span className="text-xs text-[var(--color-text-muted)]">
          {value.from} — {value.to}
        </span>
      )}
    </div>
  );
}
