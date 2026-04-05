"use client";

import { useState } from "react";
import { Settings, Hotel, Palette, Bell, Plug, Shield } from "lucide-react";

const tabs = [
  { id: "general", label: "General", icon: Hotel },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "pms", label: "PMS Integration", icon: Plug },
  { id: "compliance", label: "Compliance", icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-secondary">Settings</h1>
        <p className="text-sm text-muted">Manage your hotel configuration</p>
      </div>

      <div className="mt-6 flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted hover:bg-gray-50"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl border border-gray-200 bg-white p-6">
          {activeTab === "general" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-secondary">General Settings</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">Hotel Name</label>
                  <input type="text" defaultValue="Grand Hotel Barcelona" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">Email</label>
                  <input type="email" defaultValue="info@grandhotelbarcelona.com" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">Phone</label>
                  <input type="tel" defaultValue="+34 93 123 4567" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">City</label>
                    <input type="text" defaultValue="Barcelona" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">Country</label>
                    <input type="text" defaultValue="Spain" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">Timezone</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary outline-none">
                      <option>Europe/Madrid</option>
                      <option>Europe/London</option>
                      <option>America/New_York</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-1">Currency</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary outline-none">
                      <option>EUR</option>
                      <option>USD</option>
                      <option>GBP</option>
                    </select>
                  </div>
                </div>
                <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "pms" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-secondary">PMS Integration</h2>
              <p className="text-sm text-muted">Connect your property management system to sync reservations automatically.</p>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">PMS Provider</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary outline-none">
                    <option>Select PMS...</option>
                    <option>Oracle OPERA</option>
                    <option>Mews</option>
                    <option>Cloudbeds</option>
                    <option>Hotelogix</option>
                    <option>RMS Cloud</option>
                    <option>Generic Webhook</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">API Key / Access Token</label>
                  <input type="password" placeholder="Enter your PMS API key" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary mb-1">Property ID</label>
                  <input type="text" placeholder="Your property identifier" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div className="flex gap-3">
                  <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-dark transition-colors">
                    Test Connection
                  </button>
                  <button className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-muted hover:bg-gray-50 transition-colors">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab !== "general" && activeTab !== "pms" && (
            <div className="text-center py-12">
              <Settings size={32} className="mx-auto text-muted/40" />
              <p className="mt-2 text-sm text-muted">
                {tabs.find((t) => t.id === activeTab)?.label} settings coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
