"use client";

import { SectionWrapper } from "./section-wrapper";
import {
  Smartphone,
  ScanFace,
  PenTool,
  Settings2,
  CreditCard,
  Globe,
  Bell,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Mobile-First Check-In",
    description:
      "Guests complete check-in from any device. Responsive, fast, and intuitive — no app download required.",
  },
  {
    icon: ScanFace,
    title: "ID Verification & OCR",
    description:
      "Automatic passport and ID scanning with facial recognition. Verify guest identity in seconds.",
  },
  {
    icon: PenTool,
    title: "Digital Registration Card",
    description:
      "Guests sign the registration card digitally. Fully paperless and legally compliant.",
  },
  {
    icon: Settings2,
    title: "Any PMS Integration",
    description:
      "Works with Opera, Mews, Cloudbeds, Hotelogix, and more. Reservation data syncs automatically.",
  },
  {
    icon: CreditCard,
    title: "Payments & Upsells",
    description:
      "Collect tourist tax, security deposits, and offer upgrades — all before the guest arrives.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Check-in forms automatically adapt to the guest's language and regional requirements.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description:
      "Automated reminders via email, SMS, and WhatsApp at the right time before arrival.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track completion rates, average check-in time, and identify drop-off points.",
  },
  {
    icon: Shield,
    title: "GDPR & Compliance",
    description:
      "Automatic police reporting, data retention policies, and full GDPR compliance built in.",
  },
];

export function FeaturesSection() {
  return (
    <SectionWrapper id="features">
      <div className="text-center">
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          Features
        </span>
        <h2 className="mt-3 text-3xl font-bold text-secondary sm:text-4xl">
          Everything you need for seamless check-in
        </h2>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          A complete pre-check-in platform that handles ID verification,
          payments, compliance, and guest preferences.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-gray-200 bg-white p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <feature.icon size={24} className="text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-secondary">
              {feature.title}
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
