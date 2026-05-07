/**
 * Computes the relative price delta as a decimal.
 * Returns (current - snapshot) / snapshot.
 */
export function computePriceDelta(current: number, snapshot: number): number {
  if (snapshot === 0) return 0;
  return (current - snapshot) / snapshot;
}
