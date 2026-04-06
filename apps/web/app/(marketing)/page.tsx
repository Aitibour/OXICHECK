import { Hero } from "../components/hero";
import { ProblemSection } from "../components/problem-section";
import { FeaturesSection } from "../components/features-section";
import { HowItWorks } from "../components/how-it-works";
import { IntegrationsSection } from "../components/integrations-section";
import { UpsellROISection } from "../components/upsell-roi-section";
import { GreenSection } from "../components/green-section";
import { ImplementationSection } from "../components/implementation-section";
import { RatingSection } from "../components/rating-section";
import { ProjectsSection } from "../components/projects-section";
import { PricingSection } from "../components/pricing-section";
import { FAQSection } from "../components/faq-section";
import { CTASection } from "../components/cta-section";

export default function MarketingHome() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <IntegrationsSection />
      <UpsellROISection />
      <GreenSection />
      <ImplementationSection />
      <RatingSection />
      <ProjectsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
