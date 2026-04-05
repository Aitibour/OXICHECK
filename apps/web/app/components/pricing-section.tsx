"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { Check } from "lucide-react";

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
    <SectionWrapper id="pricing" className="bg-surface">
      <div className="text-center">
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          Pricing
        </span>
        <h2 className="mt-3 text-3xl font-bold text-secondary sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          No setup fees. No hidden costs. Start with a 14-day free trial.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-2xl border p-8 ${
              plan.highlighted
                ? "border-primary bg-white shadow-xl shadow-primary/10 ring-1 ring-primary/20 relative"
                : "border-gray-200 bg-white"
            }`}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                Most Popular
              </span>
            )}

            <h3 className="text-lg font-semibold text-secondary">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-muted">{plan.description}</p>

            <div className="mt-6">
              {plan.price === "Custom" ? (
                <span className="text-4xl font-bold text-secondary">
                  Custom
                </span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-secondary">
                    ${plan.price}
                  </span>
                  <span className="text-muted">/month</span>
                </>
              )}
            </div>

            <ul className="mt-8 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check
                    size={18}
                    className="text-green-500 mt-0.5 shrink-0"
                  />
                  <span className="text-sm text-muted">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/contact"
              className={`mt-8 block w-full rounded-lg py-3 text-center text-sm font-medium transition-colors ${
                plan.highlighted
                  ? "bg-primary text-white hover:bg-primary-dark"
                  : "border border-gray-200 text-secondary hover:bg-gray-50"
              }`}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
