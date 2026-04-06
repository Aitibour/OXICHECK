"use client";

import { motion } from "framer-motion";
import { Leaf, TreePine, FileX2, Recycle, Droplets, TrendingDown } from "lucide-react";

const stats = [
  { icon: FileX2, value: "100%", label: "Paperless Check-In", desc: "Zero printed forms per guest" },
  { icon: TreePine, value: "12K+", label: "Trees Saved", desc: "Across all OxiCheck properties" },
  { icon: Recycle, value: "2.5M", label: "Pages Eliminated", desc: "Registration cards gone digital" },
  { icon: Droplets, value: "85%", label: "Carbon Reduction", desc: "In check-in process emissions" },
];

export function GreenSection() {
  return (
    <section className="py-10 sm:py-12 bg-gradient-to-br from-emerald-950 via-[#0a1a12] to-[#0e1526] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Left content */}
          <div className="lg:w-1/2">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 mb-4">
              <Leaf size={12} className="text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Eco-Friendly</span>
            </div>

            <h2 className="font-display text-2xl text-white sm:text-3xl leading-tight">
              A <span className="italic text-emerald-400">Green</span> Digital IT Solution
            </h2>
            <p className="mt-3 text-sm text-white/50 leading-relaxed max-w-lg">
              OxiCheck eliminates paper-based registration entirely. No more printed forms, no physical signatures,
              no document photocopies. Every check-in is 100% digital — reducing your property&apos;s environmental
              footprint while saving on operational costs.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="rounded-lg bg-white/5 border border-white/10 p-3"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon size={14} className="text-emerald-400" />
                    <span className="text-lg font-bold text-white">{s.value}</span>
                  </div>
                  <p className="text-[10px] font-semibold text-emerald-400">{s.label}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div className="lg:w-1/2 flex justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              {/* Paper stack being replaced */}
              <div className="relative w-72 h-72">
                {/* Glowing circle */}
                <div className="absolute inset-8 rounded-full bg-emerald-500/10 border border-emerald-500/20" />
                <div className="absolute inset-16 rounded-full bg-emerald-500/15 border border-emerald-500/25" />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-20 w-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                    <Leaf size={36} className="text-emerald-400" />
                  </div>
                </div>

                {/* Floating stats */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 right-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    <TrendingDown size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-white">-85% CO₂</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-4 left-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    <FileX2 size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-white">0 paper</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-12 left-0 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-2"
                >
                  <div className="flex items-center gap-1.5">
                    <TreePine size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-white">12K trees</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
