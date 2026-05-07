import { View } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle, Text } from '@/components/ui';
import { ASSET_METADATA } from '@/src/features/wallet/types';
import type { AssetId } from '@/src/features/wallet/types';

type SwapPreviewCardProps = {
  fromId: AssetId;
  toId: AssetId;
  fromAmount: number;
  toAmount: number;
  priceIn: number;
  priceOut: number;
};

function formatAmount(amount: number, decimals = 6): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
}

function formatUsd(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SwapPreviewCard({
  fromId,
  toId,
  fromAmount,
  toAmount,
  priceIn,
  priceOut,
}: SwapPreviewCardProps) {
  const fromSymbol = ASSET_METADATA[fromId].symbol;
  const toSymbol = ASSET_METADATA[toId].symbol;
  const valueUsd = fromAmount * priceIn;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preview</CardTitle>
      </CardHeader>
      <CardContent className="gap-2 pb-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground">You receive</Text>
          <Text testID="swap-preview-output-amount" className="font-semibold">
            {formatAmount(toAmount)} {toSymbol}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground">Rate</Text>
          <Text>
            1 {fromSymbol} = {formatAmount(priceIn / priceOut, 6)} {toSymbol}
          </Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground">Value (USD)</Text>
          <Text>{formatUsd(valueUsd)}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-muted-foreground">
            {fromAmount} {fromSymbol}
          </Text>
          <Text className="text-muted-foreground">→</Text>
          <Text>
            {formatAmount(toAmount)} {toSymbol}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
