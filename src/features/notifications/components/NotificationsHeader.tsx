import { useCallback } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Badge, Button, Card, CardHeader, CardTitle, Text } from '@/components/ui';
import { impactLight } from '@/src/shared/haptics/haptics';

import { useNotificationsStore } from '../state/useNotificationsStore';

export function NotificationsHeader() {
  const { t } = useTranslation('notifications');
  const notifications = useNotificationsStore((state) => state.notifications);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAllRead = useCallback(() => {
    impactLight();
    markAllRead();
  }, [markAllRead]);

  return (
    <Card>
      <CardHeader className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <CardTitle>{t('title')}</CardTitle>
            {unreadCount > 0 ? (
              <Badge variant="destructive" testID="notifications-unread-badge">
                {String(unreadCount)}
              </Badge>
            ) : null}
          </View>
          {unreadCount > 0 ? (
            <Button
              accessibilityRole="button"
              accessibilityLabel={t('markAllRead')}
              variant="outline"
              onPress={handleMarkAllRead}
              testID="mark-all-read-button"
            >
              <Text className="text-sm font-medium">{t('markAllRead')}</Text>
            </Button>
          ) : null}
        </View>
      </CardHeader>
    </Card>
  );
}
