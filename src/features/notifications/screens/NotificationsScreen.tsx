import { NavigationContext } from '@react-navigation/native';
import { useCallback, useContext } from 'react';
import { FlatList, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { CardContent, CardHeader, CardTitle, Card, Separator } from '@/components/ui';
import { ScreenBackHeader } from '@/src/app';
import { ASSET_IDS } from '@/src/features/wallet/types';

import {
  NotificationEmptyState,
  NotificationRow,
  NotificationsHeader,
  PriceAlertThresholdRow,
} from '../components';
import { useNotificationsStore } from '../state/useNotificationsStore';
import type { Notification } from '../types';

export function NotificationsScreen() {
  const { t } = useTranslation('notifications');
  const navigation = useContext(NavigationContext);
  const notifications = useNotificationsStore((state) => state.notifications);

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

  const ListHeaderComponent = useCallback(
    () => (
      <View className="gap-4 pb-3 pt-4">
        <ScreenBackHeader
          title={t('title')}
          onBackPress={handleBackPress}
          canGoBack={navigation !== null}
        />
        <NotificationsHeader />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('alertThresholds')}</CardTitle>
          </CardHeader>
          <CardContent className="gap-2 pb-3">
            {ASSET_IDS.map((assetId) => (
              <PriceAlertThresholdRow key={assetId} assetId={assetId} />
            ))}
          </CardContent>
        </Card>

        <Separator />

        {notifications.length === 0 ? <NotificationEmptyState /> : null}
      </View>
    ),
    [t, notifications.length, handleBackPress, navigation],
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
