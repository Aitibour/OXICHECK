"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const pmsIntegrations = [
  {
    name: "Oracle OPERA",
    category: "Enterprise",
    logo: "https://logo.clearbit.com/oracle.com",
  },
  {
    name: "Mews",
    category: "Cloud PMS",
    logo: "https://logo.clearbit.com/mews.com",
  },
  {
    name: "Cloudbeds",
    category: "Cloud PMS",
    logo: "https://logo.clearbit.com/cloudbeds.com",
  },
  {
    name: "Hotelogix",
    category: "Cloud PMS",
    logo: "https://logo.clearbit.com/hotelogix.com",
  },
  {
    name: "RMS Cloud",
    category: "Cloud PMS",
    logo: "https://logo.clearbit.com/rmscloud.com",
  },
  {
    name: "Little Hotelier",
    category: "Small Hotels",
    logo: "https://logo.clearbit.com/littlehotelier.com",
  },
  {
    name: "Apaleo",
    category: "Open PMS",
    logo: "https://logo.clearbit.com/apaleo.com",
  },
  {
    name: "StayNTouch",
    category: "Mobile PMS",
    logo: "https://logo.clearbit.com/stayntouch.com",
  },
  {
    name: "SiteMinder",
    category: "Channel Manager",
    logo: "https://logo.clearbit.com/siteminder.com",
  },
  {
    name: "Guestline",
    category: "Enterprise",
    logo: "https://logo.clearbit.com/guestline.com",
  },
  {
    name: "Protel",
    category: "Enterprise",
    logo: "https://logo.clearbit.com/protel.net",
  },
  {
    name: "WebRezPro",
    category: "Cloud PMS",
    logo: "https://logo.clearbit.com/webrezpro.com",
  },
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
              <div className="h-12 w-12 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={pms.logo}
                  alt={pms.name}
                  className="h-8 w-8 object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = "none";
                    const parent = target.parentElement;
                    if (parent) {
                      parent.classList.add("bg-surface");
                      const span = document.createElement("span");
                      span.className = "text-xs font-bold text-muted/50";
                      span.textContent = pms.name.split(" ").map((w) => w[0]).join("");
                      parent.appendChild(span);
                    }
                  }}
                />
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
