/**
 * Industry benchmark ranges for hotel pre-check-in KPIs.
 * Based on Canadian independent/boutique hotel market data.
 */
export const INDUSTRY_BENCHMARKS = {
  preCheckCompletionRate: { low: 30, median: 45, high: 60, unit: '%' },
  checkInTimeReduction: { low: 2, median: 3, high: 4, unit: 'min' },
  roomUpgradeConversion: { low: 3, median: 5, high: 8, unit: '%' },
  earlyCheckinConversion: { low: 10, median: 15, high: 20, unit: '%' },
  breakfastConversion: { low: 8, median: 12, high: 15, unit: '%' },
  emailOpenRate: { low: 45, median: 55, high: 65, unit: '%' },
  pmsSyncHealth: { low: 98, median: 99, high: 99.9, unit: '%' },
  paymentSuccessRate: { low: 93, median: 96, high: 99, unit: '%' },
} as const;

export type BenchmarkKey = keyof typeof INDUSTRY_BENCHMARKS;

export interface BenchmarkEntry {
  low: number;
  median: number;
  high: number;
  unit: string;
}

export type Benchmarks = Record<BenchmarkKey, BenchmarkEntry>;
