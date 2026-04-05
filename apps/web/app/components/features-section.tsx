"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
    description: "No app download required. Guests open a link on any device and complete check-in in under 4 minutes. Responsive design adapts to every screen size.",
    visual: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop",
  },
  {
    icon: ScanFace,
    title: "ID Verification & OCR",
    description: "Automatic passport and ID scanning extracts guest data instantly. Facial recognition matches the document photo to a live selfie for fraud prevention.",
    visual: "https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=600&auto=format&fit=crop",
  },
  {
    icon: PenTool,
    title: "Digital Registration",
    description: "Guests sign the registration card on their phone screen. Legally binding digital signatures replace paper forms entirely — fully compliant in 30+ countries.",
    visual: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=600&auto=format&fit=crop",
  },
  {
    icon: Settings2,
    title: "Any PMS Integration",
    description: "Two-way sync with Opera, Mews, Cloudbeds, and 12+ other platforms. Reservations flow in, check-in status flows back. Zero manual data entry.",
    visual: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
  },
  {
    icon: CreditCard,
    title: "Payments & Upsells",
    description: "Collect tourist tax, security deposits, and pre-authorize cards before arrival. Offer room upgrades, early check-in, and spa packages — all automated.",
    visual: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=600&auto=format&fit=crop",
  },
  {
    icon: Globe,
    title: "Multi-Language",
    description: "Check-in forms automatically adapt to 25+ languages based on guest nationality. Regional compliance requirements are handled per destination country.",
    visual: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=600&auto=format&fit=crop",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Automated reminders via email, SMS, and WhatsApp — timed based on the guest's arrival schedule. Configurable triggers at 48h, 24h, and 2h before check-in.",
    visual: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=600&auto=format&fit=crop",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Real-time completion rates, average check-in duration, and step-by-step drop-off analysis. Know exactly where guests abandon the flow and optimize.",
    visual: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
  },
  {
    icon: Shield,
    title: "GDPR & Compliance",
    description: "Automatic police reporting for Spain, Italy, and Portugal. Data retention policies, consent management, and right-to-deletion — all built in from day one.",
    visual: "https://images.unsplash.com/photo-1563986768609-322da13575f2?q=80&w=600&auto=format&fit=crop",
  },
];

export function FeaturesSection() {
  const [active, setActive] = useState(0);
  const current = features[active]!;

  return (
    <section id="features" className="py-16 sm:py-20 bg-surface relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-xl mx-auto mb-12"
        >
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            Features
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
            Everything you need for <span className="italic">seamless</span> check-in
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - feature list */}
          <div className="lg:w-[45%] space-y-1">
            {features.map((feature, i) => {
              const isActive = i === active;
              return (
                <motion.button
                  key={feature.title}
                  onClick={() => setActive(i)}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={`w-full text-left flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-400 group ${
                    isActive
                      ? "bg-white shadow-lg shadow-gray-200/60 border border-gray-200/80"
                      : "hover:bg-white/60"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isActive ? "bg-accent/15" : "bg-primary/[0.07] group-hover:bg-primary/[0.12]"
                  }`}>
                    <feature.icon size={20} className={`transition-colors duration-300 ${
                      isActive ? "text-accent" : "text-primary"
                    }`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-sm font-semibold transition-colors duration-300 ${
                      isActive ? "text-secondary" : "text-secondary/70"
                    }`}>
                      {feature.title}
                    </h3>
                    {isActive && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="mt-1 text-xs text-muted leading-relaxed"
                      >
                        {feature.description}
                      </motion.p>
                    )}
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="feature-indicator"
                      className="ml-auto w-1 h-8 rounded-full bg-accent shrink-0"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Right - visual */}
          <div className="lg:w-[55%] relative">
            <div className="sticky top-24 rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xl shadow-gray-200/40 aspect-[4/3] bg-white">
              <AnimatePresence mode="wait">
                <motion.img
                  key={active}
                  src={current.visual}
                  alt={current.title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-navy/80 to-transparent p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-white font-semibold text-sm">{current.title}</p>
                    <p className="text-white/60 text-xs mt-1 line-clamp-2">{current.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
