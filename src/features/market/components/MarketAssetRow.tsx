import { View } from 'react-native';

import { Badge, Button, Card, CardContent, Text } from '@/components/ui';

import type { MarketAsset } from '../types';
import { formatUsd } from '../lib/formatUsd';
import { useMarketPreferencesStore } from '../state/useMarketPreferencesStore';

type MarketAssetRowProps = {
  asset: MarketAsset;
};

export function MarketAssetRow({ asset }: MarketAssetRowProps) {
  const isFavorite = useMarketPreferencesStore((state) => Boolean(state.favoriteAssetIds[asset.id]));
  const toggleFavoriteAsset = useMarketPreferencesStore((state) => state.toggleFavoriteAsset);

  return (
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
          variant={isFavorite ? 'secondary' : 'outline'}
          onPress={() => toggleFavoriteAsset(asset.id)}
        >
          <Text className="font-medium">{isFavorite ? '★ Favorite' : '☆ Favorite'}</Text>
        </Button>
      </CardContent>
    </Card>
  );
}
