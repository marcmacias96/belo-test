import { memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { Badge, Card, CardContent, Text } from '@/components/ui';

import { formatHolding, formatUsd } from '../lib/formatHolding';
import type { PortfolioAsset } from '../types';

type PortfolioAssetRowProps = {
  asset: PortfolioAsset;
  allocationPct: number | null;
  onPress?: () => void;
};

function formatAllocation(allocationPct: number | null): string {
  if (allocationPct === null || !Number.isFinite(allocationPct)) {
    return '--';
  }

  return `${allocationPct.toFixed(1)}%`;
}

export const PortfolioAssetRow = memo(function PortfolioAssetRow({
  asset,
  allocationPct,
  onPress,
}: PortfolioAssetRowProps) {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`View ${asset.name} details`}
      accessibilityHint="Opens coin details screen"
      onPress={onPress}
      disabled={!onPress}
    >
      <Card className="rounded-2xl">
        <CardContent className="p-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Text className="text-sm font-semibold text-primary">{asset.symbol.slice(0, 1)}</Text>
              </View>
              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-semibold text-foreground">{asset.name}</Text>
                  <Badge variant="outline">{asset.symbol}</Badge>
                </View>
                <Text variant="muted">
                  {asset.valueUsd !== null ? formatUsd(asset.valueUsd) : 'N/A'} •{' '}
                  {formatAllocation(allocationPct)}
                </Text>
                <Text variant="muted">
                  {formatHolding(asset.id, asset.amount)} {asset.symbol}
                </Text>
              </View>
            </View>
            <View className="items-end gap-1">
              {asset.priceUsd !== null ? (
                <Text className="font-medium text-foreground">{formatUsd(asset.priceUsd)}</Text>
              ) : (
                <Text variant="muted">N/A</Text>
              )}
              <Text variant="muted">Price</Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </TouchableOpacity>
  );
});
