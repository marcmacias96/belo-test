import { createPersistedStore, resetPersistedStorage } from '@/src/shared/state/persist';

import type { AssetId } from '@/src/features/wallet/types';
import type { PriceAlert } from '../types';

type PriceAlertsState = {
  alerts: PriceAlert[];
  latestPrices: Partial<Record<AssetId, number>>;
  createAlert: (input: { assetId: AssetId; thresholdPercent: number }) => string;
  removeAlert: (alertId: string) => void;
  setLatestPrice: (assetId: AssetId, price: number) => void;
  initializeReferencePricesForAsset: (assetId: AssetId, price: number) => void;
  updateAlertReferencePrice: (alertId: string, price: number) => void;
  getAlertsByAsset: (assetId: AssetId) => PriceAlert[];
};

const PRICE_ALERTS_PERSIST_KEY = 'price-alerts:v1';

export const usePriceAlertsStore = createPersistedStore<PriceAlertsState>(
  PRICE_ALERTS_PERSIST_KEY,
  (set, get) => ({
    alerts: [],
    latestPrices: {},
    createAlert: ({ assetId, thresholdPercent }) => {
      const now = new Date().toISOString();
      const id = `price-alert-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const latestPrice = get().latestPrices[assetId];
      const alert: PriceAlert = {
        id,
        assetId,
        thresholdPercent,
        referencePrice: latestPrice,
        createdAt: now,
        updatedAt: now,
      };
      set((state) => ({ alerts: [alert, ...state.alerts] }));
      return id;
    },
    removeAlert: (alertId) =>
      set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== alertId),
      })),
    setLatestPrice: (assetId, price) =>
      set((state) => ({
        latestPrices: { ...state.latestPrices, [assetId]: price },
      })),
    initializeReferencePricesForAsset: (assetId, price) =>
      set((state) => ({
        alerts: state.alerts.map((alert) => {
          if (alert.assetId !== assetId || alert.referencePrice !== undefined) {
            return alert;
          }
          return {
            ...alert,
            referencePrice: price,
            updatedAt: new Date().toISOString(),
          };
        }),
      })),
    updateAlertReferencePrice: (alertId, price) =>
      set((state) => ({
        alerts: state.alerts.map((alert) =>
          alert.id === alertId
            ? { ...alert, referencePrice: price, updatedAt: new Date().toISOString() }
            : alert,
        ),
      })),
    getAlertsByAsset: (assetId) => get().alerts.filter((alert) => alert.assetId === assetId),
  }),
);

export function resetPriceAlertsStore() {
  usePriceAlertsStore.setState({ alerts: [], latestPrices: {} });
}

export async function resetPriceAlertsStoreAndStorage() {
  resetPriceAlertsStore();
  await resetPersistedStorage(PRICE_ALERTS_PERSIST_KEY);
}

export type { AssetId };
