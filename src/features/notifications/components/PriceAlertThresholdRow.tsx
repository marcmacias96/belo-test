import { useCallback, useMemo } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button, Card, CardContent, Text } from '@/components/ui';
import { ASSET_METADATA } from '@/src/features/wallet/types';

import { usePriceAlertsStore } from '../state/usePriceAlertsStore';
import type { PriceAlert } from '../types';

type PriceAlertThresholdRowProps = {
  alert: PriceAlert;
};

export function PriceAlertThresholdRow({ alert }: PriceAlertThresholdRowProps) {
  const { t } = useTranslation('notifications');
  const removeAlert = usePriceAlertsStore((state) => state.removeAlert);
  const latestPrice = usePriceAlertsStore((state) => state.latestPrices[alert.assetId]);
  const meta = ASSET_METADATA[alert.assetId];

  const baselineText = useMemo(() => {
    if (alert.referencePrice === undefined) {
      return t('priceAlertNoBaseline');
    }
    return `$${alert.referencePrice.toFixed(2)}`;
  }, [alert.referencePrice, t]);

  const latestText = useMemo(() => {
    if (latestPrice === undefined) {
      return t('priceAlertNoLatestPrice');
    }
    return `$${latestPrice.toFixed(2)}`;
  }, [latestPrice, t]);

  const handleDelete = useCallback(() => {
    removeAlert(alert.id);
  }, [alert.id, removeAlert]);

  return (
    <Card>
      <CardContent className="gap-3 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="font-medium">{meta.symbol}</Text>
            <Text variant="muted" className="text-xs">
              {meta.name}
            </Text>
            <Text variant="muted" className="mt-1 text-xs">
              {t('priceAlertBaselineLabel', { value: baselineText })}
            </Text>
            <Text variant="muted" className="text-xs">
              {t('priceAlertLatestLabel', { value: latestText })}
            </Text>
            <Text variant="muted" className="text-xs">
              {t('priceAlertConfiguredThresholdLabel', { value: alert.thresholdPercent.toFixed(1) })}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <Button
            variant="destructive"
            size="sm"
            className="flex-1 self-start"
            onPress={handleDelete}
            testID={`delete-price-alert-button-${alert.id}`}
          >
            <Text className="text-sm font-medium text-white">{t('deletePriceAlert')}</Text>
          </Button>
        </View>
      </CardContent>
    </Card>
  );
}
