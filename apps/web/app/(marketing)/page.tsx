import { Hero } from "../components/hero";
import { ProblemSection } from "../components/problem-section";
import { FeaturesSection } from "../components/features-section";
import { HowItWorks } from "../components/how-it-works";
import { IntegrationsSection } from "../components/integrations-section";
import { TestimonialsSection } from "../components/testimonials-section";
import { ProjectsSection } from "../components/projects-section";
import { PricingSection } from "../components/pricing-section";
import { CTASection } from "../components/cta-section";

export default function MarketingHome() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <FeaturesSection />
      <HowItWorks />
      <IntegrationsSection />
      <TestimonialsSection />
      <ProjectsSection />
      <PricingSection />
      <CTASection />
    </>
  );
}
