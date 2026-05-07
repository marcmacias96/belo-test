import type { CoinHistoryPoint } from '../types';

const MAX_POINTS = 24;

export function normalizeHistory(rawPrices: [number, number][]): CoinHistoryPoint[] {
  if (rawPrices.length === 0) return [];

  const step = Math.max(1, Math.floor(rawPrices.length / MAX_POINTS));
  const sampled = rawPrices.filter((_, i) => i % step === 0).slice(0, MAX_POINTS);

  return sampled.map(([timestamp, price]) => ({ timestamp, price }));
}
