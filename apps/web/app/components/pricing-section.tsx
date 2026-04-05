"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, Building2, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Starter",
    icon: Zap,
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
    color: "primary",
  },
  {
    name: "Professional",
    icon: Crown,
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
    color: "accent",
  },
  {
    name: "Business",
    icon: Rocket,
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
    color: "primary",
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    unit: "volume pricing",
    description: "For hotel chains and groups with 5,000+ arrivals/month.",
    limit: "Unlimited arrivals",
    features: [
      "Unlimited properties",
      "Unlimited PMS integrations",
      "All notification channels",
      "Police reporting automation",
      "Multi-property dashboard",
      "API access & SDK",
      "White-label option",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    highlighted: false,
    color: "navy",
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
        </div>

        {/* Free trial banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 mx-auto max-w-md"
        >
          <div className="relative rounded-2xl bg-gradient-to-r from-accent via-accent-light to-accent overflow-hidden px-6 py-4 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)]" />
            <p className="relative text-navy font-semibold text-sm">
              First month completely free for all new clients
            </p>
            <p className="relative text-navy/60 text-xs mt-0.5">
              No credit card required. Cancel anytime.
            </p>
          </div>
        </motion.div>

        {/* 4 Plans in a row */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`rounded-2xl p-6 relative transition-all duration-500 flex flex-col ${
                plan.highlighted
                  ? "bg-white border-2 border-accent shadow-2xl shadow-accent/15 scale-[1.03] z-10"
                  : "bg-white border border-gray-200/80 hover:shadow-lg hover:shadow-gray-100/80"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[11px] font-bold text-navy uppercase tracking-wider shadow-lg shadow-accent/30">
                    <Crown size={11} />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2.5 mb-4">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                  plan.highlighted ? "bg-accent/15" : plan.color === "navy" ? "bg-navy/10" : "bg-primary/10"
                }`}>
                  <plan.icon size={18} className={
                    plan.highlighted ? "text-accent" : plan.color === "navy" ? "text-navy" : "text-primary"
                  } />
                </div>
                <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">
                  {plan.name}
                </h3>
              </div>

              <p className="text-xs text-muted font-light mb-4">
                {plan.description}
              </p>

              <div className="pb-4 border-b border-gray-100 mb-4">
                {plan.price === "Custom" ? (
                  <span className="text-3xl font-bold text-secondary">Custom</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-secondary">${plan.price}</span>
                    <span className="text-xs text-muted ml-1.5">{plan.unit}</span>
                  </>
                )}
                <p className="text-[10px] text-muted/60 mt-1 uppercase tracking-wider">{plan.limit}</p>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={14} className={`mt-0.5 shrink-0 ${
                      plan.highlighted ? "text-accent" : "text-primary/60"
                    }`} />
                    <span className="text-xs text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`mt-6 flex items-center justify-center gap-2 w-full rounded-full py-3 text-center text-sm font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-accent text-navy hover:bg-accent-light shadow-lg shadow-accent/20"
                    : plan.color === "navy"
                    ? "bg-navy text-white hover:bg-secondary"
                    : "border border-gray-200 text-secondary hover:bg-secondary hover:text-white hover:border-secondary"
                }`}
              >
                {plan.cta}
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
