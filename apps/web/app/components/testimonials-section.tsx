"use client";

import { SectionWrapper } from "./section-wrapper";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "OxiCheck reduced our check-in time by 70%. Guests love completing everything before they arrive — no more queues at peak times.",
    author: "Maria Santos",
    role: "Front Office Manager",
    hotel: "Grand Hotel Barcelona",
    rating: 5,
  },
  {
    quote:
      "The PMS integration was seamless. It connected to our Opera system in under an hour. Our staff finally has time to focus on guest experience.",
    author: "James Mitchell",
    role: "General Manager",
    hotel: "The Kensington London",
    rating: 5,
  },
  {
    quote:
      "ID verification and police reporting handled automatically. What used to take our staff 5 minutes per guest now happens in the background.",
    author: "Laura Rossi",
    role: "Operations Director",
    hotel: "Palazzo Roma Collection",
    rating: 5,
  },
];

const stats = [
  { value: "70%", label: "Faster check-in" },
  { value: "95%", label: "Guest completion rate" },
  { value: "500+", label: "Hotels worldwide" },
  { value: "2M+", label: "Guest check-ins" },
];

export function TestimonialsSection() {
  return (
    <SectionWrapper>
      <div className="text-center">
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          Trusted by Hotels
        </span>
        <h2 className="mt-3 text-3xl font-bold text-secondary sm:text-4xl">
          Hotels love OxiCheck
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-8 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="text-3xl font-bold text-primary sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.author}
            className="rounded-xl border border-gray-200 bg-white p-6"
          >
            <div className="flex gap-1">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <p className="mt-4 text-sm text-muted leading-relaxed">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-secondary">
                {testimonial.author}
              </p>
              <p className="text-xs text-muted">
                {testimonial.role}, {testimonial.hotel}
              </p>
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
