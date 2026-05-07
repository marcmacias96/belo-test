import { Ionicons } from '@expo/vector-icons';
import { NavigationContext } from '@react-navigation/native';
import { useCallback, useContext } from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, CardHeader, CardTitle, Separator, Text } from '@/components/ui';
import { ScreenBackHeader } from '@/src/app';
import { useTheme } from '@/src/app/providers/ThemeProvider';

import {
  NotificationEmptyState,
  NotificationRow,
  NotificationsHeader,
} from '../components';
import { useNotificationsStore } from '../state/useNotificationsStore';
import type { Notification } from '../types';

export function NotificationsScreen() {
  const { t } = useTranslation('notifications');
  const { effectiveMode } = useTheme();
  const navigation = useContext(NavigationContext);
  const notifications = useNotificationsStore((state) => state.notifications);
  const trailingIconColor = effectiveMode === 'dark' ? '#94a3b8' : '#64748b';

  const keyExtractor = useCallback((item: Notification) => item.id, []);
  const renderItem = useCallback(
    ({ item }: { item: Notification }) => <NotificationRow notification={item} />,
    [],
  );
  const ItemSeparatorComponent = useCallback(() => <View className="h-3" />, []);

  const handleBackPress = useCallback(() => {
    if (!navigation) {
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home' as never);
  }, [navigation]);

  const handleOpenPriceAlerts = useCallback(() => {
    if (!navigation) {
      return;
    }

    navigation.navigate('PriceAlerts' as never);
  }, [navigation]);

  const ListHeaderComponent = useCallback(
    () => (
      <View className="gap-4 pb-3 pt-4">
        <ScreenBackHeader
          title={t('title')}
          onBackPress={handleBackPress}
          canGoBack={navigation !== null}
        />
        <NotificationsHeader />

        <Card className="border-primary/15">
          <CardHeader className="gap-3">
            <CardTitle className="text-base">{t('priceAlertsShortcutTitle')}</CardTitle>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('managePriceAlerts')}
              onPress={handleOpenPriceAlerts}
              testID="open-price-alerts-button"
              className="flex-row items-center justify-between rounded-md border border-primary/20 bg-secondary/70 px-3 py-3 active:bg-secondary"
            >
              <Text className="text-sm font-medium">{t('managePriceAlerts')}</Text>
              <Ionicons name="chevron-forward" size={18} color={trailingIconColor} />
            </Pressable>
          </CardHeader>
        </Card>

        <Separator />

        {notifications.length === 0 ? <NotificationEmptyState /> : null}
      </View>
    ),
    [t, notifications.length, handleBackPress, handleOpenPriceAlerts, navigation, trailingIconColor],
  );

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
      ListHeaderComponent={ListHeaderComponent}
      data={notifications}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      ItemSeparatorComponent={ItemSeparatorComponent}
      scrollEnabled
      removeClippedSubviews
      initialNumToRender={20}
      windowSize={5}
      testID="notifications-list"
      accessibilityLabel="Notifications list"
    />
  );
}
