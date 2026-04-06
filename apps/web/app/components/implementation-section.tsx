"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plug, Palette, GraduationCap, Rocket, Check, Clock, Headphones, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    num: 1,
    days: "1-2 days",
    title: "Integration",
    subtitle: "Connect OXICHECK to your existing PMS system",
    icon: Plug,
    color: "#c9a55c",
    tasks: ["API credentials setup", "Data mapping configuration", "Test environment validation"],
  },
  {
    num: 2,
    days: "1-2 days",
    title: "Configuration",
    subtitle: "Customize branding, workflows, and upsell offers",
    icon: Palette,
    color: "#1a56db",
    tasks: ["Brand customization", "Upsell service setup", "Guest flow configuration"],
  },
  {
    num: 3,
    days: "2-3 days",
    title: "Staff Training",
    subtitle: "Comprehensive training for your reception team",
    icon: GraduationCap,
    color: "#0ea5e9",
    tasks: ["System walkthrough", "Live support sessions", "Documentation provided"],
  },
  {
    num: 4,
    days: "Day 7",
    title: "Go Live",
    subtitle: "Launch to guests and start seeing results",
    icon: Rocket,
    color: "#10b981",
    tasks: ["Soft launch monitoring", "Real-time support", "Performance tracking"],
  },
];

const supportStats = [
  { value: "24/7", label: "Implementation Support" },
  { value: "100%", label: "Success Rate" },
  { value: "Zero", label: "Technical Knowledge Required" },
];

export function ImplementationSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className="py-12 sm:py-16 bg-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-3">
          <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Implementation Process</span>
          <h2 className="mt-2 font-display text-2xl text-secondary sm:text-3xl">
            The 4-Step <span className="italic">Setup</span> Process
          </h2>
          <p className="mt-1 text-xs text-muted">From integration to go-live in under <span className="font-semibold text-accent">7 days</span></p>
        </div>

        {/* Time to value badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-4 py-1.5">
            <Clock size={12} className="text-accent" />
            <span className="text-[10px] font-bold text-accent">Time to Value: Go live in under 7 days</span>
          </div>
        </div>

        {/* Steps timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Step selector */}
          <div className="space-y-3">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              return (
                <motion.button
                  key={step.num}
                  onClick={() => setActiveStep(i)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left rounded-xl p-4 transition-all duration-300 flex items-start gap-4 ${
                    isActive
                      ? "bg-white border-2 shadow-lg"
                      : "bg-white/50 border border-gray-200/80 hover:bg-white hover:shadow-md"
                  }`}
                  style={{ borderColor: isActive ? step.color : undefined }}
                >
                  {/* Step number */}
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.num}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-secondary">{step.title}</h3>
                      <span className="text-[9px] font-semibold rounded-full px-2 py-0.5 bg-gray-100 text-muted">{step.days}</span>
                    </div>
                    <p className="text-[10px] text-muted mt-0.5">{step.subtitle}</p>
                  </div>

                  <step.icon size={18} className="shrink-0 mt-1" style={{ color: step.color }} />
                </motion.button>
              );
            })}
          </div>

          {/* Right: Active step detail */}
          <div>
            <AnimatePresence mode="wait">
              {(() => {
                const step = steps[activeStep]!;
                return (
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl bg-navy p-6 h-full flex flex-col"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: step.color + "20" }}
                      >
                        <step.icon size={24} style={{ color: step.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Step {step.num}: {step.title}</h3>
                        <p className="text-xs text-white/50">{step.days}</p>
                      </div>
                    </div>

                    <p className="text-sm text-white/60 mb-5">{step.subtitle}</p>

                    <div className="space-y-3 flex-1">
                      {step.tasks.map((task, j) => (
                        <motion.div
                          key={task}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.1 }}
                          className="flex items-center gap-3 rounded-lg bg-white/5 border border-white/10 p-3"
                        >
                          <div className="h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: step.color + "30" }}>
                            <Check size={10} style={{ color: step.color }} />
                          </div>
                          <span className="text-xs text-white/80">{task}</span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[9px] text-white/30 uppercase tracking-wider">Progress</span>
                        <span className="text-[9px] font-semibold text-white/50">{(activeStep + 1) * 25}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(activeStep + 1) * 25}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: step.color }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>
        </div>

        {/* White-glove support */}
        <div className="mt-8 rounded-2xl bg-white border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Headphones size={16} className="text-accent" />
                <h3 className="text-sm font-bold text-secondary">White-Glove Implementation Support</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Our dedicated implementation team handles everything from start to finish.
                You get a dedicated account manager, 24/7 support during setup, and hands-on training.
              </p>
            </div>
            <div className="flex items-center gap-6">
              {supportStats.map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-lg font-bold text-navy">{s.value}</p>
                  <p className="text-[8px] text-muted uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-navy hover:bg-accent-light transition-all shadow-md shadow-accent/20 shrink-0"
            >
              Start Your 7-Day Implementation
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
