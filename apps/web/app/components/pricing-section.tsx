"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { Check, Sparkles, Gift, Building2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "0.50",
    unit: "per arrival",
    description: "For boutique hotels with moderate traffic.",
    limit: "Up to 200 arrivals/month",
    features: [
      "1 property",
      "1 PMS integration",
      "Email notifications",
      "Basic ID verification",
      "Digital registration card",
      "Email support",
    ],
    cta: "Start Free Month",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "0.35",
    unit: "per arrival",
    description: "For growing hotels that want everything.",
    limit: "Up to 1,000 arrivals/month",
    features: [
      "Up to 3 properties",
      "3 PMS integrations",
      "Email + SMS + WhatsApp",
      "Advanced ID verification & OCR",
      "Payment collection & upsells",
      "Analytics dashboard",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Free Month",
    highlighted: true,
  },
  {
    name: "Business",
    price: "0.20",
    unit: "per arrival",
    description: "For established hotels with high volume.",
    limit: "Up to 5,000 arrivals/month",
    features: [
      "Up to 10 properties",
      "Unlimited PMS integrations",
      "All notification channels",
      "Police reporting automation",
      "Multi-property dashboard",
      "API access",
      "Custom workflows",
      "Dedicated support",
    ],
    cta: "Start Free Month",
    highlighted: false,
  },
];

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" className="bg-surface !py-16 sm:!py-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />

      <div className="relative z-10">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            Pricing
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
            Pay only for <span className="italic">arrivals</span>
          </h2>
          <p className="mt-4 text-base text-muted font-light leading-relaxed">
            No fixed monthly fees. Pay per check-in processed. Scale up or down freely.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-4 py-2 text-sm font-medium text-green-700">
            <Gift size={16} />
            First month free for all new clients
          </div>
        </div>

        {/* 3 Pay-as-you-go plans */}
        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`rounded-2xl p-7 relative transition-all duration-500 ${
                plan.highlighted
                  ? "bg-white border-2 border-primary/20 shadow-2xl shadow-primary/10 scale-[1.02]"
                  : "bg-white border border-gray-200/80 hover:shadow-lg hover:shadow-gray-100/80"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-navy">
                  <Sparkles size={12} />
                  Best Value
                </span>
              )}

              <h3 className={`text-sm font-semibold uppercase tracking-wider ${plan.highlighted ? "text-primary" : "text-muted"}`}>
                {plan.name}
              </h3>
              <p className="mt-1 text-sm font-light text-muted">
                {plan.description}
              </p>

              <div className="mt-5 pb-5 border-b border-gray-100">
                <span className="text-4xl font-semibold text-secondary">
                  ${plan.price}
                </span>
                <span className="text-sm text-muted ml-1">
                  {plan.unit}
                </span>
                <p className="mt-1 text-xs text-muted/70">{plan.limit}</p>
              </div>

              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check
                      size={15}
                      className={`mt-0.5 shrink-0 ${plan.highlighted ? "text-primary" : "text-accent"}`}
                    />
                    <span className="text-sm font-light text-muted">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`mt-7 block w-full rounded-full py-3 text-center text-sm font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20"
                    : "border border-gray-200 text-secondary hover:bg-secondary hover:text-white hover:border-secondary"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Enterprise section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 rounded-2xl border border-gray-200/80 bg-white p-8 sm:p-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-navy flex items-center justify-center shrink-0">
                <Building2 size={22} className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-secondary">
                  Enterprise & Hotel Groups
                </h3>
                <p className="mt-1 text-sm text-muted font-light max-w-lg">
                  For hotel chains and groups with 5,000+ arrivals/month or multiple properties.
                  Custom volume pricing, dedicated infrastructure, SLA guarantee, white-label options, and a dedicated account manager.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Unlimited properties", "Volume discounts", "White-label", "SLA guarantee", "API & SDK access", "Custom integrations"].map((tag) => (
                    <span key={tag} className="inline-block rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Link
              href="/contact"
              className="shrink-0 inline-flex items-center justify-center rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white hover:bg-secondary transition-colors shadow-lg shadow-navy/10"
            >
              Contact Sales
            </Link>
          </div>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}
