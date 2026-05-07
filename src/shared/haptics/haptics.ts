import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

const isSupported = Platform.OS === 'ios' || Platform.OS === 'android';

export function impactLight(): void {
  if (!isSupported) return;
  void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Light);
}

export function impactMedium(): void {
  if (!isSupported) return;
  void ExpoHaptics.impactAsync(ExpoHaptics.ImpactFeedbackStyle.Medium);
}

export function notificationSuccess(): void {
  if (!isSupported) return;
  void ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Success);
}

export function notificationError(): void {
  if (!isSupported) return;
  void ExpoHaptics.notificationAsync(ExpoHaptics.NotificationFeedbackType.Error);
}
