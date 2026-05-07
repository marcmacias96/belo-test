import { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle, Separator, Text } from '@/components/ui';

import { formatPrice } from '../lib/formatCoin';
import type { CoinHistoryPoint } from '../types';

type CoinHistoryListProps = {
  points: CoinHistoryPoint[];
};

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

type HistoryRowProps = {
  point: CoinHistoryPoint;
  showSeparator: boolean;
};

const HistoryRow = memo(function HistoryRow({ point, showSeparator }: HistoryRowProps) {
  return (
    <View>
      <View className="flex-row items-center justify-between">
        <Text variant="muted">{formatTimestamp(point.timestamp)}</Text>
        <Text className="font-medium">{formatPrice(point.price)}</Text>
      </View>
      {showSeparator ? <Separator className="mt-2" /> : null}
    </View>
  );
});

export function CoinHistoryList({ points }: CoinHistoryListProps) {
  const keyExtractor = useCallback((item: CoinHistoryPoint) => String(item.timestamp), []);
  const renderItem = useCallback(
    ({ item, index }: { item: CoinHistoryPoint; index: number }) => (
      <HistoryRow point={item} showSeparator={index < points.length - 1} />
    ),
    [points.length],
  );

  if (points.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <Text testID="coin-history-empty" variant="muted">
            No price history available for the last 24h.
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Price History (24h)</CardTitle>
      </CardHeader>
      <CardContent className="gap-2 pb-4" testID="coin-history-list">
        <FlatList
          data={points}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
          removeClippedSubviews={false}
          initialNumToRender={24}
          accessibilityLabel="Price history list"
        />
      </CardContent>
    </Card>
  );
}
