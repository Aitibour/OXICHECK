"use client";

import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";

const problems = [
  {
    title: "Long queues at reception",
    description: "Guests wait 10-15 minutes to check in after a long journey. First impressions suffer.",
    stat: "12 min",
    statLabel: "avg. wait",
    image: "https://images.unsplash.com/photo-1521783988139-89397d761dce?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Manual paperwork",
    description: "Registration cards, ID copies, signatures — all handled manually at the front desk.",
    stat: "5 forms",
    statLabel: "per guest",
    image: "https://images.unsplash.com/photo-1568667256549-094345857637?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Data entry errors",
    description: "Staff manually typing guest details leads to errors in the PMS, affecting billing and compliance.",
    stat: "23%",
    statLabel: "error rate",
    image: "https://images.unsplash.com/photo-1633265486064-086b219458ec?q=80&w=800&auto=format&fit=crop",
  },
  {
    title: "Overwhelmed front desk",
    description: "Peak arrival times create bottlenecks. Staff can't focus on hospitality when buried in admin.",
    stat: "4-6pm",
    statLabel: "bottleneck",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
  },
];

export function ProblemSection() {
  return (
    <SectionWrapper className="!py-16 sm:!py-20 relative overflow-hidden">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
          The Problem
        </span>
        <h2 className="mt-4 font-display text-3xl text-secondary sm:text-4xl leading-tight">
          Traditional check-in is{" "}
          <span className="italic text-red-500">broken</span>
        </h2>
        <p className="mt-4 text-base text-muted leading-relaxed font-light">
          Long queues, paperwork, and last-minute formalities don&apos;t belong
          in a modern hospitality experience.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((problem, i) => (
          <motion.div
            key={problem.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative rounded-2xl overflow-hidden h-64 group cursor-default"
          >
            <img
              src={problem.image}
              alt={problem.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

            <div className="relative z-10 h-full flex flex-col justify-end p-5">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-2xl font-semibold text-white">{problem.stat}</p>
                  <p className="text-[10px] uppercase tracking-wider text-white/50">{problem.statLabel}</p>
                </div>
              </div>
              <h3 className="text-base font-semibold text-white">
                {problem.title}
              </h3>
              <p className="mt-1.5 text-xs text-white/60 leading-relaxed">
                {problem.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}
