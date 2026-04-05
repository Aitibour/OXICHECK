"use client";

import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

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
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Left side - stats */}
        <div className="lg:w-1/3 shrink-0">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            Trusted by Hotels
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
            Hotels <span className="italic">love</span> OxiCheck
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <p className="text-3xl font-semibold text-navy sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted font-medium">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right side - testimonials */}
        <div className="flex-1 space-y-5">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl border border-gray-200/80 bg-white p-7 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-500 relative group"
            >
              <Quote size={20} className="text-accent/30 absolute top-6 right-6" />

              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    className="text-accent fill-accent"
                  />
                ))}
              </div>
              <p className="mt-4 text-sm text-secondary/80 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-navy flex items-center justify-center text-xs font-semibold text-accent">
                  {testimonial.author.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-secondary">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-muted">
                    {testimonial.role}, {testimonial.hotel}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
