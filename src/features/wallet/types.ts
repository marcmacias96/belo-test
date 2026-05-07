export type AssetId = 'usdt' | 'usdc' | 'dai' | 'bitcoin' | 'ethereum';

export type Holdings = Record<AssetId, number>;

export type PortfolioAsset = {
  id: AssetId;
  symbol: string;
  name: string;
  amount: number;
  priceUsd: number | null;
  valueUsd: number | null;
};

export type PriceMap = Partial<Record<AssetId, number>>;

export type SwapParams = {
  fromId: AssetId;
  toId: AssetId;
  fromAmount: number;
  toAmount: number;
};

export const ASSET_IDS: AssetId[] = ['usdt', 'usdc', 'dai', 'bitcoin', 'ethereum'];

export const ASSET_METADATA: Record<AssetId, { symbol: string; name: string }> = {
  usdt: { symbol: 'USDT', name: 'Tether' },
  usdc: { symbol: 'USDC', name: 'USD Coin' },
  dai: { symbol: 'DAI', name: 'DAI' },
  bitcoin: { symbol: 'BTC', name: 'Bitcoin' },
  ethereum: { symbol: 'ETH', name: 'Ethereum' },
};
