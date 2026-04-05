"use client";

import { useState, useEffect, useRef } from "react";
import { SectionWrapper } from "./section-wrapper";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "OxiCheck reduced our check-in time by 70%. Guests love completing everything before they arrive — no more queues at peak times.",
    author: "Amira Bensalem",
    role: "Front Office Manager",
    hotel: "Royal Thalassa Monastir",
    country: "Tunisia",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "The PMS integration was seamless. It connected to our Opera system in under an hour. Our staff finally has time to focus on guest experience.",
    author: "Karim Medjdoub",
    role: "General Manager",
    hotel: "Sofitel Algiers Hamma Garden",
    country: "Algeria",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "ID verification and police reporting handled automatically. What used to take our staff 5 minutes per guest now happens in the background.",
    author: "Fatima Zahra El Idrissi",
    role: "Operations Director",
    hotel: "La Mamounia Marrakech",
    country: "Morocco",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "We saw a 95% completion rate in the first month. Guests appreciate the convenience, and our team loves the reduced workload at check-in.",
    author: "Sophie Durand",
    role: "Revenue Manager",
    hotel: "Le Meurice Paris",
    country: "France",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "The multi-language support was a game-changer for our international clientele. Setup took less than a day for our entire property group.",
    author: "Marc-André Tremblay",
    role: "VP Operations",
    hotel: "Fairmont Le Château Frontenac",
    country: "Canada",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "OxiCheck pays for itself within the first week. The upsell feature alone generated $12K in additional revenue last quarter.",
    author: "Rachel Thompson",
    role: "Director of Guest Services",
    hotel: "The Ritz-Carlton New York",
    country: "USA",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "Our guests in Marrakech come from all over the world. OxiCheck handles every nationality, every document type, flawlessly.",
    author: "Youssef Bennani",
    role: "Hotel Manager",
    hotel: "Riad Fès Relais & Châteaux",
    country: "Morocco",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "We integrated OxiCheck across 12 properties in Spain. The consistency and reliability has been remarkable from day one.",
    author: "Carlos Fernández",
    role: "CTO",
    hotel: "Meliá Hotels International",
    country: "Spain",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "The analytics dashboard gives us insights we never had before. We reduced our check-in drop-off rate from 18% to under 5%.",
    author: "Nadia Boudiaf",
    role: "Quality Assurance Manager",
    hotel: "Sheraton Club des Pins",
    country: "Algeria",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop&crop=face",
  },
  {
    quote: "GDPR compliance was our biggest concern. OxiCheck handles everything — data retention, consent, deletion. Peace of mind for our legal team.",
    author: "Olfa Makhlouf",
    role: "Compliance Officer",
    hotel: "Four Seasons Tunis",
    country: "Tunisia",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop&crop=face",
  },
];

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { value: 70, suffix: "%", label: "Faster check-in" },
  { value: 95, suffix: "%", label: "Guest completion rate" },
  { value: 500, suffix: "+", label: "Hotels worldwide" },
  { value: 2, suffix: "M+", label: "Guest check-ins" },
];

export function TestimonialsSection() {
  const [page, setPage] = useState(0);
  const perPage = 3;
  const totalPages = Math.ceil(testimonials.length / perPage);

  useEffect(() => {
    const interval = setInterval(() => {
      setPage((p) => (p + 1) % totalPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [totalPages]);

  const visible = testimonials.slice(page * perPage, page * perPage + perPage);

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
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-semibold text-navy sm:text-4xl">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-muted font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Page dots */}
          <div className="mt-8 flex gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === page ? "w-8 bg-accent" : "w-1.5 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Right side - testimonials with fade */}
        <div className="flex-1 relative min-h-[420px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {visible.map((testimonial) => (
                <div
                  key={testimonial.author}
                  className="rounded-2xl border border-gray-200/80 bg-white p-6 hover:shadow-lg hover:shadow-gray-100/80 transition-all duration-500 relative group"
                >
                  <Quote size={18} className="text-accent/20 absolute top-5 right-5" />

                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13} className="text-accent fill-accent" />
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
                      <p className="text-[10px] text-accent font-medium uppercase tracking-wider">
                        {testimonial.country}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
}
