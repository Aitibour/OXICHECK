"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, ScanFace, PenTool, Settings2, CreditCard,
  Globe, Bell, BarChart3, Shield,
} from "lucide-react";

const features = [
  { icon: Smartphone, title: "Mobile Check-In", desc: "No app. Any device. Under 4 minutes.", detail: "Responsive design adapts to every screen. Guests open a link and complete check-in instantly." },
  { icon: ScanFace, title: "ID & OCR", desc: "Passport scanning + facial match.", detail: "Automatic data extraction from 5,000+ document types. Biometric liveness detection prevents fraud." },
  { icon: PenTool, title: "Digital Signature", desc: "Paperless. Legally compliant.", detail: "Guests sign on their phone screen. Binding digital signatures replace paper in 30+ countries." },
  { icon: Settings2, title: "Any PMS", desc: "Opera, Mews, Cloudbeds & more.", detail: "Two-way sync. Reservations flow in, check-in status flows back. Zero manual data entry." },
  { icon: CreditCard, title: "Payments", desc: "Tax, deposits & upsells.", detail: "Collect tourist tax, pre-authorize cards, offer room upgrades — all automated before arrival." },
  { icon: Globe, title: "Multi-Language", desc: "25+ languages auto-detected.", detail: "Forms adapt based on guest nationality. Regional compliance handled per destination country." },
  { icon: Bell, title: "Notifications", desc: "Email, SMS, WhatsApp.", detail: "Automated reminders timed to the guest's arrival schedule. Configurable triggers." },
  { icon: BarChart3, title: "Analytics", desc: "Rates, timing & drop-offs.", detail: "Real-time completion rates, average duration, and step-by-step drop-off analysis." },
  { icon: Shield, title: "GDPR", desc: "Police reporting built in.", detail: "Auto police reporting for Spain, Italy, Portugal. Data retention and consent management included." },
];

export function FeaturesSection() {
  const [active, setActive] = useState(0);
  const current = features[active]!;

  return (
    <section id="features" className="py-12 sm:py-16 bg-[#0e1526]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">Features</span>
          <h2 className="mt-3 font-display text-2xl text-white sm:text-3xl">
            Everything for <span className="italic text-accent">seamless</span> check-in
          </h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
          {features.map((f, i) => {
            const isActive = i === active;
            return (
              <motion.button
                key={f.title}
                onClick={() => setActive(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`flex flex-col items-center text-center p-3 rounded-xl transition-all duration-300 ${
                  isActive ? "bg-accent/15 border border-accent/30 shadow-md shadow-accent/10" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  isActive ? "bg-accent text-navy" : "bg-white/10 text-white/60"
                }`}>
                  <f.icon size={18} />
                </div>
                <p className={`mt-2 text-[10px] font-semibold leading-tight transition-colors ${
                  isActive ? "text-accent" : "text-white/50"
                }`}>{f.title}</p>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-4 rounded-xl bg-white/5 border border-white/10 p-5 flex items-center gap-5"
          >
            <div className="h-12 w-12 rounded-xl bg-accent/15 flex items-center justify-center shrink-0">
              <current.icon size={22} className="text-accent" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{current.title} — {current.desc}</p>
              <p className="text-xs text-white/50 mt-1 leading-relaxed">{current.detail}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
