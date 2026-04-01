'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getTemplate,
  updateTemplate,
  DashboardApiError,
  type CommunicationTemplate,
} from '@/lib/dashboard-api';
import { TemplateEditor, type TemplateData } from '@/components/dashboard/TemplateEditor';

const TYPE_LABELS: Record<string, string> = {
  PRE_CHECKIN_INVITE: 'Pre-Check Invite',
  REMINDER: 'Reminder',
  CONFIRMATION: 'Confirmation',
  WELCOME: 'Welcome',
  UPSELL_FOLLOWUP: 'Upsell Follow-up',
};

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [template, setTemplate] = useState<CommunicationTemplate | null>(null);
  const [templateData, setTemplateData] = useState<TemplateData>({
    bodyEn: '',
    bodyFr: '',
    channel: 'EMAIL',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getTemplate(id);
        setTemplate(data);
        setTemplateData({
          subjectEn: data.subjectEn ?? '',
          subjectFr: data.subjectFr ?? '',
          bodyEn: data.bodyEn ?? '',
          bodyFr: data.bodyFr ?? '',
          channel: data.channel as 'EMAIL' | 'SMS',
        });
      } catch (err) {
        setError(err instanceof DashboardApiError ? err.message : 'Could not load template.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await updateTemplate(id, {
        subjectEn: templateData.subjectEn,
        subjectFr: templateData.subjectFr,
        bodyEn: templateData.bodyEn,
        bodyFr: templateData.bodyFr,
      });
      setTemplate(updated);
      setSuccessMsg('Template saved successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof DashboardApiError ? err.message : 'Save failed.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <div>
        <Link
          href="/dashboard/templates"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          ← Back to Templates
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mt-2">
          {isLoading ? 'Loading…' : `Edit — ${TYPE_LABELS[template?.type ?? ''] ?? template?.type ?? ''}`}
        </h1>
        {template && (
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Channel: <strong>{template.channel}</strong>
            {' · '}
            Status:{' '}
            <span className={template.isActive ? 'text-green-600' : 'text-gray-500'}>
              {template.isActive ? 'Active' : 'Inactive'}
            </span>
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div role="status" className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          {successMsg}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <svg className="w-6 h-6 animate-spin text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : template ? (
        <div className="card p-6 space-y-6">
          <TemplateEditor data={templateData} onChange={setTemplateData} />

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => router.push('/dashboard/templates')}
              disabled={isSaving}
              className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {isSaving ? 'Saving…' : 'Save Template'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
