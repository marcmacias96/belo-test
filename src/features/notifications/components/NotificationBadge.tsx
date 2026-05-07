import { View } from 'react-native';

import { Text } from '@/components/ui';

type NotificationBadgeProps = {
  count: number;
};

export function NotificationBadge({ count }: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <View
      testID="notification-badge"
      className="absolute right-0 top-0 h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1"
      pointerEvents="none"
    >
      <Text className="text-[10px] font-bold text-destructive-foreground">
        {count > 99 ? '99+' : String(count)}
      </Text>
    </View>
  );
}
