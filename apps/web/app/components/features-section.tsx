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
    description: "No app download. Works on any device, instantly.",
  },
  {
    icon: ScanFace,
    title: "ID Verification & OCR",
    description: "Passport scanning with facial recognition in seconds.",
  },
  {
    icon: PenTool,
    title: "Digital Registration",
    description: "Paperless signatures. Legally compliant everywhere.",
  },
  {
    icon: Settings2,
    title: "Any PMS Integration",
    description: "Opera, Mews, Cloudbeds — data syncs automatically.",
  },
  {
    icon: CreditCard,
    title: "Payments & Upsells",
    description: "Tourist tax, deposits, and upgrades before arrival.",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Forms adapt to guest language and region.",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Email, SMS, WhatsApp — timed to perfection.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Completion rates, timing, and drop-off insights.",
  },
  {
    icon: Shield,
    title: "GDPR & Compliance",
    description: "Police reporting and data retention built in.",
  },
];

export function FeaturesSection() {
  return (
    <SectionWrapper id="features" className="!py-16 sm:!py-20">
      <div className="text-center max-w-xl mx-auto mb-14">
        <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
          Features
        </span>
        <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
          Everything you need for <span className="italic">seamless</span> check-in
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-9 gap-y-8 gap-x-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="flex flex-col items-center text-center group"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full bg-surface border border-gray-200/80 flex items-center justify-center group-hover:border-accent/40 group-hover:shadow-lg group-hover:shadow-accent/10 transition-all duration-500">
                <feature.icon size={24} className="text-primary group-hover:text-accent transition-colors duration-300" />
              </div>
              <div className="absolute inset-0 rounded-full bg-accent/10 scale-0 group-hover:scale-110 transition-transform duration-500 -z-10" />
            </div>
            <h3 className="mt-3 text-xs font-semibold text-secondary leading-tight">
              {feature.title}
            </h3>
            <p className="mt-1 text-[11px] text-muted leading-snug max-w-[120px]">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
