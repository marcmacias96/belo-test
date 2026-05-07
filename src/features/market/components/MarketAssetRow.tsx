import { memo, useCallback } from 'react';
import { Pressable, View } from 'react-native';

import { Badge, Button, Card, CardContent, Text } from '@/components/ui';
import { impactLight } from '@/src/shared/haptics/haptics';

import { formatUsd } from '../lib/formatUsd';
import { useMarketPreferencesStore } from '../state/useMarketPreferencesStore';
import type { MarketAsset } from '../types';

type MarketAssetRowProps = {
  asset: MarketAsset;
  onPress?: () => void;
};

export const MarketAssetRow = memo(function MarketAssetRow({ asset, onPress }: MarketAssetRowProps) {
  const isFavorite = useMarketPreferencesStore((state) => Boolean(state.favoriteAssetIds[asset.id]));
  const toggleFavoriteAsset = useMarketPreferencesStore((state) => state.toggleFavoriteAsset);

  const handleToggleFavorite = useCallback(() => {
    impactLight();
    toggleFavoriteAsset(asset.id);
  }, [asset.id, toggleFavoriteAsset]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View details for ${asset.name}`}
      accessibilityHint="Opens coin details screen"
      onPress={onPress}
    >
      <Card>
        <CardContent className="gap-3 p-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="font-semibold text-foreground">
                {asset.name} ({asset.symbol})
              </Text>
              <Text variant="muted">{formatUsd(asset.currentPriceUsd)}</Text>
            </View>
            <Badge variant="outline">{asset.symbol}</Badge>
          </View>
          <Button
            accessibilityRole="button"
            accessibilityLabel={`Toggle ${asset.symbol} favorite`}
            accessibilityState={{ selected: isFavorite }}
            variant={isFavorite ? 'secondary' : 'outline'}
            onPress={handleToggleFavorite}
          >
            <Text className="font-medium">{isFavorite ? '★ Favorite' : '☆ Favorite'}</Text>
          </Button>
        </CardContent>
      </Card>
    </Pressable>
  );
});
