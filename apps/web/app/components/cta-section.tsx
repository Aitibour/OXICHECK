"use client";

import Link from "next/link";
import { SectionWrapper } from "./section-wrapper";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <SectionWrapper>
      <div className="relative rounded-3xl overflow-hidden">
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=2070&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 to-navy/70" />

        <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-24 text-center">
          <h2 className="font-display text-3xl text-white sm:text-5xl leading-tight">
            Ready to transform your{" "}
            <span className="italic text-accent">guest arrivals?</span>
          </h2>
          <p className="mt-5 text-lg text-white/50 max-w-2xl mx-auto font-light">
            Join 500+ hotels already using OxiCheck. Start your 14-day free trial
            — no credit card required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-navy hover:bg-accent-light transition-all duration-300 shadow-xl shadow-accent/20"
            >
              Request a Demo
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-7 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
