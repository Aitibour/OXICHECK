'use client';

import { useState } from 'react';

export type UpsellCategory =
  | 'ROOM_UPGRADE'
  | 'EARLY_CHECKIN'
  | 'LATE_CHECKOUT'
  | 'FOOD_BEVERAGE'
  | 'SPA_WELLNESS'
  | 'PARKING'
  | 'TRANSPORTATION'
  | 'EXPERIENCE'
  | 'OTHER';

const CATEGORY_OPTIONS: Array<{ value: UpsellCategory; label: string; icon: string }> = [
  { value: 'ROOM_UPGRADE', label: 'Room Upgrade', icon: '🏨' },
  { value: 'EARLY_CHECKIN', label: 'Early Check-in', icon: '⏰' },
  { value: 'LATE_CHECKOUT', label: 'Late Check-out', icon: '🌙' },
  { value: 'FOOD_BEVERAGE', label: 'Food & Beverage', icon: '🍽' },
  { value: 'SPA_WELLNESS', label: 'Spa & Wellness', icon: '💆' },
  { value: 'PARKING', label: 'Parking', icon: '🚗' },
  { value: 'TRANSPORTATION', label: 'Transportation', icon: '🚌' },
  { value: 'EXPERIENCE', label: 'Experience', icon: '🎭' },
  { value: 'OTHER', label: 'Other', icon: '📦' },
];

export interface UpsellOfferFormData {
  category: UpsellCategory;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  priceInCents: number;
  isActive: boolean;
}

interface UpsellOfferFormProps {
  initialData?: Partial<UpsellOfferFormData>;
  onSubmit: (data: UpsellOfferFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UpsellOfferForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UpsellOfferFormProps) {
  const [category, setCategory] = useState<UpsellCategory>(
    initialData?.category ?? 'OTHER',
  );
  const [titleEn, setTitleEn] = useState(initialData?.titleEn ?? '');
  const [titleFr, setTitleFr] = useState(initialData?.titleFr ?? '');
  const [descriptionEn, setDescriptionEn] = useState(initialData?.descriptionEn ?? '');
  const [descriptionFr, setDescriptionFr] = useState(initialData?.descriptionFr ?? '');
  const [priceDisplay, setPriceDisplay] = useState(
    initialData?.priceInCents != null
      ? (initialData.priceInCents / 100).toFixed(2)
      : '',
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!titleEn.trim()) errs.titleEn = 'English title is required';
    if (!titleFr.trim()) errs.titleFr = 'French title is required';
    const price = parseFloat(priceDisplay);
    if (isNaN(price) || price < 0) errs.price = 'Enter a valid price (e.g. 25.00)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit({
      category,
      titleEn: titleEn.trim(),
      titleFr: titleFr.trim(),
      descriptionEn: descriptionEn.trim(),
      descriptionFr: descriptionFr.trim(),
      priceInCents: Math.round(parseFloat(priceDisplay) * 100),
      isActive,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as UpsellCategory)}
          className="form-input w-full"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.icon} {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Titles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Title (English) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titleEn}
            onChange={(e) => setTitleEn(e.target.value)}
            placeholder="e.g. Room Upgrade"
            className="form-input w-full"
          />
          {errors.titleEn && (
            <p className="text-xs text-red-600 mt-1">{errors.titleEn}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Title (French) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={titleFr}
            onChange={(e) => setTitleFr(e.target.value)}
            placeholder="ex. Surclassement de chambre"
            className="form-input w-full"
          />
          {errors.titleFr && (
            <p className="text-xs text-red-600 mt-1">{errors.titleFr}</p>
          )}
        </div>
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Description (English)
          </label>
          <textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            rows={3}
            placeholder="Describe the offer in English…"
            className="form-input w-full resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Description (French)
          </label>
          <textarea
            value={descriptionFr}
            onChange={(e) => setDescriptionFr(e.target.value)}
            rows={3}
            placeholder="Décrivez l'offre en français…"
            className="form-input w-full resize-none"
          />
        </div>
      </div>

      {/* Price + Active */}
      <div className="flex flex-wrap gap-6 items-end">
        <div className="w-48">
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Price (CAD) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-[var(--color-text-muted)] pointer-events-none text-sm">
              $
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
              placeholder="0.00"
              className="form-input w-full pl-7"
            />
          </div>
          {errors.price && (
            <p className="text-xs text-red-600 mt-1">{errors.price}</p>
          )}
        </div>

        <div className="flex items-center gap-3 pb-1">
          <button
            type="button"
            role="switch"
            aria-checked={isActive}
            onClick={() => setIsActive((v) => !v)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-[var(--color-text)]">
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-2 border-t border-[var(--color-border)]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm rounded-lg border border-[var(--color-border)] hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Saving…' : 'Save Offer'}
        </button>
      </div>
    </form>
  );
}
