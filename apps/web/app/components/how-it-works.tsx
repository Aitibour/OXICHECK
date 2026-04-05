"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ClipboardCheck, ScanFace, PartyPopper } from "lucide-react";

const steps = [
  { icon: Mail, step: "01", title: "Receive Link", desc: "Guest gets a personalized check-in link via email or SMS, 24-48h before arrival.", color: "#c9a55c" },
  { icon: ClipboardCheck, step: "02", title: "Fill Details", desc: "Personal info pre-filled from PMS. Guest adds preferences, bed type, special requests.", color: "#1a56db" },
  { icon: ScanFace, step: "03", title: "ID Verified", desc: "Passport or ID scanned by OCR. Selfie match confirms identity in under 30 seconds.", color: "#06b6d4" },
  { icon: PartyPopper, step: "04", title: "Skip the Desk", desc: "Check-in complete. Guest arrives, picks up key or uses digital key, goes to room.", color: "#22c55e" },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const dur = 4000;
    const interval = 40;
    let elapsed = 0;
    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / dur) * 100);
      if (elapsed >= dur) {
        setActive((s) => (s + 1) % steps.length);
        elapsed = 0;
        setProgress(0);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [active]);

  const current = steps[active]!;

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">How It Works</span>
          <h2 className="mt-3 font-display text-2xl text-secondary sm:text-3xl">
            Four steps to <span className="italic">effortless</span> arrivals
          </h2>
        </div>

        {/* Timeline */}
        <div className="flex items-center gap-0 mb-8">
          {steps.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <div key={step.step} className="flex-1 flex items-center">
                <button
                  onClick={() => { setActive(i); setProgress(0); }}
                  className="relative flex flex-col items-center w-full group"
                >
                  {/* Circle */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.15 : 1,
                      backgroundColor: isActive ? current.color : isDone ? "#22c55e" : "#e5e7eb",
                    }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="h-12 w-12 rounded-full flex items-center justify-center relative z-10"
                  >
                    <step.icon size={20} className={isActive || isDone ? "text-white" : "text-muted"} />
                  </motion.div>

                  {/* Label */}
                  <p className={`mt-2 text-[11px] font-semibold transition-colors duration-300 ${
                    isActive ? "text-secondary" : "text-muted/60"
                  }`}>{step.title}</p>

                  {/* Progress bar under active */}
                  {isActive && (
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-100 ease-linear" style={{ width: `${progress}%` }} />
                    </div>
                  )}
                </button>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-1 rounded-full overflow-hidden bg-gray-200">
                    <motion.div
                      animate={{ width: isDone ? "100%" : i === active ? `${progress}%` : "0%" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: isDone ? "#22c55e" : current.color }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Active step detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-gray-200/80 bg-white p-6 flex items-center gap-5 shadow-sm"
          >
            <div
              className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${current.color}15` }}
            >
              <current.icon size={24} style={{ color: current.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ backgroundColor: `${current.color}15`, color: current.color }}>
                  Step {current.step}
                </span>
                <h3 className="text-base font-semibold text-secondary">{current.title}</h3>
              </div>
              <p className="text-sm text-muted leading-relaxed">{current.desc}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
