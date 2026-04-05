import type { Metadata } from "next";
import { IntegrationsSection } from "../../components/integrations-section";
import { CTASection } from "../../components/cta-section";
import { SectionWrapper } from "../../components/section-wrapper";
import { ArrowRight, Plug, RefreshCw, Webhook } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Integrations | OxiCheck",
  description:
    "OxiCheck integrates with any PMS — Opera, Mews, Cloudbeds, and more. Two-way sync for reservations, guest data, and check-in status.",
};

const integrationFeatures = [
  {
    icon: Plug,
    title: "Plug & Play Setup",
    description:
      "Connect your PMS in minutes with our guided setup wizard. No developer required for supported platforms.",
  },
  {
    icon: RefreshCw,
    title: "Two-Way Sync",
    description:
      "Reservations flow into OxiCheck automatically. Check-in status, guest data, and preferences sync back to your PMS in real-time.",
  },
  {
    icon: Webhook,
    title: "Webhook API",
    description:
      "For unsupported PMS platforms, use our webhook API to build a custom integration. Full documentation and SDK available.",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="pt-16">
      <SectionWrapper>
        <div className="text-center">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Integrations
          </span>
          <h1 className="mt-3 text-3xl font-bold text-secondary sm:text-5xl">
            Works with your PMS
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            Seamless integration with the property management systems you
            already use. No data migration, no disruption.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {integrationFeatures.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-gray-200 bg-white p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon size={24} className="text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-secondary">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-muted leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <IntegrationsSection />

      <SectionWrapper className="bg-surface">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary sm:text-3xl">
            Don&apos;t see your PMS?
          </h2>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            We&apos;re adding new integrations every month. Contact us and
            we&apos;ll prioritize your PMS.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
          >
            Request Integration
            <ArrowRight size={16} />
          </Link>
        </div>
      </SectionWrapper>

      <CTASection />
    </div>
  );
}
