'use client';

import { useState } from 'react';

export type RuleAttribute =
  | 'dayOfWeek'
  | 'nightsCount'
  | 'roomType'
  | 'bookingSource'
  | 'rateCode'
  | 'leadTimeDays';

export type RuleOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'GREATER_THAN'
  | 'LESS_THAN'
  | 'IN'
  | 'NOT_IN';

export interface RuleCondition {
  id: string;
  attribute: RuleAttribute;
  operator: RuleOperator;
  value: string;
}

export interface RuleGroup {
  id: string;
  conditions: RuleCondition[];
}

const ATTRIBUTE_OPTIONS: Array<{ value: RuleAttribute; label: string }> = [
  { value: 'dayOfWeek', label: 'Day of Week' },
  { value: 'nightsCount', label: 'Nights Count' },
  { value: 'roomType', label: 'Room Type' },
  { value: 'bookingSource', label: 'Booking Source' },
  { value: 'rateCode', label: 'Rate Code' },
  { value: 'leadTimeDays', label: 'Lead Time (days)' },
];

const OPERATOR_OPTIONS: Array<{ value: RuleOperator; label: string }> = [
  { value: 'EQUALS', label: '=' },
  { value: 'NOT_EQUALS', label: '≠' },
  { value: 'GREATER_THAN', label: '>' },
  { value: 'LESS_THAN', label: '<' },
  { value: 'IN', label: 'in list' },
  { value: 'NOT_IN', label: 'not in list' },
];

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

function newCondition(): RuleCondition {
  return { id: generateId(), attribute: 'dayOfWeek', operator: 'EQUALS', value: '' };
}

interface RuleBuilderProps {
  groups: RuleGroup[];
  onChange: (groups: RuleGroup[]) => void;
}

export function RuleBuilder({ groups, onChange }: RuleBuilderProps) {
  function addGroup() {
    onChange([...groups, { id: generateId(), conditions: [newCondition()] }]);
  }

  function removeGroup(groupId: string) {
    onChange(groups.filter((g) => g.id !== groupId));
  }

  function addCondition(groupId: string) {
    onChange(
      groups.map((g) =>
        g.id === groupId ? { ...g, conditions: [...g.conditions, newCondition()] } : g,
      ),
    );
  }

  function removeCondition(groupId: string, condId: string) {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? { ...g, conditions: g.conditions.filter((c) => c.id !== condId) }
          : g,
      ),
    );
  }

  function updateCondition(
    groupId: string,
    condId: string,
    patch: Partial<RuleCondition>,
  ) {
    onChange(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map((c) =>
                c.id === condId ? { ...c, ...patch } : c,
              ),
            }
          : g,
      ),
    );
  }

  return (
    <div className="space-y-3">
      {groups.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)] italic">
          No rules — offer shows to all guests.
        </p>
      )}

      {groups.map((group, gi) => (
        <div key={group.id}>
          {gi > 0 && (
            <div className="flex items-center gap-2 my-2">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                OR
              </span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>
          )}

          <div className="border border-[var(--color-border)] rounded-lg p-4 bg-gray-50 space-y-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                Group {gi + 1}
              </span>
              <button
                type="button"
                onClick={() => removeGroup(group.id)}
                className="text-xs text-red-500 hover:text-red-700 transition-colors"
                aria-label="Remove group"
              >
                Remove group
              </button>
            </div>

            {group.conditions.map((cond, ci) => (
              <div key={cond.id}>
                {ci > 0 && (
                  <div className="flex items-center gap-2 my-1.5">
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      AND
                    </span>
                    <div className="flex-1 h-px bg-[var(--color-border)]" />
                  </div>
                )}
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={cond.attribute}
                    onChange={(e) =>
                      updateCondition(group.id, cond.id, {
                        attribute: e.target.value as RuleAttribute,
                      })
                    }
                    className="form-input py-1.5 text-sm flex-1 min-w-36"
                  >
                    {ATTRIBUTE_OPTIONS.map((a) => (
                      <option key={a.value} value={a.value}>
                        {a.label}
                      </option>
                    ))}
                  </select>

                  <select
                    value={cond.operator}
                    onChange={(e) =>
                      updateCondition(group.id, cond.id, {
                        operator: e.target.value as RuleOperator,
                      })
                    }
                    className="form-input py-1.5 text-sm w-28"
                  >
                    {OPERATOR_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={cond.value}
                    onChange={(e) =>
                      updateCondition(group.id, cond.id, { value: e.target.value })
                    }
                    placeholder={
                      cond.operator === 'IN' || cond.operator === 'NOT_IN'
                        ? 'val1, val2, …'
                        : 'value'
                    }
                    className="form-input py-1.5 text-sm flex-1 min-w-28"
                  />

                  <button
                    type="button"
                    onClick={() => removeCondition(group.id, cond.id)}
                    disabled={group.conditions.length === 1}
                    className="p-1.5 text-[var(--color-text-muted)] hover:text-red-500 transition-colors disabled:opacity-30"
                    aria-label="Remove condition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addCondition(group.id)}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors mt-1"
            >
              + Add condition (AND)
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addGroup}
        className="text-sm text-amber-700 border border-amber-300 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        + Add group (OR)
      </button>
    </div>
  );
}
