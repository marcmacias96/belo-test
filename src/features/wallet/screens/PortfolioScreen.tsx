import { useQuery } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';
import { FlatList, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  CardContent,
  Text,
} from '@/components/ui';
import { ScreenLayout } from '@/src/app/layout';
import { NavigationContext } from '@react-navigation/native';

import {
  PortfolioAssetRow,
  PortfolioAssetSkeletonList,
  PortfolioBalanceCard,
  PortfolioQuickActions,
} from '../components';
import { computeTotalUsd } from '../lib/computeTotalUsd';
import { fetchPortfolioPrices } from '../services/fetchPortfolioPrices';
import { useWalletStore } from '../state/useWalletStore';
import { ASSET_IDS, ASSET_METADATA, type Holdings, type PortfolioAsset, type PriceMap } from '../types';

const ESTIMATED_ROW_HEIGHT = 88;

function buildPortfolioAssets(holdings: Holdings, prices: PriceMap): PortfolioAsset[] {
  return ASSET_IDS.map((id) => {
    const amount = holdings[id];
    const meta = ASSET_METADATA[id];
    const priceUsd = prices[id] ?? null;
    const valueUsd = priceUsd !== null ? amount * priceUsd : null;
    return { id, ...meta, amount, priceUsd, valueUsd };
  }).sort((first, second) => {
    const firstValue = first.valueUsd ?? -1;
    const secondValue = second.valueUsd ?? -1;
    return secondValue - firstValue;
  });
}

export function PortfolioScreen() {
  const navigation = useContext(NavigationContext);
  const holdings = useWalletStore((state) => state.holdings);
  const isEmpty = Object.values(holdings).every((amount) => amount === 0);

  const pricesQuery = useQuery({
    queryKey: ['wallet', 'prices'],
    queryFn: fetchPortfolioPrices,
    retry: false,
    enabled: !isEmpty,
  });

  const handleSwapPress = useCallback(() => {
    navigation?.navigate('Swap', undefined);
  }, [navigation]);

  const handleRefreshPress = useCallback(() => {
    void pricesQuery.refetch();
  }, [pricesQuery]);

  if (isEmpty) {
    return (
      <View testID="portfolio-screen" className="flex-1">
        <ScreenLayout className="bg-background" contentClassName="gap-4 px-4 pb-16 pt-4">
          <Card className="rounded-2xl">
            <CardContent className="gap-3 p-5">
              <Badge variant="secondary">Start here</Badge>
              <Text className="text-xl font-semibold text-foreground">Your portfolio is empty</Text>
              <Text variant="muted">
                Add your first position to unlock allocation insights and fast actions.
              </Text>
              <Button
                accessibilityRole="button"
                accessibilityLabel="Go to Swap"
                className="mt-1 rounded-xl"
                onPress={handleSwapPress}
              >
                <Text className="font-semibold text-primary-foreground">Go to Swap</Text>
              </Button>
              <Text testID="portfolio-empty-message" variant="muted">
                No assets in your portfolio yet.
              </Text>
            </CardContent>
          </Card>
        </ScreenLayout>
      </View>
    );
  }

  if (pricesQuery.isPending) {
    return (
      <View testID="portfolio-screen" className="flex-1">
        <ScreenLayout className="bg-background" contentClassName="gap-4 px-4 pb-16 pt-4">
          <View className="gap-1">
            <Text className="text-2xl font-semibold text-foreground">Portfolio</Text>
            <Text variant="muted">Loading latest prices...</Text>
          </View>
          <PortfolioAssetSkeletonList />
        </ScreenLayout>
      </View>
    );
  }

  if (pricesQuery.isError) {
    return (
      <View testID="portfolio-screen" className="flex-1">
        <ScreenLayout className="bg-background" contentClassName="gap-4 px-4 pb-16 pt-4">
          <Card className="rounded-2xl">
            <CardContent className="gap-3 p-5">
              <Badge variant="outline">Connection issue</Badge>
              <Text className="text-xl font-semibold text-foreground">Could not load prices.</Text>
              <Text variant="muted">Check your internet connection and try again.</Text>
              <Button
                accessibilityRole="button"
                accessibilityLabel="Retry loading prices"
                className="mt-1 rounded-xl"
                onPress={handleRefreshPress}
              >
                <Text className="font-medium text-primary-foreground">Retry</Text>
              </Button>
            </CardContent>
          </Card>
        </ScreenLayout>
      </View>
    );
  }

  return (
    <View testID="portfolio-screen" className="flex-1 bg-background">
      <SuccessContent
        holdings={holdings}
        prices={pricesQuery.data ?? {}}
        onSwapPress={handleSwapPress}
        onRefresh={handleRefreshPress}
        isRefreshing={pricesQuery.isRefetching}
      />
    </View>
  );
}

function SuccessContent({
  holdings,
  prices,
  onSwapPress,
  onRefresh,
  isRefreshing,
}: {
  holdings: Holdings;
  prices: PriceMap;
  onSwapPress: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const navigation = useContext(NavigationContext);
  const { total, missingIds } = computeTotalUsd(holdings, prices);
  const portfolioAssets = buildPortfolioAssets(holdings, prices);

  const keyExtractor = useCallback((item: PortfolioAsset) => item.id, []);
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ESTIMATED_ROW_HEIGHT,
      offset: ESTIMATED_ROW_HEIGHT * index,
      index,
    }),
    [],
  );
  const renderItem = useCallback(
    ({ item }: { item: PortfolioAsset }) => (
      <PortfolioAssetRow
        asset={item}
        allocationPct={item.valueUsd !== null && total > 0 ? (item.valueUsd / total) * 100 : null}
        onPress={
          navigation
            ? () => navigation.navigate('CoinDetails', { coinId: item.id, name: item.name, symbol: item.symbol })
            : undefined
        }
      />
    ),
    [navigation, total],
  );
  const ItemSeparatorComponent = useCallback(() => <View className="h-3" />, []);

  const ListHeaderComponent = useCallback(
    () => (
      <View className="gap-4 pb-4 pt-4">
        <PortfolioBalanceCard totalUsd={total} hasMissingPrices={missingIds.length > 0} />
        <PortfolioQuickActions onSwapPress={onSwapPress} />
        <View className="flex-row items-center justify-between pt-1">
          <Text className="text-lg font-semibold text-foreground">Your assets</Text>
          <Badge variant="outline">{portfolioAssets.length} tokens</Badge>
        </View>
      </View>
    ),
    [missingIds.length, onSwapPress, portfolioAssets.length, total],
  );

  return (
    <FlatList
      className="flex-1"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
      ListHeaderComponent={ListHeaderComponent}
      data={portfolioAssets}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      ItemSeparatorComponent={ItemSeparatorComponent}
      removeClippedSubviews
      initialNumToRender={10}
      windowSize={5}
      onRefresh={onRefresh}
      refreshing={isRefreshing}
      accessibilityLabel="Portfolio assets list"
    />
  );
}
