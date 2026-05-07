import { View } from 'react-native';

import { Card, CardContent, Input, Text } from '@/components/ui';
import { ASSET_METADATA } from '@/src/features/wallet/types';
import type { AssetId } from '@/src/features/wallet/types';

import { usePriceAlertsStore } from '../state/usePriceAlertsStore';

type PriceAlertThresholdRowProps = {
  assetId: AssetId;
};

export function PriceAlertThresholdRow({ assetId }: PriceAlertThresholdRowProps) {
  const getThreshold = usePriceAlertsStore((state) => state.getThreshold);
  const setThreshold = usePriceAlertsStore((state) => state.setThreshold);
  const threshold = getThreshold(assetId);
  const meta = ASSET_METADATA[assetId];

  return (
    <Card>
      <CardContent className="flex-row items-center gap-3 p-3">
        <View className="flex-1">
          <Text className="font-medium">{meta.symbol}</Text>
          <Text variant="muted" className="text-xs">
            {meta.name}
          </Text>
        </View>
        <View className="w-24">
          <Input
            accessibilityLabel={`Price alert threshold for ${meta.symbol}`}
            value={String(Math.round(threshold * 100))}
            onChangeText={(text) => {
              const pct = parseFloat(text);
              if (!isNaN(pct) && pct > 0 && pct <= 100) {
                setThreshold(assetId, pct / 100);
              }
            }}
            keyboardType="numeric"
            placeholder="5"
          />
        </View>
        <Text variant="muted" className="w-4">
          %
        </Text>
      </CardContent>
    </Card>
  );
}
