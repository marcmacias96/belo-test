import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { fetchPortfolioPrices } from '@/src/features/wallet/services/fetchPortfolioPrices';
import { ASSET_METADATA } from '@/src/features/wallet/types';
import type { AssetId } from '@/src/features/wallet/types';
import { useToast } from '@/src/shared/hooks/useToast';
import i18next from '@/src/i18n';

import { computePriceDelta } from '../lib/computePriceDelta';
import { useNotificationsStore } from '../state/useNotificationsStore';
import { usePriceAlertsStore } from '../state/usePriceAlertsStore';

export function usePriceAlertWatcher() {
  const add = useNotificationsStore((state) => state.add);
  const { success } = useToast();
  const getAlertsByAsset = usePriceAlertsStore((state) => state.getAlertsByAsset);
  const setLatestPrice = usePriceAlertsStore((state) => state.setLatestPrice);
  const initializeReferencePricesForAsset = usePriceAlertsStore((state) => state.initializeReferencePricesForAsset);
  const updateAlertReferencePrice = usePriceAlertsStore((state) => state.updateAlertReferencePrice);

  // Track last processed data reference to avoid double-firing on the same fetch result
  const lastProcessedDataRef = useRef<unknown>(null);

  const isTest = process.env.NODE_ENV === 'test';

  const { data } = useQuery({
    queryKey: ['price-alert-watcher'],
    queryFn: ({ signal }) => fetchPortfolioPrices(signal),
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
      if (currentPrice === undefined || currentPrice <= 0) continue;

      setLatestPrice(assetId, currentPrice);
      initializeReferencePricesForAsset(assetId, currentPrice);

      const alerts = getAlertsByAsset(assetId);
      for (const alert of alerts) {
        if (alert.referencePrice === undefined || alert.referencePrice <= 0) {
          continue;
        }

        const delta = computePriceDelta(currentPrice, alert.referencePrice);
        const thresholdRatio = alert.thresholdPercent / 100;

        if (Math.abs(delta) >= thresholdRatio) {
          const meta = ASSET_METADATA[assetId as keyof typeof ASSET_METADATA];
          const symbol = meta?.symbol ?? assetId.toUpperCase();

          add({
            kind: 'price',
            createdAt: new Date().toISOString(),
            payload: {
              alertId: alert.id,
              assetId,
              symbol,
              deltaPercent: delta * 100,
              thresholdPercent: alert.thresholdPercent,
            },
          });

          success(
            i18next.t('notifications:priceAlertTitle', { symbol }),
            i18next.t('notifications:priceAlertBody', {
              symbol,
              delta: (delta * 100).toFixed(1),
              threshold: alert.thresholdPercent.toFixed(1),
            }),
          );

          // Move baseline to current price to avoid duplicate alerts.
          updateAlertReferencePrice(alert.id, currentPrice);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
}
