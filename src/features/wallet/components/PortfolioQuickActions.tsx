import { View } from 'react-native';

import { Button, Text } from '@/components/ui';

type PortfolioQuickActionsProps = {
  onSwapPress: () => void;
};

export function PortfolioQuickActions({
  onSwapPress,
}: PortfolioQuickActionsProps) {
  return (
    <View className="flex-row">
      <Button
        className="flex-1 rounded-xl"
        accessibilityRole="button"
        accessibilityLabel="Go to Swap"
        onPress={onSwapPress}
      >
        <Text className="font-semibold text-primary-foreground">Swap</Text>
      </Button>
    </View>
  );
}
