import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

import { formatHolding, formatUsd } from '../lib/formatHolding';
import type { PortfolioAsset } from '../types';

type PortfolioAssetRowProps = {
  asset: PortfolioAsset;
  onPress?: () => void;
};

export const PortfolioAssetRow = memo(function PortfolioAssetRow({ asset, onPress }: PortfolioAssetRowProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`View ${asset.name} details`}
      accessibilityHint="Opens coin details screen"
      onPress={onPress}
      disabled={!onPress}
    >
      <Card>
        <CardContent className="p-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="font-semibold text-foreground">{asset.name}</Text>
              <Text variant="muted">
                {formatHolding(asset.id, asset.amount)} {asset.symbol}
              </Text>
            </View>
            <View className="items-end gap-1">
              {asset.valueUsd !== null ? (
                <Text className="font-medium text-foreground">{formatUsd(asset.valueUsd)}</Text>
              ) : (
                <Text variant="muted">N/A</Text>
              )}
              <Text variant="muted">{asset.symbol}</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
});
