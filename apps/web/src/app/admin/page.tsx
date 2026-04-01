'use client';

import { useEffect, useState } from 'react';
import { getSystemStats } from '@/lib/admin-api';

interface SystemStats {
  totalOrgs: number;
  totalProperties: number;
  totalReservations: number;
  totalPreChecks: number;
  activeSubscriptions: number;
  subscriptionsByTier: Array<{ tier: string; count: number }>;
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    getSystemStats().then(setStats).catch(console.error);
  }, []);

  if (!stats) return <div className="animate-pulse">Loading system stats...</div>;

  const cards = [
    { label: 'Total Organizations', value: stats.totalOrgs },
    { label: 'Total Properties', value: stats.totalProperties },
    { label: 'Active Subscriptions', value: stats.activeSubscriptions },
    { label: 'Total Reservations', value: stats.totalReservations.toLocaleString() },
    { label: 'Pre-Checks Completed', value: stats.totalPreChecks.toLocaleString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Subscriptions by Tier</h2>
        <div className="space-y-3">
          {stats.subscriptionsByTier.map((t) => (
            <div key={t.tier} className="flex items-center gap-4">
              <span className="w-24 text-sm font-medium">{t.tier}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-6">
                <div
                  className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2"
                  style={{ width: `${Math.max((t.count / Math.max(stats.activeSubscriptions, 1)) * 100, 10)}%` }}
                >
                  <span className="text-xs text-white font-medium">{t.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
