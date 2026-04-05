"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative h-screen flex items-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/75 to-navy/95" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/40 to-transparent" />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 right-[10%] w-72 h-72 rounded-full bg-accent/10 blur-[120px]" />
      <div className="absolute bottom-1/4 left-[5%] w-96 h-96 rounded-full bg-primary/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-accent/30 bg-accent/10 backdrop-blur-sm px-5 py-2 text-sm font-medium text-accent-light">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              Now available for all PMS platforms
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 font-display text-4xl tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]"
          >
            The future of hotel arrivals{" "}
            <span className="text-shimmer italic">starts before the lobby</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-base text-white/60 sm:text-lg leading-relaxed max-w-2xl font-light"
          >
            Guests complete check-in before arrival — ID verification,
            preferences, payments. Hotels focus on hospitality, not paperwork.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex flex-col sm:flex-row items-start gap-3"
          >
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-navy hover:bg-accent-light transition-all duration-300 shadow-xl shadow-accent/20"
            >
              Request a Demo
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-7 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-all duration-300"
            >
              See How It Works
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-10 flex items-center gap-10 text-sm"
          >
            {[
              { value: "70%", label: "Faster check-in" },
              { value: "95%", label: "Completion rate" },
              { value: "500+", label: "Hotels trust us" },
            ].map((stat, i) => (
              <div key={stat.label} className="flex items-center gap-3">
                {i > 0 && (
                  <div className="h-8 w-px bg-white/15 -ml-5 mr-0" />
                )}
                <div>
                  <p className="text-xl font-semibold text-accent">
                    {stat.value}
                  </p>
                  <p className="text-white/40 text-[10px] font-medium uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown size={24} className="text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
