import type { Metadata } from "next";
import { FeaturesSection } from "../../components/features-section";
import { HowItWorks } from "../../components/how-it-works";
import { CTASection } from "../../components/cta-section";

export const metadata: Metadata = {
  title: "Features | OxiCheck",
  description:
    "Explore OxiCheck features: mobile check-in, ID verification, digital registration, PMS integration, payments, compliance, and more.",
};

export default function FeaturesPage() {
  return (
    <div className="pt-16">
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
    </div>
  );
}
