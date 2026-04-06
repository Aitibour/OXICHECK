"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, ArrowRight, Check, Clock, Users, Shield } from "lucide-react";

const benefits = [
  { icon: Clock, title: "30-min Demo", desc: "Personalized walkthrough" },
  { icon: Users, title: "PMS Assessment", desc: "Integration compatibility" },
  { icon: Shield, title: "Free Trial", desc: "1 month, no card required" },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen relative">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1920&auto=format&fit=crop"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/90 to-navy/85" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Get Started</span>
          <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
            Request a <span className="italic text-accent">Demo</span>
          </h1>
          <p className="mt-3 text-sm text-white/50 max-w-lg mx-auto">
            See how OxiCheck can transform your guest arrival experience.
            Our team will walk you through every feature.
          </p>

          {/* Benefit pills */}
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {benefits.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2"
              >
                <b.icon size={12} className="text-accent" />
                <div className="text-left">
                  <p className="text-[10px] font-semibold text-white">{b.title}</p>
                  <p className="text-[8px] text-white/40">{b.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Form + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="mx-auto h-16 w-16 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center mb-4">
                    <Send size={24} className="text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Thank you!</h3>
                  <p className="mt-2 text-sm text-white/50">
                    We&apos;ll get back to you within 24 hours to schedule your demo.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        required
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-colors"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        required
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-colors"
                        placeholder="Doe"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">Work Email</label>
                    <input
                      type="email"
                      id="email"
                      required
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-colors"
                      placeholder="john@hotel.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="hotel" className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">Hotel / Company</label>
                      <input
                        type="text"
                        id="hotel"
                        required
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-colors"
                        placeholder="Grand Hotel"
                      />
                    </div>
                    <div>
                      <label htmlFor="rooms" className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">Number of Rooms</label>
                      <select
                        id="rooms"
                        className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/70 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-colors"
                      >
                        <option className="bg-navy">1-50</option>
                        <option className="bg-navy">51-100</option>
                        <option className="bg-navy">101-200</option>
                        <option className="bg-navy">201-500</option>
                        <option className="bg-navy">500+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pms" className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">Current PMS</label>
                    <select
                      id="pms"
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white/70 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-colors"
                    >
                      <option className="bg-navy">Oracle OPERA</option>
                      <option className="bg-navy">Mews</option>
                      <option className="bg-navy">Cloudbeds</option>
                      <option className="bg-navy">Hotelogix</option>
                      <option className="bg-navy">RMS Cloud</option>
                      <option className="bg-navy">Little Hotelier</option>
                      <option className="bg-navy">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider mb-1">Message (optional)</label>
                    <textarea
                      id="message"
                      rows={3}
                      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-white/20 focus:border-accent focus:ring-1 focus:ring-accent/30 outline-none transition-colors resize-none"
                      placeholder="Tell us about your needs..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="group w-full flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-navy hover:bg-accent-light transition-all duration-300 shadow-lg shadow-accent/20"
                  >
                    Request Demo
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Right side info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-2 space-y-4"
          >
            {/* Contact info */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
              <h3 className="text-sm font-bold text-white mb-4">Get in Touch</h3>
              <div className="space-y-3">
                {[
                  { icon: Mail, label: "Email", value: "hello@oxicheck.com" },
                  { icon: Phone, label: "Phone", value: "+971 55 427 6352" },
                  { icon: MapPin, label: "Office", value: "Dubai, UAE" },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                      <c.icon size={14} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-[9px] text-white/30 uppercase tracking-wider">{c.label}</p>
                      <p className="text-xs text-white/80">{c.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* What to expect */}
            <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5">
              <h3 className="text-sm font-bold text-white mb-3">What to Expect</h3>
              <div className="space-y-2">
                {[
                  "30-minute personalized demo call",
                  "PMS integration assessment",
                  "Custom pricing based on your needs",
                  "1-month free trial setup",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-accent/15 flex items-center justify-center">
                      <Check size={8} className="text-accent" />
                    </div>
                    <span className="text-[10px] text-white/60">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust badge */}
            <div className="rounded-2xl bg-accent/10 border border-accent/20 p-4 text-center">
              <p className="text-2xl font-bold text-accent">500+</p>
              <p className="text-[9px] text-white/40 uppercase tracking-wider">Hotels trust OxiCheck</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
