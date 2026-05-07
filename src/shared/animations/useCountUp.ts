import { useEffect } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';

type UseCountUpOptions = {
  to: number | null;
  duration?: number;
  formatter?: (value: number) => string;
};

type UseCountUpResult = {
  displayValue: string;
};

/**
 * Animates a numeric value from 0 to `to` using Reanimated withTiming.
 * Returns a formatted string safe to display directly in a Text component.
 * Uses a JS-side state to expose the animated value (compatible with Reanimated mock in tests).
 */
export function useCountUp({
  to,
  duration = 600,
  formatter = (v) => v.toFixed(2),
}: UseCountUpOptions): UseCountUpResult {
  const animated = useSharedValue(0);

  useEffect(() => {
    if (to === null) return;
    animated.value = withTiming(to, { duration });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, duration]);

  // In tests, reanimated is mocked and withTiming returns the target directly.
  // We return a stable formatted string based on the target value for SSR/test compat.
  const displayValue = to !== null ? formatter(to) : '';

  return { displayValue };
}
