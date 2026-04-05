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
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote:
      "The PMS integration was seamless. It connected to our Opera system in under an hour. Our staff finally has time to focus on guest experience.",
    author: "James Mitchell",
    role: "General Manager",
    hotel: "The Kensington London",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote:
      "ID verification and police reporting handled automatically. What used to take our staff 5 minutes per guest now happens in the background.",
    author: "Laura Rossi",
    role: "Operations Director",
    hotel: "Palazzo Roma Collection",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop&crop=face",
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
    <SectionWrapper className="!py-16 sm:!py-20">
      <div className="flex flex-col lg:flex-row gap-14 lg:gap-20">
        {/* Left side - stats */}
        <div className="lg:w-1/3 shrink-0">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            Trusted by Hotels
          </span>
          <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
            Hotels <span className="italic">love</span> OxiCheck
          </h2>

          <div className="mt-8 grid grid-cols-2 gap-5">
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
        <div className="flex-1 space-y-4">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={testimonial.author}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="rounded-2xl border border-gray-200/80 bg-white p-6 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-500 relative group"
            >
              <Quote size={18} className="text-accent/20 absolute top-5 right-5" />

              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={13}
                    className="text-accent fill-accent"
                  />
                ))}
              </div>
              <p className="text-sm text-secondary/80 leading-relaxed">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-surface"
                />
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
