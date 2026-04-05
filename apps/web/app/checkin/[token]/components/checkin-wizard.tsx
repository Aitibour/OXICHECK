"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CheckinData } from "../page";
import { StepPersonalDetails } from "./step-personal-details";
import { StepIdUpload } from "./step-id-upload";
import { StepPreferences } from "./step-preferences";
import { StepSignature } from "./step-signature";
import { StepReview } from "./step-review";
import { StepComplete } from "./step-complete";
import { Check } from "lucide-react";

const API_URL = "";

const STEPS = [
  { id: "personal", label: "Details" },
  { id: "id-upload", label: "ID" },
  { id: "preferences", label: "Preferences" },
  { id: "signature", label: "Signature" },
  { id: "review", label: "Review" },
];

interface WizardProps {
  token: string;
  data: CheckinData;
}

export function CheckinWizard({ token, data }: WizardProps) {
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>(
    (data.formData as Record<string, string>) || {
      firstName: data.guest?.firstName || "",
      lastName: data.guest?.lastName || "",
      email: data.guest?.email || "",
      phone: data.guest?.phone || "",
      nationality: data.guest?.nationality || "",
      dateOfBirth: data.guest?.dateOfBirth || "",
      address: "",
      city: "",
      country: "",
      postalCode: "",
    }
  );
  const [preferences, setPreferences] = useState<Record<string, unknown>>(
    (data.preferences as Record<string, unknown>) || {}
  );
  const [idImages, setIdImages] = useState<{
    front: string | null;
    back: string | null;
    selfie: string | null;
  }>({ front: null, back: null, selfie: null });
  const [signature, setSignature] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  async function submitForm() {
    const res = await fetch(`${API_URL}/api/checkin/${token}/form`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (!res.ok) throw new Error("Failed to submit form");
  }

  async function submitPreferences() {
    const res = await fetch(`${API_URL}/api/checkin/${token}/preferences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(preferences),
    });
    if (!res.ok) throw new Error("Failed to submit preferences");
  }

  async function completeCheckin() {
    setSubmitting(true);
    try {
      await submitForm();
      await submitPreferences();
      const res = await fetch(`${API_URL}/api/checkin/${token}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to complete check-in");
      setCompleted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (completed) {
    return <StepComplete hotel={data.hotel} reservation={data.reservation} />;
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="min-h-screen bg-surface">
      {/* Hotel Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-lg px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-secondary">
              {data.hotel.name}
            </h1>
            <p className="text-xs text-muted">
              {formatDate(data.reservation.checkInDate)} &mdash;{" "}
              {formatDate(data.reservation.checkOutDate)}
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm">
            O
          </div>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-lg px-4 py-3">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      i < step
                        ? "bg-success text-white"
                        : i === step
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-muted"
                    }`}
                  >
                    {i < step ? <Check size={14} /> : i + 1}
                  </div>
                  <span
                    className={`mt-1 text-[10px] ${
                      i <= step ? "text-secondary font-medium" : "text-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 w-6 sm:w-10 ${
                      i < step ? "bg-success" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="mx-auto max-w-lg px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <StepPersonalDetails
                formData={formData}
                setFormData={setFormData}
                onNext={next}
              />
            )}
            {step === 1 && (
              <StepIdUpload
                idImages={idImages}
                setIdImages={setIdImages}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 2 && (
              <StepPreferences
                preferences={preferences}
                setPreferences={setPreferences}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 3 && (
              <StepSignature
                signature={signature}
                setSignature={setSignature}
                onNext={next}
                onBack={back}
              />
            )}
            {step === 4 && (
              <StepReview
                formData={formData}
                preferences={preferences}
                idImages={idImages}
                signature={signature}
                submitting={submitting}
                onSubmit={completeCheckin}
                onBack={back}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Powered by */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur border-t border-gray-100 py-2 text-center">
        <span className="text-[10px] text-muted">
          Powered by{" "}
          <span className="font-medium">
            Oxi<span className="text-primary">Check</span>
          </span>
        </span>
      </div>
    </div>
  );
}
