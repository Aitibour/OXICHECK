"use client";

import { useState } from "react";
import { SectionWrapper } from "../../components/section-wrapper";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="pt-16">
      <SectionWrapper>
        <div className="text-center">
          <span className="text-sm font-medium text-primary uppercase tracking-wider">
            Contact Us
          </span>
          <h1 className="mt-3 text-3xl font-bold text-secondary sm:text-5xl">
            Request a Demo
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
            See how OxiCheck can transform your guest arrival experience. Book a
            personalized demo with our team.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                  <Send size={28} className="text-green-600" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-secondary">
                  Thank you!
                </h3>
                <p className="mt-2 text-sm text-muted">
                  We&apos;ll get back to you within 24 hours to schedule your
                  demo.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-secondary"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-secondary"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      required
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-secondary"
                  >
                    Work Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="john@hotel.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="hotel"
                    className="block text-sm font-medium text-secondary"
                  >
                    Hotel / Company Name
                  </label>
                  <input
                    type="text"
                    id="hotel"
                    required
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="Grand Hotel"
                  />
                </div>

                <div>
                  <label
                    htmlFor="rooms"
                    className="block text-sm font-medium text-secondary"
                  >
                    Number of Rooms
                  </label>
                  <select
                    id="rooms"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option>1-50</option>
                    <option>51-100</option>
                    <option>101-200</option>
                    <option>201-500</option>
                    <option>500+</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="pms"
                    className="block text-sm font-medium text-secondary"
                  >
                    Current PMS
                  </label>
                  <select
                    id="pms"
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option>Oracle OPERA</option>
                    <option>Mews</option>
                    <option>Cloudbeds</option>
                    <option>Hotelogix</option>
                    <option>RMS Cloud</option>
                    <option>Little Hotelier</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-secondary"
                  >
                    Message (optional)
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    placeholder="Tell us about your needs..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
                >
                  Request Demo
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-secondary">
                Get in Touch
              </h3>
              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-secondary">Email</p>
                    <p className="text-sm text-muted">hello@oxicheck.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-secondary">Phone</p>
                    <p className="text-sm text-muted">+971 55 427 6352</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-secondary">Office</p>
                    <p className="text-sm text-muted">Dubai, UAE</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-secondary">
                What to Expect
              </h3>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-primary font-bold">1.</span>
                  30-minute personalized demo call
                </li>
                <li className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-primary font-bold">2.</span>
                  PMS integration assessment
                </li>
                <li className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-primary font-bold">3.</span>
                  Custom pricing based on your needs
                </li>
                <li className="flex items-start gap-2 text-sm text-muted">
                  <span className="text-primary font-bold">4.</span>
                  14-day free trial setup
                </li>
              </ul>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
