"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const pms = [
  { name: "Oracle OPERA", color: "#C74634" },
  { name: "Mews", color: "#00B4A0" },
  { name: "Cloudbeds", color: "#1E88E5" },
  { name: "Hotelogix", color: "#FF6B00" },
  { name: "RMS Cloud", color: "#6C5CE7" },
  { name: "Little Hotelier", color: "#E91E63" },
  { name: "Apaleo", color: "#00BCD4" },
  { name: "StayNTouch", color: "#4CAF50" },
  { name: "SiteMinder", color: "#FF5722" },
  { name: "Guestline", color: "#3F51B5" },
  { name: "Protel", color: "#009688" },
  { name: "WebRezPro", color: "#795548" },
];

export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-10 sm:py-12 bg-[#0e1526]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Integrations</span>
            <h2 className="mt-2 font-display text-xl text-white sm:text-2xl">
              Works with <span className="italic text-accent">any</span> PMS
            </h2>
          </div>
          <Link href="/integrations" className="group inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-light transition-colors">
            View all <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {pms.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-default"
            >
              <div className="h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white" style={{ backgroundColor: p.color }}>
                {p.name.split(" ").map(w => w[0]).join("")}
              </div>
              <span className="text-xs font-medium text-white/80">{p.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
