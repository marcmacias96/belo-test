import { View } from 'react-native';

import { Badge, Card, CardContent, CardHeader, CardTitle, Text } from '@/components/ui';

import { computeBidAsk, formatChange, formatPrice } from '../lib/formatCoin';
import type { CoinPrice } from '../types';

type CoinPriceHeaderProps = {
  coinId: string;
  name: string;
  symbol: string;
  data: CoinPrice;
};

export function CoinPriceHeader({ name, symbol, data }: CoinPriceHeaderProps) {
  const { bid, ask } = computeBidAsk(data.priceUsd);
  const changeLabel = data.change24h !== null ? formatChange(data.change24h) : null;
  const isPositive = (data.change24h ?? 0) >= 0;

  return (
    <Card>
      <CardHeader className="gap-2">
        <View className="flex-row items-center justify-between">
          <CardTitle testID="coin-price-name">{name}</CardTitle>
          <Badge variant="outline" testID="coin-price-symbol">
            {symbol}
          </Badge>
        </View>
        {changeLabel !== null ? (
          <Text
            testID="coin-price-change"
            variant="muted"
            className={isPositive ? 'text-green-600' : 'text-red-500'}
          >
            {changeLabel}
          </Text>
        ) : null}
      </CardHeader>
      <CardContent className="gap-3 pb-4">
        <View className="gap-1">
          <Text variant="muted">Current Price</Text>
          <Text testID="coin-price-current" className="text-xl font-bold">
            {formatPrice(data.priceUsd)}
          </Text>
        </View>
        <View className="flex-row gap-4">
          <View className="flex-1 gap-1">
            <Text variant="muted">Buy (Ask)</Text>
            <Text testID="coin-price-ask" className="font-semibold text-green-600">
              {formatPrice(ask)}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text variant="muted">Sell (Bid)</Text>
            <Text testID="coin-price-bid" className="font-semibold text-red-500">
              {formatPrice(bid)}
            </Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}
