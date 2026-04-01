'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getTemplates,
  getAuthToken,
  DashboardApiError,
  type CommunicationTemplate,
} from '@/lib/dashboard-api';

const TYPE_LABELS: Record<string, string> = {
  PRE_CHECKIN_INVITE: 'Pre-Check Invite',
  REMINDER: 'Reminder',
  CONFIRMATION: 'Confirmation',
  WELCOME: 'Welcome',
  UPSELL_FOLLOWUP: 'Upsell Follow-up',
};

const CHANNEL_BADGES: Record<string, { label: string; classes: string }> = {
  EMAIL: { label: 'Email', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
  SMS: { label: 'SMS', classes: 'bg-green-50 text-green-700 border-green-200' },
};

function parsePropertyId(token: string): string | null {
  try {
    const p = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return p.propertyId ?? p.defaultPropertyId ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_PROPERTY_ID = process.env.NEXT_PUBLIC_DEFAULT_PROPERTY_ID ?? '';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const token = getAuthToken();
        const pid = (token ? parsePropertyId(token) : null) ?? FALLBACK_PROPERTY_ID;
        const data = await getTemplates(pid);
        setTemplates(data);
      } catch (err) {
        setError(err instanceof DashboardApiError ? err.message : 'Could not load templates.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const previewTemplate = templates.find((t) => t.id === previewId);

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Communication Templates</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Manage email and SMS templates sent to guests during the pre-check-in flow
        </p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-[var(--color-text-muted)]">
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm">Loading templates…</span>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="py-16 text-center text-[var(--color-text-muted)]">
            <p className="text-4xl mb-3">✉</p>
            <p className="text-sm font-medium">No templates found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-gray-50">
                  {['Type', 'Channel', 'Subject (EN)', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {templates.map((tmpl) => {
                  const channelBadge = CHANNEL_BADGES[tmpl.channel] ?? { label: tmpl.channel, classes: 'bg-gray-50 text-gray-600 border-gray-200' };
                  return (
                    <tr key={tmpl.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-[var(--color-text)]">
                        {TYPE_LABELS[tmpl.type] ?? tmpl.type}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border ${channelBadge.classes}`}>
                          {channelBadge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-text-muted)] max-w-xs truncate">
                        {tmpl.subjectEn ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border ${
                          tmpl.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-500 border-gray-200'
                        }`}>
                          {tmpl.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/dashboard/templates/${tmpl.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPreviewId(previewId === tmpl.id ? null : tmpl.id)}
                            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                          >
                            {previewId === tmpl.id ? 'Hide Preview' : 'Preview'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inline preview */}
      {previewTemplate && (
        <div className="card p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              Preview — {TYPE_LABELS[previewTemplate.type] ?? previewTemplate.type}
            </h2>
            <button
              type="button"
              onClick={() => setPreviewId(null)}
              className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['en', 'fr'] as const).map((lang) => (
              <div key={lang}>
                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                  {lang === 'en' ? 'English' : 'Français'}
                </p>
                {previewTemplate.channel === 'EMAIL' && (
                  <p className="text-sm font-medium text-[var(--color-text)] mb-2">
                    {lang === 'en' ? previewTemplate.subjectEn : previewTemplate.subjectFr}
                  </p>
                )}
                <pre className="text-sm text-[var(--color-text-muted)] whitespace-pre-wrap font-sans bg-gray-50 rounded-lg p-3 border border-[var(--color-border)]">
                  {lang === 'en' ? previewTemplate.bodyEn : previewTemplate.bodyFr}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
