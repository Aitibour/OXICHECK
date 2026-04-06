"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    q: "How long does it take to set up OxiCheck?",
    a: "Most properties go live within 7 days. Our white-glove implementation team handles everything — PMS integration, branding, staff training — so you don't need any technical knowledge.",
  },
  {
    q: "Which PMS systems does OxiCheck integrate with?",
    a: "OxiCheck works with any PMS including Oracle OPERA, Mews, Cloudbeds, Hotelogix, RMS Cloud, Little Hotelier, Apaleo, StayNTouch, SiteMinder, and many more. We also support custom API integrations.",
  },
  {
    q: "Is OxiCheck GDPR compliant?",
    a: "Yes. OxiCheck is fully GDPR compliant with built-in data retention policies, consent management, and automated police reporting for countries that require it (Spain, Italy, Portugal, etc.). Guest ID images are processed in-memory and never stored permanently.",
  },
  {
    q: "How does the upsell feature work?",
    a: "During pre-check-in, guests are presented with personalized upsell offers — room upgrades, early check-in, late checkout, F&B packages, airport transfers. Hotels typically see 15-22% uptake rates, generating significant additional revenue per guest.",
  },
  {
    q: "Do guests need to download an app?",
    a: "No app required. Guests receive a link via email, SMS, or WhatsApp and complete check-in directly in their browser. The experience is mobile-optimized and takes under 4 minutes.",
  },
  {
    q: "What ID verification methods are supported?",
    a: "OxiCheck supports OCR scanning for 5,000+ document types (passports, national IDs, driving licenses) from any country. We also offer facial matching with biometric liveness detection to prevent fraud.",
  },
  {
    q: "Can I customize the guest check-in experience?",
    a: "Absolutely. Customize everything from branding (colors, logo, fonts) to form fields, notification templates, upsell offers, and guest flow. Each property can have its own unique branded experience.",
  },
  {
    q: "What happens if a guest doesn't complete pre-check-in?",
    a: "Automated reminders are sent at configurable intervals (48h, 24h, 2h before arrival). Analytics show exactly where guests drop off so you can optimize. Front desk can still complete check-in on arrival as a fallback.",
  },
  {
    q: "Is there a minimum contract period?",
    a: "No. OxiCheck operates on a pay-per-arrival model with no long-term contracts. Your first month is free, and you can cancel anytime. We believe in earning your business every month.",
  },
  {
    q: "How does OxiCheck reduce paper usage?",
    a: "OxiCheck digitizes the entire check-in process — registration cards, ID copies, signatures, consent forms. Properties using OxiCheck eliminate 100% of check-in paperwork, saving thousands of pages annually.",
  },
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">FAQ</span>
          <h2 className="mt-2 font-display text-2xl text-secondary sm:text-3xl">
            Frequently Asked <span className="italic">Questions</span>
          </h2>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={`rounded-xl border transition-all duration-300 ${
                  isOpen ? "border-accent/30 bg-accent/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircleQuestion size={14} className={isOpen ? "text-accent" : "text-muted"} />
                    <span className={`text-sm font-medium ${isOpen ? "text-secondary" : "text-secondary/80"}`}>{faq.q}</span>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="shrink-0"
                  >
                    <ChevronDown size={14} className={isOpen ? "text-accent" : "text-muted"} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 pl-11 text-xs text-muted leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
