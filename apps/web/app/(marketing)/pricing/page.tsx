import type { Metadata } from "next";
import { PricingSection } from "../../components/pricing-section";
import { CTASection } from "../../components/cta-section";

export const metadata: Metadata = {
  title: "Pricing | OxiCheck",
  description:
    "Simple, transparent pricing for OxiCheck pre-check-in solution. No setup fees. Start with a 14-day free trial.",
};

export default function PricingPage() {
  return (
    <div className="pt-16">
      <PricingSection />
      <CTASection />
    </div>
  );
}
