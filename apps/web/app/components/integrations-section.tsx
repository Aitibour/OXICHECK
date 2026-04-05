"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const pmsIntegrations = [
  { name: "Oracle OPERA", category: "Enterprise", color: "#C74634" },
  { name: "Mews", category: "Cloud PMS", color: "#00B4A0" },
  { name: "Cloudbeds", category: "Cloud PMS", color: "#1E88E5" },
  { name: "Hotelogix", category: "Cloud PMS", color: "#FF6B00" },
  { name: "RMS Cloud", category: "Cloud PMS", color: "#6C5CE7" },
  { name: "Little Hotelier", category: "Small Hotels", color: "#E91E63" },
  { name: "Apaleo", category: "Open PMS", color: "#00BCD4" },
  { name: "StayNTouch", category: "Mobile PMS", color: "#4CAF50" },
  { name: "SiteMinder", category: "Channel Manager", color: "#FF5722" },
  { name: "Guestline", category: "Enterprise", color: "#3F51B5" },
  { name: "Protel", category: "Enterprise", color: "#009688" },
  { name: "WebRezPro", category: "Cloud PMS", color: "#795548" },
];

export function IntegrationsSection() {
  return (
    <SectionWrapper id="integrations" className="!py-16 sm:!py-20 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[150px]" />

      <div className="relative z-10">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            Integrations
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
            Works with <span className="italic">any</span> PMS
          </h2>
          <p className="mt-4 text-base text-muted leading-relaxed font-light">
            Seamless two-way integration with the PMS platforms you already use.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {pmsIntegrations.map((pms, i) => (
            <motion.div
              key={pms.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="flex flex-col items-center justify-center rounded-xl border border-gray-200/80 bg-white p-5 hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-500 group"
            >
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-500"
                style={{ backgroundColor: `${pms.color}12` }}
              >
                <span
                  className="text-sm font-bold transition-colors duration-300"
                  style={{ color: pms.color }}
                >
                  {pms.name.split(" ").map((w) => w[0]).join("")}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium text-secondary text-center">
                {pms.name}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-muted/50 mt-0.5">
                {pms.category}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/integrations"
            className="group inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            View all integrations
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
