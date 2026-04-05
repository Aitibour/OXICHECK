"use client";

import { SectionWrapper } from "./section-wrapper";
import { motion } from "framer-motion";
import { Clock, FileText, AlertTriangle, Users } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Long queues at reception",
    description:
      "Guests wait 10-15 minutes to check in after a long journey. First impressions suffer.",
    stat: "12 min",
    statLabel: "avg. wait time",
  },
  {
    icon: FileText,
    title: "Manual paperwork",
    description:
      "Registration cards, ID copies, signatures — all handled manually at the front desk.",
    stat: "5 forms",
    statLabel: "per guest",
  },
  {
    icon: AlertTriangle,
    title: "Data entry errors",
    description:
      "Staff manually typing guest details leads to errors in the PMS, affecting billing and compliance.",
    stat: "23%",
    statLabel: "error rate",
  },
  {
    icon: Users,
    title: "Overwhelmed front desk",
    description:
      "Peak arrival times create bottlenecks. Staff can't focus on hospitality when buried in admin.",
    stat: "4-6pm",
    statLabel: "daily bottleneck",
  },
];

export function ProblemSection() {
  return (
    <SectionWrapper dark className="relative noise-overlay overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-red-500/5 blur-[150px]" />

      <div className="relative z-10">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
            The Problem
          </span>
          <h2 className="mt-4 font-display text-3xl text-white sm:text-5xl leading-tight">
            Traditional check-in is{" "}
            <span className="italic text-red-400">broken</span>
          </h2>
          <p className="mt-5 text-lg text-white/50 leading-relaxed font-light">
            Long queues, paperwork, and last-minute formalities don&apos;t belong
            in a modern hospitality experience.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((problem, i) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 hover:bg-white/[0.06] transition-all duration-500 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                  <problem.icon size={20} className="text-red-400" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-red-400">
                    {problem.stat}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-white/30">
                    {problem.statLabel}
                  </p>
                </div>
              </div>
              <h3 className="mt-5 text-base font-semibold text-white">
                {problem.title}
              </h3>
              <p className="mt-2 text-sm text-white/40 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
