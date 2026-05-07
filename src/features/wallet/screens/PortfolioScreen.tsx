import { useQuery } from '@tanstack/react-query';
import { useCallback, useContext } from 'react';
import { FlatList, View } from 'react-native';

import {
  Button,
  Card,
  CardContent,
  Text,
} from '@/components/ui';
import { ScreenLayout } from '@/src/app/layout';
import { NavigationContext } from '@react-navigation/native';

import { PortfolioAssetRow, PortfolioAssetSkeletonList, PortfolioBalanceCard } from '../components';
import { computeTotalUsd } from '../lib/computeTotalUsd';
import { fetchPortfolioPrices } from '../services/fetchPortfolioPrices';
import { useWalletStore } from '../state/useWalletStore';
import { ASSET_IDS, ASSET_METADATA, type Holdings, type PortfolioAsset, type PriceMap } from '../types';

const ESTIMATED_ROW_HEIGHT = 80;

function buildPortfolioAssets(holdings: Holdings, prices: PriceMap): PortfolioAsset[] {
  return ASSET_IDS.map((id) => {
    const amount = holdings[id];
    const meta = ASSET_METADATA[id];
    const priceUsd = prices[id] ?? null;
    const valueUsd = priceUsd !== null ? amount * priceUsd : null;
    return { id, ...meta, amount, priceUsd, valueUsd };
  });
}

export function PortfolioScreen() {
  const holdings = useWalletStore((state) => state.holdings);
  const isEmpty = Object.values(holdings).every((amount) => amount === 0);

  const pricesQuery = useQuery({
    queryKey: ['wallet', 'prices'],
    queryFn: fetchPortfolioPrices,
    retry: false,
    enabled: !isEmpty,
  });

  // Non-success states use ScrollView via ScreenLayout (content fits on screen)
  if (isEmpty) {
    return (
      <View testID="portfolio-screen" className="flex-1">
        <ScreenLayout className="bg-background" contentClassName="gap-4 px-4 pb-16 pt-4">
          <Card>
            <CardContent className="p-4">
              <Text testID="portfolio-empty-message">No assets in your portfolio yet.</Text>
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
          <PortfolioAssetSkeletonList />
        </ScreenLayout>
      </View>
    );
  }

  if (pricesQuery.isError) {
    return (
      <View testID="portfolio-screen" className="flex-1">
        <ScreenLayout className="bg-background" contentClassName="gap-4 px-4 pb-16 pt-4">
          <Card>
            <CardContent className="gap-3 p-4">
              <Text>Could not load prices.</Text>
              <Button
                accessibilityRole="button"
                accessibilityLabel="Retry loading prices"
                onPress={() => void pricesQuery.refetch()}
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
      <SuccessContent holdings={holdings} prices={pricesQuery.data ?? {}} />
    </View>
  );
}

function SuccessContent({
  holdings,
  prices,
}: {
  holdings: Holdings;
  prices: PriceMap;
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
        onPress={
          navigation
            ? () => navigation.navigate('CoinDetails', { coinId: item.id, name: item.name, symbol: item.symbol })
            : undefined
        }
      />
    ),
    [navigation],
  );
  const ItemSeparatorComponent = useCallback(() => <View className="h-3" />, []);

  const handleSwapPress = useCallback(() => {
    navigation?.navigate('Swap', undefined);
  }, [navigation]);

  const ListHeaderComponent = useCallback(
    () => (
      <View className="gap-4 pb-4 pt-4">
        <PortfolioBalanceCard totalUsd={total} hasMissingPrices={missingIds.length > 0} />
        <Button
          accessibilityRole="button"
          accessibilityLabel="Go to Swap"
          onPress={handleSwapPress}
        >
          <Text className="font-semibold text-primary-foreground">Swap</Text>
        </Button>
      </View>
    ),
    [total, missingIds.length, handleSwapPress],
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
      accessibilityLabel="Portfolio assets list"
    />
  );
}
