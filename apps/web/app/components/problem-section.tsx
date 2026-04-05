"use client";

import { SectionWrapper } from "./section-wrapper";
import { Clock, FileText, AlertTriangle, Users } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Long queues at reception",
    description:
      "Guests wait 10-15 minutes to check in after a long journey. First impressions suffer.",
  },
  {
    icon: FileText,
    title: "Manual paperwork",
    description:
      "Registration cards, ID copies, signatures — all handled manually at the front desk.",
  },
  {
    icon: AlertTriangle,
    title: "Data entry errors",
    description:
      "Staff manually typing guest details leads to errors in the PMS, affecting billing and compliance.",
  },
  {
    icon: Users,
    title: "Overwhelmed front desk",
    description:
      "Peak arrival times create bottlenecks. Staff can't focus on hospitality when buried in admin.",
  },
];

export function ProblemSection() {
  return (
    <SectionWrapper className="bg-surface">
      <div className="text-center">
        <span className="text-sm font-medium text-primary uppercase tracking-wider">
          The Problem
        </span>
        <h2 className="mt-3 text-3xl font-bold text-secondary sm:text-4xl">
          Traditional check-in is broken
        </h2>
        <p className="mt-4 text-lg text-muted max-w-2xl mx-auto">
          Long queues, paperwork, and last-minute formalities don&apos;t belong
          in a modern hospitality experience.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {problems.map((problem) => (
          <div
            key={problem.title}
            className="rounded-xl border border-gray-200 bg-white p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
              <problem.icon size={24} className="text-red-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-secondary">
              {problem.title}
            </h3>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              {problem.description}
            </p>
          </div>
        ))}
      </div>
    </SectionWrapper>
  );
}
