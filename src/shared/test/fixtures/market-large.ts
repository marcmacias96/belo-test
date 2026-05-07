import type { MarketAsset } from '@/src/features/market/types';

export const MARKET_LARGE_FIXTURES: MarketAsset[] = Array.from({ length: 200 }, (_, index) => ({
  id: `coin-${index}`,
  symbol: `C${index}`,
  name: `Coin ${index}`,
  currentPriceUsd: (index + 1) * 100,
}));
