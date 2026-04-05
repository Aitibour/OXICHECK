"use client";

import { Search, Filter, Download } from "lucide-react";

const mockGuests = [
  { id: "1", name: "Maria Santos", email: "maria@example.com", nationality: "Portugal", visits: 3, lastVisit: "2026-04-05", idVerified: true },
  { id: "2", name: "James Mitchell", email: "james.m@example.com", nationality: "United Kingdom", visits: 1, lastVisit: "2026-04-05", idVerified: true },
  { id: "3", name: "Laura Rossi", email: "laura.r@example.com", nationality: "Italy", visits: 2, lastVisit: "2026-04-05", idVerified: false },
  { id: "4", name: "Ahmed Hassan", email: "ahmed@example.com", nationality: "UAE", visits: 5, lastVisit: "2026-04-05", idVerified: true },
  { id: "5", name: "Sophie Chen", email: "sophie.c@example.com", nationality: "China", visits: 1, lastVisit: "2026-04-05", idVerified: true },
];

export default function GuestsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Guests</h1>
          <p className="text-sm text-muted">Manage guest profiles and records</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-muted hover:bg-gray-50">
          <Download size={14} />
          Export
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search guests by name or email..."
            className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-muted hover:bg-gray-50">
          <Filter size={14} />
          Filter
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left font-medium text-muted px-4 py-3">Guest</th>
              <th className="text-left font-medium text-muted px-4 py-3">Nationality</th>
              <th className="text-left font-medium text-muted px-4 py-3">Visits</th>
              <th className="text-left font-medium text-muted px-4 py-3">Last Visit</th>
              <th className="text-left font-medium text-muted px-4 py-3">ID Status</th>
            </tr>
          </thead>
          <tbody>
            {mockGuests.map((guest) => (
              <tr key={guest.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-3">
                  <p className="font-medium text-secondary">{guest.name}</p>
                  <p className="text-xs text-muted">{guest.email}</p>
                </td>
                <td className="px-4 py-3 text-muted">{guest.nationality}</td>
                <td className="px-4 py-3 text-muted">{guest.visits}</td>
                <td className="px-4 py-3 text-muted">
                  {new Date(guest.lastVisit).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${guest.idVerified ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {guest.idVerified ? "Verified" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
