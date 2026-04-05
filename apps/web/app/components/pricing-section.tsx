"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "49",
    description: "For small hotels getting started with digital check-in.",
    features: [
      "Up to 50 rooms",
      "1 PMS integration",
      "Email notifications",
      "Basic ID verification",
      "Digital registration card",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Professional",
    price: "149",
    description: "For growing hotels that want the full experience.",
    features: [
      "Up to 200 rooms",
      "3 PMS integrations",
      "Email + SMS + WhatsApp",
      "Advanced ID verification & OCR",
      "Payment collection & upsells",
      "Analytics dashboard",
      "Custom branding",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For hotel chains and large properties.",
    features: [
      "Unlimited rooms & properties",
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
  },
];

export function PricingSection() {
  return (
    <SectionWrapper id="pricing" className="bg-surface relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.03] blur-[100px]" />

      <div className="relative z-10">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            Pricing
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-5xl leading-tight">
            Simple, <span className="italic">transparent</span> pricing
          </h2>
          <p className="mt-5 text-base text-muted font-light leading-relaxed">
            No setup fees. No hidden costs. Start with a 14-day free trial.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`rounded-2xl p-8 relative transition-all duration-500 ${
                plan.highlighted
                  ? "bg-white border-2 border-primary/20 shadow-2xl shadow-primary/10 scale-[1.02]"
                  : "bg-white border border-gray-200/80 hover:shadow-lg hover:shadow-gray-100/80"
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-navy">
                  <Sparkles size={12} />
                  Most Popular
                </span>
              )}

              <h3 className={`text-sm font-semibold uppercase tracking-wider ${plan.highlighted ? "text-primary" : "text-muted"}`}>
                {plan.name}
              </h3>
              <p className="mt-1.5 text-sm font-light text-muted">
                {plan.description}
              </p>

              <div className="mt-6 pb-6 border-b border-gray-100">
                {plan.price === "Custom" ? (
                  <span className="text-4xl font-semibold text-secondary">
                    Custom
                  </span>
                ) : (
                  <>
                    <span className="text-4xl font-semibold text-secondary">
                      ${plan.price}
                    </span>
                    <span className="text-sm text-muted">
                      /month
                    </span>
                  </>
                )}
              </div>

              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      size={16}
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
                className={`mt-8 block w-full rounded-full py-3.5 text-center text-sm font-semibold transition-all duration-300 ${
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
      </div>
    </SectionWrapper>
  );
}
