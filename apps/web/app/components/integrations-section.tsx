"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const pmsIntegrations = [
  { name: "Oracle OPERA", category: "Enterprise" },
  { name: "Mews", category: "Cloud PMS" },
  { name: "Cloudbeds", category: "Cloud PMS" },
  { name: "Hotelogix", category: "Cloud PMS" },
  { name: "RMS Cloud", category: "Cloud PMS" },
  { name: "Little Hotelier", category: "Small Hotels" },
  { name: "Apaleo", category: "Open PMS" },
  { name: "StayNTouch", category: "Mobile PMS" },
  { name: "SiteMinder", category: "Channel Manager" },
  { name: "Guestline", category: "Enterprise" },
  { name: "Protel", category: "Enterprise" },
  { name: "WebRezPro", category: "Cloud PMS" },
];

export function IntegrationsSection() {
  return (
    <SectionWrapper id="integrations" dark className="relative noise-overlay overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px]" />

      <div className="relative z-10">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            Integrations
          </span>
          <h2 className="mt-4 font-display text-3xl text-white sm:text-5xl leading-tight">
            Works with <span className="italic">any</span> PMS
          </h2>
          <p className="mt-5 text-base text-white/50 leading-relaxed font-light">
            Seamless two-way integration with the PMS platforms you already use.
            Reservations sync automatically.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {pmsIntegrations.map((pms, i) => (
            <motion.div
              key={pms.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="glass-card flex flex-col items-center justify-center rounded-xl p-5 hover:bg-white/[0.08] hover:border-accent/20 transition-all duration-500 group"
            >
              <div className="h-10 w-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors duration-300">
                <span className="text-xs font-bold text-white/40 group-hover:text-accent transition-colors duration-300">
                  {pms.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-white/80 text-center">
                {pms.name}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-white/30 mt-0.5">
                {pms.category}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/integrations"
            className="group inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-light transition-colors"
          >
            View all integrations
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
