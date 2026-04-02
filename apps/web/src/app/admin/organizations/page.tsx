'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrganizations, createOrganization } from '@/lib/admin-api';

interface Organization {
  id: string;
  name: string;
  slug: string;
  billingTier: string;
  isActive: boolean;
  _count: { properties: number };
  subscription?: { status: string };
}

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    loadOrgs();
  }, [search]);

  async function loadOrgs() {
    const result = await getOrganizations({ search, page: 1, limit: 50 });
    setOrgs(result.data as Organization[]);
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    await createOrganization({ name: newName });
    setNewName('');
    setShowCreate(false);
    loadOrgs();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
          New Organization
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-lg shadow p-4 mb-4 flex gap-3">
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Organization name" className="flex-1 border rounded px-3 py-2 text-sm" />
          <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Create</button>
          <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 text-sm">Cancel</button>
        </div>
      )}

      <div className="mb-4">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search organizations..." className="w-full border rounded-lg px-4 py-2 text-sm" />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Tier</th>
              <th className="text-left px-4 py-3">Properties</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orgs.map((org) => (
              <tr key={org.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{org.name}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{org.billingTier}</span>
                </td>
                <td className="px-4 py-3">{org._count.properties}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {org.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/organizations/${org.id}`} className="text-blue-600 hover:underline text-sm">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
