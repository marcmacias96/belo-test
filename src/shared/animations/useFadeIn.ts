import { useEffect } from 'react';
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

type UseFadeInOptions = {
  duration?: number;
  translateYFrom?: number;
};

/**
 * Returns an animated style that fades in (opacity 0→1) and slides up
 * (translateY from `translateYFrom`→0) on mount using Reanimated withTiming.
 * Apply the returned `animatedStyle` to an `Animated.View` from Reanimated.
 */
export function useFadeIn({ duration = 300, translateYFrom = 8 }: UseFadeInOptions = {}) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(translateYFrom);

  useEffect(() => {
    opacity.value = withTiming(1, { duration });
    translateY.value = withTiming(0, { duration });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return { animatedStyle };
}
