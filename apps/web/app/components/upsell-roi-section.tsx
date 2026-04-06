"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Calculator, Coffee, Bed, Car, Sparkles, Gift, Utensils } from "lucide-react";

const upsellTypes = [
  { icon: Bed, name: "Room Upgrades", avgPrice: 45, uptakeRate: 22 },
  { icon: Coffee, name: "Early Check-in", avgPrice: 25, uptakeRate: 18 },
  { icon: Sparkles, name: "Late Checkout", avgPrice: 30, uptakeRate: 15 },
  { icon: Car, name: "Airport Transfer", avgPrice: 55, uptakeRate: 8 },
  { icon: Utensils, name: "F&B Packages", avgPrice: 35, uptakeRate: 12 },
  { icon: Gift, name: "Welcome Packs", avgPrice: 20, uptakeRate: 10 },
];

export function UpsellROISection() {
  const [arrivals, setArrivals] = useState(500);
  const [avgRate, setAvgRate] = useState(120);
  const [activeUpsells, setActiveUpsells] = useState<number[]>([0, 1, 2]);

  const toggleUpsell = useCallback((idx: number) => {
    setActiveUpsells(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  }, []);

  // Calculate ROI
  const monthlyUpsellRevenue = activeUpsells.reduce((total, idx) => {
    const u = upsellTypes[idx]!;
    return total + (arrivals * (u.uptakeRate / 100) * u.avgPrice);
  }, 0);

  const annualUpsellRevenue = monthlyUpsellRevenue * 12;
  const revenuePerGuest = arrivals > 0 ? monthlyUpsellRevenue / arrivals : 0;
  const revenueIncrease = avgRate > 0 ? (revenuePerGuest / avgRate) * 100 : 0;

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-surface">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="text-[10px] font-semibold text-accent uppercase tracking-[0.2em]">Upsell Engine</span>
          <h2 className="mt-2 font-display text-2xl text-secondary sm:text-3xl">
            Upsell ROI <span className="italic text-accent">Calculator</span>
          </h2>
          <p className="mt-2 text-xs text-muted max-w-xl mx-auto">
            See how much additional revenue OxiCheck upsells can generate for your property. Upsell is the #1 ROI driver.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Inputs */}
          <div className="lg:col-span-2 space-y-5">
            {/* Arrivals slider */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Monthly Arrivals</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={5000}
                  step={50}
                  value={arrivals}
                  onChange={e => setArrivals(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 accent-accent cursor-pointer"
                />
                <span className="text-lg font-bold text-navy w-16 text-right">{arrivals.toLocaleString()}</span>
              </div>
            </div>

            {/* Avg rate slider */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Avg. Nightly Rate ($)</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="range"
                  min={50}
                  max={500}
                  step={10}
                  value={avgRate}
                  onChange={e => setAvgRate(Number(e.target.value))}
                  className="flex-1 h-1.5 rounded-full appearance-none bg-gray-200 accent-accent cursor-pointer"
                />
                <span className="text-lg font-bold text-navy w-16 text-right">${avgRate}</span>
              </div>
            </div>

            {/* Upsell type toggles */}
            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <label className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-3 block">Active Upsell Offers</label>
              <div className="grid grid-cols-2 gap-2">
                {upsellTypes.map((u, i) => {
                  const isActive = activeUpsells.includes(i);
                  return (
                    <button
                      key={u.name}
                      onClick={() => toggleUpsell(i)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? "bg-accent/10 border border-accent/30"
                          : "bg-gray-50 border border-gray-100 hover:bg-gray-100"
                      }`}
                    >
                      <u.icon size={14} className={isActive ? "text-accent" : "text-muted"} />
                      <div>
                        <p className={`text-[10px] font-semibold ${isActive ? "text-accent" : "text-secondary/70"}`}>{u.name}</p>
                        <p className="text-[8px] text-muted">${u.avgPrice} avg · {u.uptakeRate}% uptake</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Results */}
          <div className="lg:col-span-3">
            <div className="rounded-2xl bg-navy p-6 h-full">
              <div className="flex items-center gap-2 mb-5">
                <Calculator size={16} className="text-accent" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Your Upsell Revenue Projection</h3>
              </div>

              {/* Big numbers */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.div
                  key={monthlyUpsellRevenue}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="rounded-xl bg-white/5 border border-white/10 p-4"
                >
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-accent mt-1">${monthlyUpsellRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp size={10} className="text-green-400" />
                    <span className="text-[10px] text-green-400">Additional income</span>
                  </div>
                </motion.div>
                <motion.div
                  key={annualUpsellRevenue}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="rounded-xl bg-white/5 border border-white/10 p-4"
                >
                  <p className="text-[10px] text-white/40 uppercase tracking-wider">Annual Revenue</p>
                  <p className="text-3xl font-bold text-white mt-1">${annualUpsellRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <DollarSign size={10} className="text-accent" />
                    <span className="text-[10px] text-accent">Projected yearly</span>
                  </div>
                </motion.div>
              </div>

              {/* Per-guest breakdown */}
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Revenue Per Guest</p>
                    <p className="text-xl font-bold text-white mt-0.5">${revenuePerGuest.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase tracking-wider">Rate Increase</p>
                    <p className="text-xl font-bold text-green-400 mt-0.5">+{revenueIncrease.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              {/* Per upsell breakdown */}
              <div className="space-y-2">
                <p className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">Breakdown by Offer</p>
                {activeUpsells.map(idx => {
                  const u = upsellTypes[idx]!;
                  const rev = arrivals * (u.uptakeRate / 100) * u.avgPrice;
                  const pct = monthlyUpsellRevenue > 0 ? (rev / monthlyUpsellRevenue) * 100 : 0;
                  return (
                    <div key={u.name} className="flex items-center gap-3">
                      <u.icon size={12} className="text-accent shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] text-white/70">{u.name}</span>
                          <span className="text-[10px] font-semibold text-white">${rev.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="h-full rounded-full bg-accent"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
                {activeUpsells.length === 0 && (
                  <p className="text-[10px] text-white/30 italic">Select upsell offers to see projections</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
