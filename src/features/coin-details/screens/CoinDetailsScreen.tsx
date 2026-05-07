import { useQueries } from '@tanstack/react-query';
import { View } from 'react-native';

import { Button, Card, CardContent, Text } from '@/components/ui';
import { ScreenBackHeader, ScreenLayout } from '@/src/app';
import type { RootStackParamList } from '@/src/navigation/types';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  CoinDetailsSkeleton,
  CoinHistoryChart,
  CoinHistoryList,
  CoinPriceHeader,
} from '../components';
import { fetchCoinHistory } from '../services/fetchCoinHistory';
import { fetchCoinPrice } from '../services/fetchCoinPrice';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function CoinDetailsScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'CoinDetails'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { coinId, name, symbol } = route.params;
  const displayName = name ?? capitalize(coinId);
  const displaySymbol = symbol ?? coinId.toUpperCase();

  const [priceQuery, historyQuery] = useQueries({
    queries: [
      {
        queryKey: ['coin', coinId, 'price'],
        queryFn: () => fetchCoinPrice(coinId),
        staleTime: 30_000,
        retry: false,
      },
      {
        queryKey: ['coin', coinId, 'history'],
        queryFn: () => fetchCoinHistory(coinId),
        staleTime: 30_000,
        retry: false,
      },
    ],
  });

  const isPending = priceQuery.isPending || historyQuery.isPending;
  const isError = priceQuery.isError || historyQuery.isError;

  function handleRetry() {
    void priceQuery.refetch();
    void historyQuery.refetch();
  }

  function handleBackPress() {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }

  return (
    <ScreenLayout className="bg-background" contentClassName="gap-4 px-4 pb-16 pt-4">
      <ScreenBackHeader title={displayName} onBackPress={handleBackPress} />
      {isPending ? <CoinDetailsSkeleton /> : null}

      {!isPending && isError ? (
        <Card>
          <CardContent className="gap-3 p-4">
            <Text testID="coin-details-error">Could not load coin data.</Text>
            <Button
              accessibilityRole="button"
              accessibilityLabel="Retry loading coin data"
              onPress={handleRetry}
            >
              <Text className="font-medium text-primary-foreground">Retry</Text>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!isPending && !isError && priceQuery.data ? (
        <View className="gap-4">
          <CoinPriceHeader coinId={coinId} name={displayName} symbol={displaySymbol} data={priceQuery.data} />
          <Button
            accessibilityRole="button"
            accessibilityLabel={`Swap ${displaySymbol}`}
            onPress={() => navigation.navigate('Swap', { fromId: coinId })}
          >
            <Text className="font-semibold text-primary-foreground">Swap {displaySymbol}</Text>
          </Button>
          {historyQuery.data ? (
            <>
              <CoinHistoryChart points={historyQuery.data} />
              <CoinHistoryList points={historyQuery.data} />
            </>
          ) : null}
        </View>
      ) : null}
    </ScreenLayout>
  );
}
