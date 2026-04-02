'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getUpsellOffer,
  updateUpsellOffer,
  getUpsellRules,
  createUpsellRule,
  deleteUpsellRule,
  getUpsellAnalytics,
  getAuthToken,
  DashboardApiError,
  type UpsellOffer,
  type UpsellRule,
  type UpsellAnalytics,
} from '@/lib/dashboard-api';
import { UpsellOfferForm, type UpsellOfferFormData } from '@/components/dashboard/UpsellOfferForm';
import { RuleBuilder, type RuleGroup } from '@/components/dashboard/RuleBuilder';

function parsePropertyId(token: string): string | null {
  try {
    const p = JSON.parse(atob((token.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/')));
    return p.propertyId ?? p.defaultPropertyId ?? null;
  } catch {
    return null;
  }
}

const FALLBACK_PROPERTY_ID = process.env.NEXT_PUBLIC_DEFAULT_PROPERTY_ID ?? '';

function rulesToGroups(rules: UpsellRule[]): RuleGroup[] {
  const byGroup: Record<number, UpsellRule[]> = {};
  for (const r of rules) {
    const g = r.logicGroup ?? 0;
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(r);
  }
  return Object.entries(byGroup).map(([, groupRules]) => ({
    id: String(groupRules[0]?.logicGroup ?? 0),
    conditions: groupRules.map((r) => ({
      id: r.id,
      attribute: r.attribute as RuleGroup['conditions'][number]['attribute'],
      operator: r.operator as RuleGroup['conditions'][number]['operator'],
      value: Array.isArray(r.value) ? r.value.join(', ') : String(r.value ?? ''),
    })),
  }));
}

type ActiveTab = 'details' | 'rules' | 'analytics';

export default function EditUpsellOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [offer, setOffer] = useState<UpsellOffer | null>(null);
  const [rules, setRules] = useState<UpsellRule[]>([]);
  const [analytics, setAnalytics] = useState<UpsellAnalytics | null>(null);
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingRules, setIsSavingRules] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('details');
  const [propertyId, setPropertyId] = useState('');

  useEffect(() => {
    const token = getAuthToken();
    const pid = (token ? parsePropertyId(token) : null) ?? FALLBACK_PROPERTY_ID;
    setPropertyId(pid);
  }, []);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [offerData, rulesData] = await Promise.all([
          getUpsellOffer(id),
          getUpsellRules(id),
        ]);
        setOffer(offerData);
        setRules(rulesData);
        setRuleGroups(rulesToGroups(rulesData));
      } catch (err) {
        setError(err instanceof DashboardApiError ? err.message : 'Could not load offer.');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'analytics' && propertyId && !analytics) {
      const today = new Date().toISOString().split('T')[0]!;
      const from = new Date();
      from.setDate(from.getDate() - 29);
      getUpsellAnalytics(propertyId, {
        from: from.toISOString().split('T')[0]!,
        to: today,
        offerId: id,
      })
        .then(setAnalytics)
        .catch(() => null);
    }
  }, [activeTab, propertyId, analytics, id]);

  async function handleOfferSubmit(data: UpsellOfferFormData) {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await updateUpsellOffer(id, data);
      setOffer(updated);
      setSuccessMsg('Offer saved successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof DashboardApiError ? err.message : 'Save failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSaveRules() {
    if (!offer) return;
    setIsSavingRules(true);
    setError(null);
    try {
      // Delete all existing rules
      await Promise.all(rules.map((r) => deleteUpsellRule(r.id)));

      // Create new rules from groups
      const newRules: UpsellRule[] = [];
      for (let gi = 0; gi < ruleGroups.length; gi++) {
        const group = ruleGroups[gi];
        if (!group) continue;
        for (const cond of group.conditions) {
          const created = await createUpsellRule(id, {
            attribute: cond.attribute,
            operator: cond.operator,
            value: cond.value,
            logicGroup: gi,
          });
          newRules.push(created);
        }
      }
      setRules(newRules);
      setSuccessMsg('Rules saved successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err instanceof DashboardApiError ? err.message : 'Failed to save rules.');
    } finally {
      setIsSavingRules(false);
    }
  }

  const TABS: Array<{ key: ActiveTab; label: string }> = [
    { key: 'details', label: 'Details' },
    { key: 'rules', label: `Rules (${rules.length})` },
    { key: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <Link
          href="/dashboard/upsells"
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          ← Back to Upsell Offers
        </Link>
        <h1 className="text-2xl font-bold text-[var(--color-text)] mt-2">
          {isLoading ? 'Loading…' : (offer?.titleEn ?? 'Edit Offer')}
        </h1>
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
      ) : offer ? (
        <>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-[var(--color-border)]" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="card p-6">
            {activeTab === 'details' && (
              <UpsellOfferForm
                initialData={{
                  category: offer.category as UpsellOfferFormData['category'],
                  titleEn: offer.titleEn,
                  titleFr: offer.titleFr,
                  descriptionEn: offer.descriptionEn ?? '',
                  descriptionFr: offer.descriptionFr ?? '',
                  priceInCents: offer.priceInCents,
                  isActive: offer.isActive,
                }}
                onSubmit={handleOfferSubmit}
                onCancel={() => router.push('/dashboard/upsells')}
                isSubmitting={isSubmitting}
              />
            )}

            {activeTab === 'rules' && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-semibold text-[var(--color-text)]">Targeting Rules</h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
                    Groups are combined with OR. Conditions within a group are combined with AND.
                    If no rules are set, the offer is shown to all guests.
                  </p>
                </div>
                <RuleBuilder groups={ruleGroups} onChange={setRuleGroups} />
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setRuleGroups(rulesToGroups(rules))}
                    disabled={isSavingRules}
                    className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors disabled:opacity-40"
                  >
                    Reset
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveRules}
                    disabled={isSavingRules}
                    className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
                  >
                    {isSavingRules ? 'Saving…' : 'Save Rules'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-5">
                <h2 className="text-base font-semibold text-[var(--color-text)]">
                  Analytics (last 30 days)
                </h2>
                {!analytics ? (
                  <p className="text-sm text-[var(--color-text-muted)]">Loading analytics…</p>
                ) : (
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Impressions', value: analytics.impressions ?? 0 },
                      { label: 'Selections', value: analytics.selections ?? 0 },
                      {
                        label: 'Conversion',
                        value: `${analytics.impressions
                          ? ((analytics.selections / analytics.impressions) * 100).toFixed(1)
                          : 0}%`,
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-lg border border-[var(--color-border)]">
                        <p className="text-2xl font-bold text-[var(--color-text)]">{stat.value}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
