'use client';

import { useState } from 'react';

export interface TemplateData {
  subjectEn?: string;
  subjectFr?: string;
  bodyEn: string;
  bodyFr: string;
  channel: 'EMAIL' | 'SMS';
}

const VARIABLES = [
  { token: '{{guestFirstName}}', label: 'Guest First Name' },
  { token: '{{hotelName}}', label: 'Hotel Name' },
  { token: '{{checkInDate}}', label: 'Check-in Date' },
  { token: '{{checkOutDate}}', label: 'Check-out Date' },
  { token: '{{preCheckUrl}}', label: 'Pre-Check URL' },
  { token: '{{confirmationNumber}}', label: 'Confirmation #' },
];

interface TemplateEditorProps {
  data: TemplateData;
  onChange: (data: TemplateData) => void;
}

function insertAt(text: string, pos: number, insert: string) {
  return text.slice(0, pos) + insert + text.slice(pos);
}

export function TemplateEditor({ data, onChange }: TemplateEditorProps) {
  const [activeLang, setActiveLang] = useState<'en' | 'fr'>('en');
  const [showPreview, setShowPreview] = useState(false);

  function insertVariable(token: string, field: 'bodyEn' | 'bodyFr' | 'subjectEn' | 'subjectFr') {
    const textareaId = `template-${field}`;
    const el = document.getElementById(textareaId) as HTMLTextAreaElement | HTMLInputElement | null;
    if (!el) {
      // fallback: append to end
      onChange({ ...data, [field]: (data[field as keyof TemplateData] ?? '') + token });
      return;
    }
    const start = el.selectionStart ?? (el as HTMLInputElement).value.length;
    const current = (data[field as keyof TemplateData] ?? '') as string;
    const updated = insertAt(current, start, token);
    onChange({ ...data, [field]: updated });
    // Restore focus and position after state update
    setTimeout(() => {
      el.focus();
      const newPos = start + token.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  }

  function renderPreview(body: string): string {
    return body
      .replace(/\{\{guestFirstName\}\}/g, 'Marie')
      .replace(/\{\{hotelName\}\}/g, 'Hôtel Boutique Montréal')
      .replace(/\{\{checkInDate\}\}/g, 'April 15, 2026')
      .replace(/\{\{checkOutDate\}\}/g, 'April 18, 2026')
      .replace(/\{\{preCheckUrl\}\}/g, 'https://checkin.example.com/abc123')
      .replace(/\{\{confirmationNumber\}\}/g, 'HTL-2026-0042');
  }

  const isEmail = data.channel === 'EMAIL';
  const bodyField = activeLang === 'en' ? 'bodyEn' : 'bodyFr';
  const subjectField = activeLang === 'en' ? 'subjectEn' : 'subjectFr';
  const currentBody = activeLang === 'en' ? data.bodyEn : data.bodyFr;
  const currentSubject = activeLang === 'en' ? (data.subjectEn ?? '') : (data.subjectFr ?? '');

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 border-b border-[var(--color-border)]">
          {(['en', 'fr'] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeLang === lang
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              {lang === 'en' ? 'English' : 'Français'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </button>
      </div>

      <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Editor pane */}
        <div className="space-y-3">
          {isEmail && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Subject ({activeLang === 'en' ? 'EN' : 'FR'})
              </label>
              <input
                id={`template-${subjectField}`}
                type="text"
                value={currentSubject}
                onChange={(e) => onChange({ ...data, [subjectField]: e.target.value })}
                placeholder={activeLang === 'en' ? 'Email subject line' : 'Objet du courriel'}
                className="form-input w-full"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Body ({activeLang === 'en' ? 'EN' : 'FR'})
            </label>
            <textarea
              id={`template-${bodyField}`}
              value={currentBody}
              onChange={(e) => onChange({ ...data, [bodyField]: e.target.value })}
              rows={10}
              placeholder={
                activeLang === 'en'
                  ? 'Write your message here…'
                  : 'Rédigez votre message ici…'
              }
              className="form-input w-full resize-y font-mono text-sm"
            />
          </div>

          {/* Variable toolbar */}
          <div>
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
              Insert variable
            </p>
            <div className="flex flex-wrap gap-1.5">
              {VARIABLES.map((v) => (
                <button
                  key={v.token}
                  type="button"
                  onClick={() => insertVariable(v.token, bodyField as 'bodyEn' | 'bodyFr')}
                  title={v.token}
                  className="text-xs px-2 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded border border-[var(--color-border)] transition-colors"
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview pane */}
        {showPreview && (
          <div className="border border-[var(--color-border)] rounded-lg p-4 bg-gray-50">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
              Preview ({activeLang === 'en' ? 'EN' : 'FR'})
            </p>
            {isEmail && currentSubject && (
              <div className="mb-3">
                <p className="text-xs font-medium text-[var(--color-text-muted)]">Subject</p>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {renderPreview(currentSubject)}
                </p>
              </div>
            )}
            <div className="border-t border-[var(--color-border)] pt-3">
              <p className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Body</p>
              <pre className="text-sm text-[var(--color-text)] whitespace-pre-wrap font-sans">
                {renderPreview(currentBody) || (
                  <span className="text-[var(--color-text-muted)] italic">No content yet</span>
                )}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
