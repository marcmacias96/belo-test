import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { CoinDetailsScreen } from '@/src/features/coin-details';
import { NotificationBadge, NotificationsScreen, useNotificationsStore } from '@/src/features/notifications';
import { SwapScreen } from '@/src/features/swap';
import { PortfolioScreen } from '@/src/features/wallet';

import type { RootStackParamList } from './types';

function SwapScreenWrapper({
  route,
}: {
  route: { params?: { fromId?: string; toId?: string } };
}) {
  const { fromId, toId } = route.params ?? {};
  return <SwapScreen fromId={fromId} toId={toId} />;
}

const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeHeaderNotificationsButtonProps = {
  onPress: () => void;
};

function HomeHeaderNotificationsButton({ onPress }: HomeHeaderNotificationsButtonProps) {
  const unreadCount = useNotificationsStore(
    (state) => state.notifications.filter((notification) => !notification.read).length,
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open notifications"
      hitSlop={8}
      onPress={onPress}
      className="mr-2"
    >
      <View className="relative h-9 w-9 items-center justify-center">
        <Ionicons name="notifications-outline" size={20} color="#111827" />
        <NotificationBadge count={unreadCount} />
      </View>
    </Pressable>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: 'left',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#ffffff' },
        headerTitleStyle: {
          fontSize: 34,
          fontWeight: '700',
          color: '#111827',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={PortfolioScreen}
        options={({ navigation }) => ({
          title: 'Portafolio',
          headerRight: () => (
            <HomeHeaderNotificationsButton onPress={() => navigation.navigate('Notifications')} />
          ),
        })}
      />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CoinDetails" component={CoinDetailsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Swap" component={SwapScreenWrapper} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
