import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { Button, Text } from '@/components/ui';
import { impactMedium } from '@/src/shared/haptics/haptics';

type SwapConfirmButtonProps = {
  disabled: boolean;
  onPress: () => void;
};

export function SwapConfirmButton({ disabled, onPress }: SwapConfirmButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  function handlePress() {
    if (disabled) return;
    impactMedium();
    scale.value = withSpring(0.95, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    });
    onPress();
  }

  return (
    <Animated.View style={animatedStyle}>
      <Button
        accessibilityRole="button"
        accessibilityLabel="Confirm Swap"
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={handlePress}
      >
        <Text className="font-medium text-primary-foreground">Confirm Swap</Text>
      </Button>
    </Animated.View>
  );
}
