"use client";

import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
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
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="max-w-xl">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            Features
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-5xl leading-tight">
            Everything you need for{" "}
            <span className="italic text-primary">seamless</span> check-in
          </h2>
        </div>
        <p className="text-base text-muted max-w-md leading-relaxed font-light lg:text-right">
          A complete pre-check-in platform that handles ID verification,
          payments, compliance, and guest preferences.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-px sm:grid-cols-2 lg:grid-cols-3 bg-gray-200/60 rounded-2xl overflow-hidden border border-gray-200/80">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="group bg-white p-8 hover:bg-surface transition-all duration-500 relative"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/[0.07] group-hover:bg-primary/[0.12] transition-colors duration-300">
              <feature.icon size={22} className="text-primary" />
            </div>
            <h3 className="mt-5 text-base font-semibold text-secondary">
              {feature.title}
            </h3>
            <p className="mt-2.5 text-sm text-muted leading-relaxed font-light">
              {feature.description}
            </p>
            <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
