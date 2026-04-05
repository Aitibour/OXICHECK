"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, Building2, ArrowRight, Gift } from "lucide-react";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "0.50",
    unit: "per arrival",
    description: "For boutique hotels getting started.",
    limit: "200",
    limitLabel: "arrivals / month",
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
    icon: Crown,
    price: "0.35",
    unit: "per arrival",
    description: "For growing hotels that want everything.",
    limit: "1,000",
    limitLabel: "arrivals / month",
    features: [
      "Up to 3 properties",
      "3 PMS integrations",
      "Email + SMS + WhatsApp",
      "Advanced ID & OCR",
      "Payments & upsells",
      "Analytics dashboard",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Free Month",
    highlighted: true,
  },
  {
    name: "Business",
    icon: Rocket,
    price: "0.20",
    unit: "per arrival",
    description: "For high-volume properties.",
    limit: "5,000",
    limitLabel: "arrivals / month",
    features: [
      "Up to 10 properties",
      "Unlimited PMS integrations",
      "All notification channels",
      "Police reporting",
      "Multi-property dashboard",
      "API access",
      "Custom workflows",
      "Dedicated support",
    ],
    cta: "Start Free Month",
    highlighted: false,
  },
  {
    name: "Enterprise",
    icon: Building2,
    price: "Custom",
    unit: "volume pricing",
    description: "For hotel chains & groups.",
    limit: "10,000+",
    limitLabel: "arrivals / month",
    features: [
      "Unlimited properties",
      "Unlimited integrations",
      "All channels",
      "Police automation",
      "Multi-property dashboard",
      "API & SDK access",
      "White-label option",
      "Account manager",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
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
            No fixed monthly fees. Pay per check-in. Scale freely.
          </p>
        </div>

        {/* Free trial banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-8 mx-auto max-w-sm"
        >
          <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-accent to-accent-light px-5 py-3 shadow-lg shadow-accent/20">
            <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
              <Gift size={16} className="text-navy" />
            </div>
            <div>
              <p className="text-navy font-bold text-sm">1st month free</p>
              <p className="text-navy/50 text-[10px]">No credit card required</p>
            </div>
          </div>
        </motion.div>

        {/* 4 Plans */}
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
                  ? "bg-white border-2 border-accent shadow-2xl shadow-accent/10 scale-[1.03] z-10"
                  : "bg-white border border-gray-200/80 hover:shadow-lg hover:shadow-gray-100/80"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent px-3.5 py-1.5 text-[10px] font-bold text-navy uppercase tracking-wider shadow-lg shadow-accent/30">
                    <Crown size={10} />
                    Popular
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  plan.highlighted ? "bg-accent/15" : "bg-primary/10"
                }`}>
                  <plan.icon size={16} className={plan.highlighted ? "text-accent" : "text-primary"} />
                </div>
                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
                  {plan.name}
                </h3>
              </div>

              <p className="text-[11px] text-muted font-light mb-3">{plan.description}</p>

              {/* Price */}
              <div className="pb-3 border-b border-gray-100 mb-3">
                {plan.price === "Custom" ? (
                  <span className="text-2xl font-bold text-secondary">Custom</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-secondary">${plan.price}</span>
                    <span className="text-[10px] text-muted ml-1">{plan.unit}</span>
                  </>
                )}
              </div>

              {/* Arrival limit - prominent */}
              <div className={`rounded-lg px-3 py-2.5 mb-4 ${
                plan.highlighted ? "bg-accent/10 border border-accent/20" : "bg-surface border border-gray-100"
              }`}>
                <p className={`text-lg font-bold ${plan.highlighted ? "text-accent" : "text-secondary"}`}>
                  {plan.limit}
                </p>
                <p className="text-[10px] text-muted uppercase tracking-wider font-medium">
                  {plan.limitLabel}
                </p>
              </div>

              <ul className="space-y-2 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check size={13} className={`mt-0.5 shrink-0 ${
                      plan.highlighted ? "text-accent" : "text-primary/50"
                    }`} />
                    <span className="text-[11px] text-muted">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`mt-5 flex items-center justify-center gap-1.5 w-full rounded-full py-2.5 text-center text-xs font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-accent text-navy hover:bg-accent-light shadow-lg shadow-accent/20"
                    : "border border-gray-200 text-secondary hover:bg-secondary hover:text-white hover:border-secondary"
                }`}
              >
                {plan.cta}
                <ArrowRight size={12} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
