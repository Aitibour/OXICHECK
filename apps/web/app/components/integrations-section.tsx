"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
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
    <SectionWrapper id="integrations">
      <div className="text-center">
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          Integrations
        </span>
        <h2 className="mt-3 text-3xl font-bold text-secondary sm:text-4xl">
          Works with any PMS
        </h2>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Seamless two-way integration with the PMS platforms you already use.
          Reservations sync automatically.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {pmsIntegrations.map((pms) => (
          <div
            key={pms.name}
            className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-6 hover:border-primary/30 hover:shadow-md transition-all"
          >
            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-bold text-muted">
                {pms.name
                  .split(" ")
                  .map((w) => w[0])
                  .join("")}
              </span>
            </div>
            <p className="mt-3 text-sm font-medium text-secondary text-center">
              {pms.name}
            </p>
            <p className="text-xs text-muted">{pms.category}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/integrations"
          className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          View all integrations
          <ArrowRight size={16} />
        </Link>
      </div>
    </SectionWrapper>
  );
}
