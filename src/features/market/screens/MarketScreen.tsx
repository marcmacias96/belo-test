import { useQuery } from '@tanstack/react-query';
import { useMemo, useContext, useCallback } from 'react';
import { FlatList, View } from 'react-native';

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  SelectDrawer,
  type SelectOption,
  Separator,
  Text,
} from '@/components/ui';
import { NavigationContext } from '@react-navigation/native';

import { MarketAssetRow, MarketAssetSkeletonList } from '../components';
import { fetchMarketAssets } from '../services/fetchMarketAssets';
import { useMarketPreferencesStore } from '../state/useMarketPreferencesStore';
import type { MarketAsset, MarketSortValue } from '../types';

const SORT_OPTIONS: SelectOption[] = [
  { value: 'price-desc', label: 'Top price first' },
  { value: 'price-asc', label: 'Lowest price first' },
  { value: 'name-asc', label: 'Name (A-Z)' },
];

const ESTIMATED_ROW_HEIGHT = 120;

function sortAssets(assets: MarketAsset[], sortValue: MarketSortValue): MarketAsset[] {
  switch (sortValue) {
    case 'price-desc':
      return [...assets].sort((first, second) => second.currentPriceUsd - first.currentPriceUsd);
    case 'price-asc':
      return [...assets].sort((first, second) => first.currentPriceUsd - second.currentPriceUsd);
    case 'name-asc':
      return [...assets].sort((first, second) => first.name.localeCompare(second.name));
    default: {
      const exhaustiveSort: never = sortValue;
      throw new Error(`Unsupported sort option: ${exhaustiveSort}`);
    }
  }
}

export function MarketScreen() {
  const navigation = useContext(NavigationContext);
  const searchQuery = useMarketPreferencesStore((state) => state.searchQuery);
  const setSearchQuery = useMarketPreferencesStore((state) => state.setSearchQuery);
  const sortValue = useMarketPreferencesStore((state) => state.sortValue);
  const setSortValue = useMarketPreferencesStore((state) => state.setSortValue);
  const favoritesOnly = useMarketPreferencesStore((state) => state.favoritesOnly);
  const toggleFavoritesOnly = useMarketPreferencesStore((state) => state.toggleFavoritesOnly);
  const favoriteAssetIds = useMarketPreferencesStore((state) => state.favoriteAssetIds);
  const marketQuery = useQuery({
    queryKey: ['market', 'assets'],
    queryFn: ({ signal }) => fetchMarketAssets(signal),
    retry: false,
  });

  const filteredAssets = useMemo(() => {
    if (!marketQuery.data) {
      return [];
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    const searched = normalizedQuery
      ? marketQuery.data.filter((asset) => {
          const normalizedName = asset.name.toLowerCase();
          const normalizedSymbol = asset.symbol.toLowerCase();
          return (
            normalizedName.includes(normalizedQuery) ||
            normalizedSymbol.includes(normalizedQuery)
          );
        })
      : marketQuery.data;

    const favoritesFiltered = favoritesOnly
      ? searched.filter((asset) => Boolean(favoriteAssetIds[asset.id]))
      : searched;

    return sortAssets(favoritesFiltered, sortValue);
  }, [favoriteAssetIds, favoritesOnly, marketQuery.data, searchQuery, sortValue]);

  const hasRemoteEmptyState =
    !marketQuery.isPending &&
    !marketQuery.isError &&
    marketQuery.data !== undefined &&
    marketQuery.data.length === 0;
  const hasFilteredEmptyState =
    !marketQuery.isPending &&
    !marketQuery.isError &&
    marketQuery.data !== undefined &&
    marketQuery.data.length > 0 &&
    filteredAssets.length === 0;

  const keyExtractor = useCallback((item: MarketAsset) => item.id, []);
  const getItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: ESTIMATED_ROW_HEIGHT,
      offset: ESTIMATED_ROW_HEIGHT * index,
      index,
    }),
    [],
  );
  const renderItem = useCallback(
    ({ item }: { item: MarketAsset }) => (
      <MarketAssetRow
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

  const ListHeaderComponent = useCallback(
    () => (
      <View className="gap-4 pb-3 pt-4">
        <Card>
          <CardHeader className="gap-3">
            <View className="gap-2">
              <CardTitle>Market (CoinGecko)</CardTitle>
              <CardDescription>
                Real integration example with network boundary mocking.
              </CardDescription>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <Badge variant="secondary">Feature sample</Badge>
              <Badge variant="outline">Playground UI line</Badge>
            </View>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters and ordering</CardTitle>
            <CardDescription>Same UI primitives used in playground documentation.</CardDescription>
          </CardHeader>
          <CardContent className="gap-3">
            <Input
              accessibilityLabel="Search market asset"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name or symbol"
            />
            <SelectDrawer
              value={sortValue}
              onValueChange={(value) => setSortValue(value as MarketSortValue)}
              options={SORT_OPTIONS}
              placeholder="Choose sorting"
              title="Sort market assets"
              description="Visual convention aligned with playground."
            />
            <Button
              accessibilityRole="button"
              accessibilityLabel="Toggle favorites only"
              accessibilityState={{ selected: favoritesOnly }}
              variant={favoritesOnly ? 'default' : 'outline'}
              onPress={toggleFavoritesOnly}
            >
              <Text className={favoritesOnly ? 'font-medium text-primary-foreground' : 'font-medium'}>
                {favoritesOnly ? 'Showing only favorites' : 'Show favorites only'}
              </Text>
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {marketQuery.isPending ? (
          <View className="gap-3">
            <Text>Loading market data...</Text>
            <MarketAssetSkeletonList />
          </View>
        ) : null}

        {marketQuery.isError ? (
          <Card>
            <CardContent className="gap-3 p-4">
              <Text>Could not load market data.</Text>
              <Button
                accessibilityRole="button"
                accessibilityLabel="Retry loading market data"
                onPress={() => void marketQuery.refetch()}
              >
                <Text className="font-medium text-primary-foreground">Retry</Text>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {hasRemoteEmptyState ? (
          <Card>
            <CardContent className="p-4">
              <Text>No market assets available.</Text>
            </CardContent>
          </Card>
        ) : null}

        {hasFilteredEmptyState ? (
          <Card>
            <CardContent className="p-4">
              <Text>No assets match current filters.</Text>
            </CardContent>
          </Card>
        ) : null}
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      searchQuery,
      setSearchQuery,
      sortValue,
      setSortValue,
      favoritesOnly,
      toggleFavoritesOnly,
      marketQuery.isPending,
      marketQuery.isError,
      marketQuery.refetch,
      hasRemoteEmptyState,
      hasFilteredEmptyState,
    ],
  );

  return (
    <FlatList
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 64 }}
      ListHeaderComponent={ListHeaderComponent}
      data={filteredAssets.length > 0 && !marketQuery.isPending && !marketQuery.isError ? filteredAssets : []}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      getItemLayout={getItemLayout}
      ItemSeparatorComponent={ItemSeparatorComponent}
      removeClippedSubviews
      initialNumToRender={10}
      windowSize={5}
      accessibilityLabel="Market assets list"
      testID="market-assets-list"
    />
  );
}
