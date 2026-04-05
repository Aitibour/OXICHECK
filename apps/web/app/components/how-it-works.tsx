"use client";

import { useState, useEffect } from "react";
import { SectionWrapper } from "./section-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ClipboardCheck, ScanFace, PartyPopper, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Mail,
    step: "01",
    title: "Guest Receives Link",
    description: "24-48 hours before arrival, guests receive a personalized check-in link via email or SMS. One tap opens a mobile-optimized form — no app download needed.",
    detail: "Automated triggers based on reservation date. Works with any email or phone number from the PMS.",
    image: "https://images.unsplash.com/photo-1596526131083-e8c633c948d2?q=80&w=600&auto=format&fit=crop",
    color: "#c9a55c",
  },
  {
    icon: ClipboardCheck,
    step: "02",
    title: "Fills Details & Preferences",
    description: "Guests complete personal details pre-filled from the reservation. They choose room preferences, bed type, floor, and add special requests.",
    detail: "Smart forms adapt per hotel configuration. Fields are pre-populated from PMS data to minimize typing.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=600&auto=format&fit=crop",
    color: "#1a56db",
  },
  {
    icon: ScanFace,
    step: "03",
    title: "ID Verified Instantly",
    description: "Guests upload their passport or national ID. OCR extracts all data automatically. A selfie match confirms identity — completed in under 30 seconds.",
    detail: "Supports 5,000+ document types from 190+ countries. Biometric liveness detection prevents fraud.",
    image: "https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=600&auto=format&fit=crop",
    color: "#06b6d4",
  },
  {
    icon: PartyPopper,
    step: "04",
    title: "Arrive & Go to Room",
    description: "Check-in is complete before the guest arrives. They skip the front desk entirely, pick up their key (or use a digital key), and head straight to the room.",
    detail: "Status syncs back to your PMS in real-time. Front desk sees the green light instantly.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop",
    color: "#22c55e",
  },
];

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 6000;
    const interval = 50;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += interval;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        setActiveStep((s) => (s + 1) % steps.length);
        elapsed = 0;
        setProgress(0);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [activeStep]);

  const current = steps[activeStep]!;

  return (
    <SectionWrapper id="how-it-works" className="!py-16 sm:!py-20 relative overflow-hidden">
      <div className="relative z-10">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            How It Works
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
            Four steps to <span className="italic">effortless</span> arrivals
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left - step selector */}
          <div className="lg:w-[40%] space-y-2">
            {steps.map((step, i) => {
              const isActive = i === activeStep;
              return (
                <button
                  key={step.step}
                  onClick={() => { setActiveStep(i); setProgress(0); }}
                  className={`w-full text-left rounded-xl p-5 transition-all duration-500 relative overflow-hidden ${
                    isActive
                      ? "bg-white shadow-lg shadow-gray-200/60 border border-gray-200/80"
                      : "hover:bg-white/60"
                  }`}
                >
                  {/* Progress bar */}
                  {isActive && (
                    <div
                      className="absolute bottom-0 left-0 h-0.5 bg-accent transition-all duration-100 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}

                  <div className="flex items-start gap-4">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500"
                      style={{
                        backgroundColor: isActive ? `${step.color}18` : "#f7f8fa",
                      }}
                    >
                      <step.icon
                        size={20}
                        style={{ color: isActive ? step.color : "#5e6a7e" }}
                        className="transition-colors duration-500"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] font-bold uppercase tracking-wider transition-colors duration-300"
                          style={{ color: isActive ? step.color : "#5e6a7e" }}
                        >
                          Step {step.step}
                        </span>
                        {i < activeStep && (
                          <span className="text-[9px] font-semibold text-green-500 uppercase tracking-wider bg-green-50 px-1.5 py-0.5 rounded">
                            Done
                          </span>
                        )}
                      </div>
                      <h3 className={`text-sm font-semibold mt-0.5 transition-colors duration-300 ${
                        isActive ? "text-secondary" : "text-secondary/60"
                      }`}>
                        {step.title}
                      </h3>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="mt-2 text-xs text-muted leading-relaxed">
                            {step.description}
                          </p>
                          <p className="mt-2 text-[11px] text-accent font-medium flex items-center gap-1">
                            <ArrowRight size={11} />
                            {step.detail}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right - visual */}
          <div className="lg:w-[60%]">
            <div className="sticky top-24 rounded-2xl overflow-hidden border border-gray-200/80 shadow-2xl shadow-gray-200/40 aspect-[4/3] bg-white relative">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeStep}
                  src={current.image}
                  alt={current.title}
                  initial={{ opacity: 0, scale: 1.08 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Step counter overlay */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === activeStep ? "w-8" : i < activeStep ? "w-3" : "w-1.5"
                    }`}
                    style={{
                      backgroundColor:
                        i === activeStep ? current.color : i < activeStep ? "#22c55e" : "rgba(255,255,255,0.3)",
                    }}
                  />
                ))}
              </div>

              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-navy/80 to-transparent p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${current.color}30`, color: current.color }}
                      >
                        Step {current.step}
                      </span>
                    </div>
                    <p className="text-white font-semibold text-sm">{current.title}</p>
                    <p className="text-white/50 text-xs mt-1">{current.description}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
