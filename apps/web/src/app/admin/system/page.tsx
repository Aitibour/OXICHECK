'use client';

import { useEffect, useState } from 'react';
import { getSystemHealth } from '@/lib/admin-api';

interface SystemHealth {
  pmsSyncHealth: { successRate: number; totalSyncs: number; recentErrors: Array<{ propertyId: string; errorMessage: string; syncedAt: string }> };
  emailDelivery: { deliveryRate: number; sent24h: number; failed24h: number };
}

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    getSystemHealth().then(setHealth).catch(console.error);
  }, []);

  if (!health) return <div className="animate-pulse">Loading system health...</div>;

  const healthCards = [
    {
      label: 'PMS Sync Health',
      value: `${health.pmsSyncHealth.successRate.toFixed(1)}%`,
      status: health.pmsSyncHealth.successRate > 99 ? 'green' : health.pmsSyncHealth.successRate > 95 ? 'yellow' : 'red',
      detail: `${health.pmsSyncHealth.totalSyncs} total syncs`,
    },
    {
      label: 'Email Delivery (24h)',
      value: `${health.emailDelivery.deliveryRate.toFixed(1)}%`,
      status: health.emailDelivery.deliveryRate > 95 ? 'green' : health.emailDelivery.deliveryRate > 90 ? 'yellow' : 'red',
      detail: `${health.emailDelivery.sent24h} sent, ${health.emailDelivery.failed24h} failed`,
    },
  ];

  const statusColors = { green: 'bg-green-100 text-green-700', yellow: 'bg-yellow-100 text-yellow-700', red: 'bg-red-100 text-red-700' };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">System Health</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {healthCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">{card.label}</p>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[card.status as keyof typeof statusColors]}`}>
                {card.status === 'green' ? 'Healthy' : card.status === 'yellow' ? 'Warning' : 'Critical'}
              </span>
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-xs text-gray-400 mt-1">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Recent PMS Sync Errors</h2>
        {health.pmsSyncHealth.recentErrors.length === 0 ? (
          <p className="text-sm text-gray-500">No recent errors</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-2">Time</th>
                <th className="text-left px-4 py-2">Property</th>
                <th className="text-left px-4 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {health.pmsSyncHealth.recentErrors.map((err, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2 text-gray-500">{new Date(err.syncedAt).toLocaleString()}</td>
                  <td className="px-4 py-2">{err.propertyId.slice(0, 8)}...</td>
                  <td className="px-4 py-2 text-red-600">{err.errorMessage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
