export type MarketAsset = {
  id: string;
  symbol: string;
  name: string;
  currentPriceUsd: number;
};

export type MarketSortValue = 'price-desc' | 'price-asc' | 'name-asc';
