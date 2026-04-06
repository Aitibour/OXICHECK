"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, TrendingUp, Award, ThumbsUp } from "lucide-react";

function AnimatedRating({ target, delay = 0 }: { target: number; delay?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started.current) {
          started.current = true;
          setTimeout(() => {
            const dur = 1500;
            const steps = 40;
            const inc = target / steps;
            let cur = 0;
            const timer = setInterval(() => {
              cur += inc;
              if (cur >= target) { setValue(target); clearInterval(timer); }
              else setValue(Math.round(cur * 10) / 10);
            }, dur / steps);
          }, delay);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, delay]);

  return <span ref={ref}>{value.toFixed(1)}</span>;
}

const ratings = [
  { category: "Check-In Experience", before: 3.5, after: 4.8, improvement: 1.3, icon: Star },
  { category: "Staff Efficiency", before: 4.0, after: 4.7, improvement: 0.7, icon: ThumbsUp },
  { category: "Overall Rating", before: 3.8, after: 4.6, improvement: 0.8, icon: Award },
];

function StarRow({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={10}
          className={i < Math.round(rating) ? "text-accent fill-accent" : "text-gray-300"}
        />
      ))}
    </div>
  );
}

export function RatingSection() {
  return (
    <section className="py-12 sm:py-16 bg-[#0e1526]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Rating Improvement</span>
          <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">
            Boost Your Hotel Rating by Up to <span className="text-accent italic">1.0</span><Star size={20} className="inline text-accent fill-accent -mt-1 ml-0.5" />
          </h2>
          <p className="mt-2 text-xs text-white/40 max-w-lg mx-auto">
            Higher ratings mean more bookings, better visibility, and premium pricing power
          </p>
        </div>

        {/* Rating cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {ratings.map((r, i) => (
            <motion.div
              key={r.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/8 transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <r.icon size={16} className="text-accent" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{r.category}</h3>
              </div>

              {/* Before */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-white/30 uppercase tracking-wider font-medium">Before</span>
                  <span className="text-sm font-semibold text-white/40">{r.before.toFixed(1)}<Star size={9} className="inline text-white/30 fill-white/30 -mt-0.5 ml-0.5" /></span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(r.before / 5) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: i * 0.15 }}
                    className="h-full rounded-full bg-white/20"
                  />
                </div>
                <div className="mt-1"><StarRow rating={r.before} /></div>
              </div>

              {/* After */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-accent uppercase tracking-wider font-medium">After</span>
                  <span className="text-sm font-bold text-accent">{r.after.toFixed(1)}<Star size={9} className="inline text-accent fill-accent -mt-0.5 ml-0.5" /></span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(r.after / 5) * 100}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, delay: i * 0.15 + 0.3 }}
                    className="h-full rounded-full bg-accent"
                  />
                </div>
                <div className="mt-1"><StarRow rating={r.after} /></div>
              </div>

              {/* Improvement badge */}
              <div className="rounded-lg bg-accent/10 border border-accent/20 p-2.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <TrendingUp size={14} className="text-accent" />
                  <span className="text-xl font-bold text-accent">+<AnimatedRating target={r.improvement} delay={i * 200} /></span>
                  <Star size={14} className="text-accent fill-accent" />
                </div>
                <p className="text-[9px] text-white/40 mt-0.5 uppercase tracking-wider">Improvement</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
