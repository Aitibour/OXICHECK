"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plug, Palette, GraduationCap, Rocket, Headphones, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

const steps = [
  { num: 1, days: "1-2 days", title: "Integration", icon: Plug, color: "#c9a55c", tasks: ["API setup", "Data mapping", "Validation"] },
  { num: 2, days: "1-2 days", title: "Configuration", icon: Palette, color: "#1a56db", tasks: ["Branding", "Upsells", "Guest flow"] },
  { num: 3, days: "2-3 days", title: "Training", icon: GraduationCap, color: "#0ea5e9", tasks: ["Walkthrough", "Live support", "Docs"] },
  { num: 4, days: "Day 7", title: "Go Live", icon: Rocket, color: "#10b981", tasks: ["Launch", "Monitoring", "Tracking"] },
];

export function ImplementationSection() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);

  useEffect(() => {
    if (!auto) return;
    const timer = setInterval(() => setActive(s => (s + 1) % steps.length), 4000);
    return () => clearInterval(timer);
  }, [auto]);

  const handleClick = (i: number) => {
    setActive(i);
    setAuto(false);
  };

  return (
    <section className="py-12 sm:py-14 bg-[#0e1526]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Implementation</span>
          <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">
            Live in <span className="italic text-accent">7 days</span>
          </h2>
        </div>

        {/* Step cards - horizontal */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {steps.map((step, i) => {
            const isActive = i === active;
            const isDone = i < active;
            return (
              <motion.button
                key={step.num}
                onClick={() => handleClick(i)}
                whileHover={{ y: -2 }}
                className={`relative rounded-xl p-4 text-left transition-all duration-500 overflow-hidden ${
                  isActive
                    ? "bg-white/5 border-2"
                    : "bg-white/[0.03] hover:bg-white/[0.06] border border-white/5"
                }`}
                style={{ borderColor: isActive ? step.color : undefined }}
              >
                {/* Active indicator line at top */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5 rounded-full"
                  style={{ backgroundColor: isActive ? step.color : isDone ? "#22c55e" : "rgba(255,255,255,0.05)" }}
                />

                <div className="flex items-center gap-3 mb-3">
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1, rotate: isActive ? 5 : 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: isActive ? step.color : isDone ? "rgba(34,197,94,0.1)" : `${step.color}10` }}
                  >
                    {isDone ? (
                      <Check size={18} className="text-green-400" />
                    ) : (
                      <step.icon size={18} style={{ color: isActive ? "#fff" : step.color }} />
                    )}
                  </motion.div>
                  <div>
                    <p className={`text-xs font-bold ${isActive ? "text-white" : isDone ? "text-green-400" : "text-white/60"}`}>{step.title}</p>
                    <p className="text-[9px] text-white/25">{step.days}</p>
                  </div>
                </div>

                {/* Mini tasks - only visible on active */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-1"
                    >
                      {step.tasks.map((task, j) => (
                        <motion.div
                          key={task}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.08 }}
                          className="flex items-center gap-1.5"
                        >
                          <div className="h-1 w-1 rounded-full" style={{ backgroundColor: step.color }} />
                          <span className="text-[9px] text-white/40">{task}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Auto-advance progress */}
                {isActive && auto && (
                  <div className="mt-3 h-0.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 4, ease: "linear" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: step.color }}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Bottom bar */}
        <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Headphones size={16} className="text-accent" />
            <div>
              <p className="text-xs font-bold text-white">White-glove support included</p>
              <p className="text-[9px] text-white/30">Dedicated account manager · 24/7 during setup · Zero technical knowledge required</p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <div className="text-center">
              <p className="text-sm font-bold text-accent">100%</p>
              <p className="text-[7px] text-white/20 uppercase tracking-wider">Success rate</p>
            </div>
            <Link
              href="/contact"
              className="group inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-[10px] font-semibold text-navy hover:bg-accent-light transition-all shadow-md shadow-accent/20"
            >
              Get Started <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
