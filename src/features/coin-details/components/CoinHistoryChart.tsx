import { View } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle, Text } from '@/components/ui';

import type { CoinHistoryPoint } from '../types';

type CoinHistoryChartProps = {
  points: CoinHistoryPoint[];
};

const CHART_HEIGHT = 64;

export function CoinHistoryChart({ points }: CoinHistoryChartProps) {
  if (points.length === 0) {
    return null;
  }

  const prices = points.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Price Chart (24h)</CardTitle>
      </CardHeader>
      <CardContent className="pb-4" testID="coin-history-chart">
        <View className="flex-row items-end gap-px" style={{ height: CHART_HEIGHT }}>
          {points.map((point) => {
            const heightPct = (point.price - minPrice) / range;
            const barHeight = Math.max(4, Math.round(heightPct * CHART_HEIGHT));
            return (
              <View
                key={point.timestamp}
                className="flex-1 rounded-sm bg-primary"
                style={{ height: barHeight }}
                accessibilityLabel={`price bar`}
              />
            );
          })}
        </View>
        <View className="mt-1 flex-row justify-between">
          <Text variant="muted" className="text-xs">
            {new Date(points[0]?.timestamp ?? 0).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
          <Text variant="muted" className="text-xs">
            {new Date(points[points.length - 1]?.timestamp ?? 0).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
