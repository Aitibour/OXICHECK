"use client";

import { BarChart3, TrendingUp, Clock, CheckCircle, Users, ArrowUp } from "lucide-react";

const weeklyData = [
  { day: "Mon", total: 12, completed: 10 },
  { day: "Tue", total: 8, completed: 7 },
  { day: "Wed", total: 15, completed: 13 },
  { day: "Thu", total: 10, completed: 9 },
  { day: "Fri", total: 18, completed: 16 },
  { day: "Sat", total: 22, completed: 20 },
  { day: "Sun", total: 14, completed: 12 },
];

export default function AnalyticsPage() {
  const maxTotal = Math.max(...weeklyData.map((d) => d.total));

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-secondary">Analytics</h1>
        <p className="text-sm text-muted">Check-in performance and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <KpiCard icon={CheckCircle} label="Completion Rate" value="91%" change="+3%" positive />
        <KpiCard icon={Clock} label="Avg. Completion Time" value="4m 12s" change="-18s" positive />
        <KpiCard icon={Users} label="Total Check-ins (Month)" value="487" change="+12%" positive />
        <KpiCard icon={TrendingUp} label="Drop-off Rate" value="9%" change="-2%" positive />
      </div>

      {/* Weekly Chart */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-secondary">Weekly Check-ins</h2>
            <p className="text-xs text-muted">Arrivals vs completed pre-check-ins</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-gray-200" />
              Total Arrivals
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-primary" />
              Completed
            </span>
          </div>
        </div>

        <div className="flex items-end gap-4 h-48">
          {weeklyData.map((d) => (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end gap-1" style={{ height: "180px" }}>
                <div
                  className="flex-1 rounded-t bg-gray-100"
                  style={{ height: `${(d.total / maxTotal) * 100}%` }}
                />
                <div
                  className="flex-1 rounded-t bg-primary"
                  style={{ height: `${(d.completed / maxTotal) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Drop-off Points */}
      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-secondary">Drop-off Points</h2>
        <p className="text-xs text-muted mb-4">Where guests abandon the check-in process</p>

        <div className="space-y-3">
          {[
            { step: "ID Upload", pct: 5.2 },
            { step: "Personal Details", pct: 2.1 },
            { step: "Signature", pct: 1.3 },
            { step: "Preferences", pct: 0.4 },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <span className="text-sm text-secondary w-32">{item.step}</span>
              <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-red-400"
                  style={{ width: `${item.pct * 10}%` }}
                />
              </div>
              <span className="text-sm font-medium text-secondary w-12 text-right">
                {item.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  change,
  positive,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted">{label}</span>
        <Icon size={14} className="text-muted" />
      </div>
      <p className="mt-2 text-2xl font-bold text-secondary">{value}</p>
      <div className={`mt-1 flex items-center gap-1 text-xs ${positive ? "text-green-600" : "text-red-600"}`}>
        <ArrowUp size={12} className={positive ? "" : "rotate-180"} />
        {change} vs last week
      </div>
    </div>
  );
}
