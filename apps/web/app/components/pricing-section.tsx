"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Zap, Crown, Rocket, Building2, ArrowRight, Gift } from "lucide-react";

const plans = [
  {
    name: "Starter", icon: Zap, price: "0.50", unit: "/arrival",
    limit: "200 arrivals/mo", desc: "Boutique hotels getting started.",
    features: ["1 property", "1 PMS integration", "Email notifications", "ID verification", "Digital registration", "Email support"],
    cta: "Start Free", highlighted: false,
  },
  {
    name: "Professional", icon: Crown, price: "0.35", unit: "/arrival",
    limit: "1,000 arrivals/mo", desc: "Growing hotels that want everything.",
    features: ["3 properties", "3 PMS integrations", "Email + SMS + WhatsApp", "Advanced ID & OCR", "Payments & upsells", "Analytics + branding", "Priority support"],
    cta: "Start Free", highlighted: true, badges: ["Popular"],
  },
  {
    name: "Business", icon: Rocket, price: "0.20", unit: "/arrival",
    limit: "5,000 arrivals/mo", desc: "High-volume properties — best value.",
    features: ["10 properties", "Unlimited PMS", "All channels", "Police reporting", "Multi-property dashboard", "API access", "Dedicated support"],
    cta: "Start Free", highlighted: false, badges: ["Best Value"],
  },
  {
    name: "Enterprise", icon: Building2, price: "Custom", unit: "",
    limit: "10,000+ arrivals/mo", desc: "Hotel chains & groups.",
    features: ["Unlimited properties", "Unlimited integrations", "White-label", "Account manager", "SLA guarantee", "API & SDK", "Volume discounts"],
    cta: "Contact Sales", highlighted: false,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-6">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">Pricing</span>
          <h2 className="mt-3 font-display text-2xl text-secondary sm:text-3xl">
            Pay only for <span className="italic">arrivals</span>
          </h2>
        </div>

        {/* Free badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-light px-5 py-2 shadow-md shadow-accent/15">
            <Gift size={14} className="text-navy" />
            <span className="text-navy font-bold text-xs">1st month free</span>
            <span className="text-navy/40 text-[10px]">No card required</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`rounded-2xl p-5 flex flex-col relative transition-all duration-300 ${
                plan.highlighted
                  ? "bg-white border-2 border-accent shadow-xl shadow-accent/10 scale-[1.02] z-10"
                  : plan.name === "Business"
                  ? "bg-white border-2 border-primary/20 shadow-xl shadow-primary/10 z-10"
                  : "bg-white border border-gray-200/80 hover:shadow-lg"
              }`}
            >
              {"badges" in plan && plan.badges && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {(plan.badges as string[]).map((badge: string) => (
                    <span key={badge} className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider shadow-md ${
                      badge === "Popular" ? "bg-accent text-navy shadow-accent/20" : "bg-primary text-white shadow-primary/20"
                    }`}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <plan.icon size={14} className={plan.highlighted ? "text-accent" : "text-primary"} />
                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">{plan.name}</h3>
              </div>

              <p className="text-[10px] text-muted mb-3">{plan.desc}</p>

              <div className="mb-2">
                <span className="text-2xl font-bold text-secondary">{plan.price === "Custom" ? "Custom" : `$${plan.price}`}</span>
                <span className="text-[10px] text-muted">{plan.unit}</span>
              </div>

              {/* Limit badge */}
              <div className={`rounded-lg px-3 py-2 mb-3 text-center ${
                plan.highlighted ? "bg-accent/10 border border-accent/20" : "bg-surface border border-gray-100"
              }`}>
                <p className={`text-sm font-bold ${plan.highlighted ? "text-accent" : "text-secondary"}`}>{plan.limit}</p>
              </div>

              <ul className="space-y-1.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Check size={11} className={plan.highlighted ? "text-accent" : "text-primary/40"} />
                    <span className="text-[10px] text-muted">{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/contact"
                className={`mt-4 flex items-center justify-center gap-1 w-full rounded-full py-2.5 text-[11px] font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-accent text-navy hover:bg-accent-light shadow-md shadow-accent/20"
                    : "border border-gray-200 text-secondary hover:bg-secondary hover:text-white hover:border-secondary"
                }`}
              >
                {plan.cta} <ArrowRight size={10} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
