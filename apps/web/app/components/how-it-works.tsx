"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ClipboardCheck, ScanFace, PartyPopper, ArrowRight } from "lucide-react";

const steps = [
  { icon: Mail, num: "01", title: "Receive Link", short: "24-48h before arrival", color: "#c9a55c" },
  { icon: ClipboardCheck, num: "02", title: "Fill Details", short: "Pre-filled from PMS", color: "#1a56db" },
  { icon: ScanFace, num: "03", title: "ID Verified", short: "OCR + selfie match", color: "#06b6d4" },
  { icon: PartyPopper, num: "04", title: "Skip the Desk", short: "Go straight to room", color: "#22c55e" },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive(s => (s + 1) % steps.length), 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="how-it-works" className="py-12 sm:py-16 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">How It Works</span>
          <h2 className="mt-3 font-display text-2xl text-secondary sm:text-3xl">
            Four steps to <span className="italic">effortless</span> arrivals
          </h2>
        </div>

        {/* Horizontal cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <motion.button
                key={step.num}
                onClick={() => setActive(i)}
                layout
                className={`relative rounded-2xl p-5 text-left transition-all duration-500 overflow-hidden ${
                  isActive
                    ? "bg-navy shadow-2xl shadow-navy/30 scale-[1.03]"
                    : "bg-white border border-gray-200/80 hover:shadow-lg hover:scale-[1.01]"
                }`}
              >
                {/* Animated glow for active */}
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-2xl"
                    style={{ background: `radial-gradient(circle at 30% 30%, ${step.color}20, transparent 70%)` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative z-10">
                  {/* Number + icon row */}
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      animate={{ scale: isActive ? 1.1 : 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="h-11 w-11 rounded-xl flex items-center justify-center"
                      style={{
                        backgroundColor: isActive ? step.color : isDone ? "#22c55e15" : `${step.color}10`,
                      }}
                    >
                      <step.icon
                        size={20}
                        style={{ color: isActive ? "#fff" : isDone ? "#22c55e" : step.color }}
                      />
                    </motion.div>
                    <span className={`text-2xl font-bold ${isActive ? "text-white/10" : "text-gray-100"}`}>
                      {step.num}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className={`text-sm font-bold mb-1 ${isActive ? "text-white" : "text-secondary"}`}>
                    {step.title}
                  </h3>

                  {/* Short desc */}
                  <p className={`text-[10px] ${isActive ? "text-white/50" : "text-muted"}`}>
                    {step.short}
                  </p>

                  {/* Progress indicator */}
                  <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "#f3f4f6" }}>
                    {isActive ? (
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 3.5, ease: "linear" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: step.color }}
                      />
                    ) : isDone ? (
                      <div className="h-full w-full rounded-full bg-green-400" />
                    ) : null}
                  </div>
                </div>

                {/* Connector arrow (not on last) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-20">
                    <ArrowRight size={12} className={isActive ? "text-accent" : "text-gray-300"} />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
