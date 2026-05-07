import Animated from 'react-native-reanimated';
import { View } from 'react-native';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Text } from '@/components/ui/text';
import { useFadeIn } from '@/src/shared/animations/useFadeIn';
import { useCountUp } from '@/src/shared/animations/useCountUp';

type PortfolioBalanceCardProps = {
  totalUsd: number | null;
  hasMissingPrices?: boolean;
};

function formatUsdString(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

export function PortfolioBalanceCard({ totalUsd, hasMissingPrices = false }: PortfolioBalanceCardProps) {
  const { animatedStyle } = useFadeIn();
  const { displayValue } = useCountUp({ to: totalUsd, formatter: formatUsdString });

  return (
    <Animated.View style={animatedStyle}>
      <Card className="overflow-hidden rounded-2xl">
        <CardHeader className="gap-3 border-b border-border/60 bg-primary/10 px-5 pb-4 pt-5">
          <View className="flex-row items-center justify-between">
            <CardTitle className="text-lg">Total Balance</CardTitle>
          </View>
          <Text variant="muted">Track your main crypto positions in USD</Text>
        </CardHeader>
        <CardContent className="gap-2 px-5 pb-5 pt-4">
          <Animated.View className="gap-2">
            {totalUsd !== null ? (
              <Text testID="portfolio-total-balance" variant="title" className="text-4xl">
                {displayValue}
              </Text>
            ) : (
              <Text testID="portfolio-total-unavailable" variant="muted">
                N/A
              </Text>
            )}
            {hasMissingPrices && totalUsd !== null ? (
              <Text variant="muted">Some assets use the latest available quote.</Text>
            ) : null}
          </Animated.View>
        </CardContent>
      </Card>
    </Animated.View>
  );
}
