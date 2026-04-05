"use client";

import { Heart, ArrowLeft } from "lucide-react";

interface Props {
  preferences: Record<string, unknown>;
  setPreferences: (prefs: Record<string, unknown>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPreferences({
  preferences,
  setPreferences,
  onNext,
  onBack,
}: Props) {
  function update(key: string, value: unknown) {
    setPreferences({ ...preferences, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Heart size={20} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-secondary">
            Your Preferences
          </h2>
          <p className="text-xs text-muted">
            Help us make your stay perfect (all optional)
          </p>
        </div>
      </div>

      {/* Floor Preference */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-2">
          Floor Preference
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(["low", "mid", "high"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update("floorPreference", option)}
              className={`rounded-lg border py-2.5 text-sm font-medium transition-colors ${
                preferences.floorPreference === option
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-muted hover:border-gray-300"
              }`}
            >
              {option === "low" ? "Lower" : option === "mid" ? "Middle" : "Higher"}
            </button>
          ))}
        </div>
      </div>

      {/* Bed Type */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-2">
          Bed Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["single", "double", "twin", "king"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update("bedType", option)}
              className={`rounded-lg border py-2.5 text-sm font-medium capitalize transition-colors ${
                preferences.bedType === option
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-muted hover:border-gray-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Pillow Type */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-2">
          Pillow Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(["soft", "firm"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => update("pillowType", option)}
              className={`rounded-lg border py-2.5 text-sm font-medium capitalize transition-colors ${
                preferences.pillowType === option
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 text-muted hover:border-gray-300"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Early Check-in / Late Checkout */}
      <div className="space-y-3">
        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={!!preferences.earlyCheckIn}
            onChange={(e) => update("earlyCheckIn", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-medium text-secondary">
              Early Check-In
            </p>
            <p className="text-xs text-muted">
              Subject to availability, extra charges may apply
            </p>
          </div>
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:border-gray-300 transition-colors">
          <input
            type="checkbox"
            checked={!!preferences.lateCheckOut}
            onChange={(e) => update("lateCheckOut", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <div>
            <p className="text-sm font-medium text-secondary">
              Late Check-Out
            </p>
            <p className="text-xs text-muted">
              Subject to availability, extra charges may apply
            </p>
          </div>
        </label>
      </div>

      {/* Special Requests */}
      <div>
        <label className="block text-xs font-medium text-secondary mb-1">
          Special Requests
        </label>
        <textarea
          value={(preferences.specialRequests as string) || ""}
          onChange={(e) => update("specialRequests", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
          placeholder="Extra towels, baby crib, dietary requirements..."
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 rounded-lg bg-primary py-3 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
