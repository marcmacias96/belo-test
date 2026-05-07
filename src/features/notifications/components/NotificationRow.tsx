import { memo } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Badge, Card, CardContent, Text } from '@/components/ui';
import { useFadeIn } from '@/src/shared/animations/useFadeIn';

import { formatNotificationBody, formatNotificationTitle, formatRelativeTime } from '../lib/formatNotification';
import type { Notification } from '../types';

type NotificationRowProps = {
  notification: Notification;
};

export const NotificationRow = memo(function NotificationRow({ notification }: NotificationRowProps) {
  const title = formatNotificationTitle(notification);
  const body = formatNotificationBody(notification);
  const time = formatRelativeTime(notification.createdAt);
  const isUnread = !notification.read;
  const { animatedStyle } = useFadeIn({ duration: 250 });

  return (
    <Animated.View style={animatedStyle}>
      <Card testID={`notification-row-${notification.id}`}>
        <CardContent className="p-4">
          <View className="flex-row items-start gap-3">
            <View className="mt-0.5">
              <Badge
                variant={notification.kind === 'transaction' ? 'default' : 'secondary'}
                testID={`notification-kind-badge-${notification.id}`}
              >
                {notification.kind === 'transaction' ? 'TX' : 'Price'}
              </Badge>
            </View>
            <View className="flex-1 gap-1">
              <View className="flex-row items-center gap-2">
                <Text className={`flex-1 font-semibold ${isUnread ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {title}
                </Text>
                {isUnread ? (
                  <View
                    testID={`notification-unread-dot-${notification.id}`}
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                ) : null}
              </View>
              <Text variant="muted" className="text-sm">
                {body}
              </Text>
              <Text variant="muted" className="text-xs">
                {time}
              </Text>
            </View>
          </View>
        </CardContent>
      </Card>
    </Animated.View>
  );
});
