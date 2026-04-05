"use client";

import { ClipboardCheck, ArrowLeft, Loader2 } from "lucide-react";

interface Props {
  formData: Record<string, string>;
  preferences: Record<string, unknown>;
  idImages: { front: string | null; back: string | null; selfie: string | null };
  signature: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

export function StepReview({
  formData,
  preferences,
  idImages,
  signature,
  submitting,
  onSubmit,
  onBack,
}: Props) {
  const activePreferences = Object.entries(preferences).filter(
    ([, v]) => v !== "" && v !== false && v !== undefined && v !== null
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <ClipboardCheck size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary">
            Review & Submit
          </h2>
          <p className="text-xs text-muted">
            Please review your information before submitting
          </p>
        </div>
      </div>

      {/* Personal Details */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-medium text-secondary">
            Personal Details
          </span>
        </div>
        <div className="p-4 space-y-2">
          <ReviewRow label="Name" value={`${formData.firstName || ""} ${formData.lastName || ""}`} />
          <ReviewRow label="Email" value={formData.email || ""} />
          {formData.phone && <ReviewRow label="Phone" value={formData.phone || ""} />}
          {formData.nationality && (
            <ReviewRow label="Nationality" value={formData.nationality || ""} />
          )}
          {formData.dateOfBirth && (
            <ReviewRow label="Date of Birth" value={formData.dateOfBirth || ""} />
          )}
          {formData.address && (
            <ReviewRow
              label="Address"
              value={[formData.address, formData.city, formData.country, formData.postalCode]
                .filter(Boolean)
                .join(", ")}
            />
          )}
        </div>
      </div>

      {/* ID Documents */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-medium text-secondary">
            ID Documents
          </span>
        </div>
        <div className="p-4">
          <div className="flex gap-3">
            {idImages.front && (
              <img
                src={idImages.front}
                alt="ID Front"
                className="w-20 h-14 rounded object-cover border border-gray-200"
              />
            )}
            {idImages.back && (
              <img
                src={idImages.back}
                alt="ID Back"
                className="w-20 h-14 rounded object-cover border border-gray-200"
              />
            )}
            {idImages.selfie && (
              <img
                src={idImages.selfie}
                alt="Selfie"
                className="w-14 h-14 rounded-full object-cover border border-gray-200"
              />
            )}
          </div>
          {!idImages.front && (
            <p className="text-xs text-muted">No ID uploaded</p>
          )}
        </div>
      </div>

      {/* Preferences */}
      {activePreferences.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-medium text-secondary">
              Preferences
            </span>
          </div>
          <div className="p-4 space-y-2">
            {activePreferences.map(([key, value]) => (
              <ReviewRow
                key={key}
                label={key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s) => s.toUpperCase())}
                value={typeof value === "boolean" ? "Yes" : String(value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Signature */}
      {signature && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <span className="text-xs font-medium text-secondary">
              Signature
            </span>
          </div>
          <div className="p-4">
            <img
              src={signature}
              alt="Signature"
              className="h-16 rounded border border-gray-100"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={submitting}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-muted hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="flex-1 rounded-lg bg-success py-3 text-sm font-medium text-white hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Submitting...
            </>
          ) : (
            "Complete Check-In"
          )}
        </button>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-secondary text-right max-w-[60%]">
        {value}
      </span>
    </div>
  );
}
