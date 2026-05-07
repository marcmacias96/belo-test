import { createPersistedStore, resetPersistedStorage } from '@/src/shared/state/persist';

import type { AssetId } from '@/src/features/wallet/types';

export const DEFAULT_THRESHOLD = 0.05;

type PriceAlertsState = {
  thresholds: Record<string, number>;
  priceSnapshots: Record<string, number>;
  setThreshold: (coinId: string, pct: number) => void;
  updateSnapshot: (coinId: string, price: number) => void;
  getThreshold: (coinId: string) => number;
};

const PRICE_ALERTS_PERSIST_KEY = 'price-alerts:v1';

export const usePriceAlertsStore = createPersistedStore<PriceAlertsState>(
  PRICE_ALERTS_PERSIST_KEY,
  (set, get) => ({
    thresholds: {},
    priceSnapshots: {},
    setThreshold: (coinId, pct) =>
      set((state) => ({
        thresholds: { ...state.thresholds, [coinId]: pct },
      })),
    updateSnapshot: (coinId, price) =>
      set((state) => ({
        priceSnapshots: { ...state.priceSnapshots, [coinId]: price },
      })),
    getThreshold: (coinId) => get().thresholds[coinId] ?? DEFAULT_THRESHOLD,
  }),
);

export function resetPriceAlertsStore() {
  usePriceAlertsStore.setState({ thresholds: {}, priceSnapshots: {} });
}

export async function resetPriceAlertsStoreAndStorage() {
  resetPriceAlertsStore();
  await resetPersistedStorage(PRICE_ALERTS_PERSIST_KEY);
}

export type { AssetId };
