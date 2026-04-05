"use client";

import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { Mail, ClipboardCheck, ScanFace, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Mail,
    step: "01",
    title: "Guest Receives Link",
    description:
      "24-48 hours before arrival, guests receive an email or SMS with a personalized check-in link.",
  },
  {
    icon: ClipboardCheck,
    step: "02",
    title: "Fills Details & Preferences",
    description:
      "Guests complete their personal details, room preferences, and special requests on a mobile-friendly form.",
  },
  {
    icon: ScanFace,
    step: "03",
    title: "ID Verified Instantly",
    description:
      "Upload passport or ID — OCR extracts data automatically. Facial match confirms identity in seconds.",
  },
  {
    icon: PartyPopper,
    step: "04",
    title: "Arrive & Go Straight to Room",
    description:
      "Check-in is complete before arrival. Guest picks up the key (or uses digital key) and heads to the room.",
  },
];

export function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" className="bg-surface">
      <div className="text-center">
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          How It Works
        </span>
        <h2 className="mt-3 text-3xl font-bold text-secondary sm:text-4xl">
          Check-in complete before arrival
        </h2>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Four simple steps to transform your guest arrival experience.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
            className="relative text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25">
              <step.icon size={28} />
            </div>
            <span className="mt-4 inline-block text-xs font-bold text-primary uppercase tracking-wider">
              Step {step.step}
            </span>
            <h3 className="mt-2 text-lg font-semibold text-secondary">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {step.description}
            </p>

            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[calc(50%+40px)] w-[calc(100%-80px)] border-t-2 border-dashed border-primary/20" />
            )}
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
