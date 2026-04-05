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
      "Check-in is complete before arrival. Guest picks up the key or uses digital key and heads to the room.",
  },
];

export function HowItWorks() {
  return (
    <SectionWrapper id="how-it-works" className="bg-surface !py-16 sm:!py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(26,86,219,0.03),transparent_70%)]" />

      <div className="relative z-10">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            How It Works
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
            Four steps to <span className="italic">effortless</span> arrivals
          </h2>
          <p className="mt-4 text-base text-muted font-light leading-relaxed">
            Transform your guest arrival experience in minutes.
          </p>
        </div>

        <div className="mt-16 relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0" />

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative text-center group"
              >
                <div className="relative mx-auto">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl bg-white border border-gray-200 shadow-lg shadow-gray-200/50 group-hover:shadow-xl group-hover:bg-navy group-hover:border-navy transition-all duration-500">
                    <step.icon size={32} className="text-accent group-hover:text-accent transition-colors duration-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-navy">
                    {step.step}
                  </div>
                </div>

                <h3 className="mt-6 text-lg font-semibold text-secondary">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed font-light">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
