"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <SectionWrapper>
      <div className="rounded-2xl bg-gradient-to-r from-primary to-blue-700 p-12 sm:p-16 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to transform your guest arrivals?
        </h2>
        <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
          Join 500+ hotels already using OxiCheck. Start your 14-day free trial
          — no credit card required.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-primary hover:bg-blue-50 transition-colors"
          >
            Request a Demo
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-lg border border-white/30 px-6 py-3 text-base font-medium text-white hover:bg-white/10 transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </div>
    </SectionWrapper>
  );
}
