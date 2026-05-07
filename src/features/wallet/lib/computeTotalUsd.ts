import type { AssetId, Holdings, PriceMap } from '../types';

export type ComputeTotalResult = {
  total: number;
  missingIds: AssetId[];
};

export function computeTotalUsd(holdings: Holdings, prices: PriceMap): ComputeTotalResult {
  let total = 0;
  const missingIds: AssetId[] = [];

  for (const [idStr, amount] of Object.entries(holdings)) {
    const id = idStr as AssetId;
    const price = prices[id];
    if (price !== undefined) {
      total += amount * price;
    } else {
      missingIds.push(id);
    }
  }

  return { total, missingIds };
}
