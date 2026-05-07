import Animated from 'react-native-reanimated';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <Animated.View className="gap-1">
            {totalUsd !== null ? (
              <Text testID="portfolio-total-balance" variant="title">
                {displayValue}
              </Text>
            ) : (
              <Text testID="portfolio-total-unavailable" variant="muted">
                N/A
              </Text>
            )}
            {hasMissingPrices && totalUsd !== null ? (
              <Text variant="muted">* Partial — some prices unavailable</Text>
            ) : null}
          </Animated.View>
        </CardContent>
      </Card>
    </Animated.View>
  );
}
