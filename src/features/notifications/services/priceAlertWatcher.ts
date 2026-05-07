import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { fetchPortfolioPrices } from '@/src/features/wallet/services/fetchPortfolioPrices';
import { ASSET_METADATA } from '@/src/features/wallet/types';
import type { AssetId } from '@/src/features/wallet/types';

import { computePriceDelta } from '../lib/computePriceDelta';
import { useNotificationsStore } from '../state/useNotificationsStore';
import { DEFAULT_THRESHOLD, usePriceAlertsStore } from '../state/usePriceAlertsStore';

export function usePriceAlertWatcher() {
  const add = useNotificationsStore((state) => state.add);
  const priceSnapshots = usePriceAlertsStore((state) => state.priceSnapshots);
  const updateSnapshot = usePriceAlertsStore((state) => state.updateSnapshot);
  const getThreshold = usePriceAlertsStore((state) => state.getThreshold);

  // Track last processed data reference to avoid double-firing on the same fetch result
  const lastProcessedDataRef = useRef<unknown>(null);

  const isTest = process.env.NODE_ENV === 'test';

  const { data } = useQuery({
    queryKey: ['price-alert-watcher'],
    queryFn: fetchPortfolioPrices,
    // Disable polling interval in test environment to prevent timer leaks.
    refetchInterval: isTest ? false : 60_000,
    refetchIntervalInBackground: false,
    retry: false,
    gcTime: 0,
  });

  useEffect(() => {
    if (!data) return;
    // Skip if we already processed this exact data reference (React strict-mode double-invoke guard)
    if (data === lastProcessedDataRef.current) return;
    lastProcessedDataRef.current = data;

    const assetIds = Object.keys(data) as AssetId[];
    for (const assetId of assetIds) {
      const currentPrice = data[assetId];
      if (currentPrice === undefined) continue;

      const snapshot = priceSnapshots[assetId];

      if (snapshot === undefined) {
        updateSnapshot(assetId, currentPrice);
        continue;
      }

      const delta = computePriceDelta(currentPrice, snapshot);
      const threshold = getThreshold(assetId) ?? DEFAULT_THRESHOLD;

      if (Math.abs(delta) >= threshold) {
        const meta = ASSET_METADATA[assetId as keyof typeof ASSET_METADATA];
        const symbol = meta?.symbol ?? assetId.toUpperCase();

        add({
          kind: 'price',
          createdAt: new Date().toISOString(),
          payload: {
            assetId,
            symbol,
            deltaPercent: delta * 100,
            threshold: threshold * 100,
          },
        });

        // Update snapshot so next cycle measures from the new price,
        // preventing consecutive alerts for the same oscillation.
        updateSnapshot(assetId, currentPrice);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
}
