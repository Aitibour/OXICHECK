'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getOrganization, deactivateOrganization } from '@/lib/admin-api';

interface OrgDetail {
  id: string;
  name: string;
  slug: string;
  billingTier: string;
  isActive: boolean;
  createdAt: string;
  properties: Array<{ id: string; name: string; city: string; province: string; isActive: boolean }>;
  subscription?: { tier: string; status: string; currentPeriodEnd: string; annualCheckInAllowance: number };
}

export default function OrganizationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [org, setOrg] = useState<OrgDetail | null>(null);

  useEffect(() => {
    if (params.id) getOrganization(params.id as string).then(setOrg).catch(console.error);
  }, [params.id]);

  if (!org) return <div className="animate-pulse">Loading...</div>;

  async function handleDeactivate() {
    if (!confirm(`Are you sure you want to deactivate "${org!.name}"?`)) return;
    await deactivateOrganization(org!.id);
    router.push('/admin/organizations');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{org.name}</h1>
          <p className="text-sm text-gray-500">Slug: {org.slug} | Created: {new Date(org.createdAt).toLocaleDateString()}</p>
        </div>
        {org.isActive && (
          <button onClick={handleDeactivate} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
            Deactivate
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          {org.subscription ? (
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Tier:</span> {org.subscription.tier}</p>
              <p><span className="text-gray-500">Status:</span> {org.subscription.status}</p>
              <p><span className="text-gray-500">Period End:</span> {new Date(org.subscription.currentPeriodEnd).toLocaleDateString()}</p>
              <p><span className="text-gray-500">Annual Allowance:</span> {org.subscription.annualCheckInAllowance.toLocaleString()} check-ins</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No active subscription</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Properties ({org.properties.length})</h2>
          <div className="space-y-2">
            {org.properties.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm border-b pb-2">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-gray-500">{p.city}, {p.province}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
