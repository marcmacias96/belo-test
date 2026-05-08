import { COINGECKO_API_BASE } from '@/src/shared/config/coingecko';
import { coingeckoFetch } from '@/src/shared/http';
import type { AssetId } from '@/src/features/wallet/types';
import type { SwapPrices } from '../types';

type CoinGeckoPriceResponse = Record<string, { usd: number }>;

const ASSET_TO_COINGECKO_ID: Record<AssetId, string> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  usdt: 'tether',
  usdc: 'usd-coin',
  dai: 'dai',
};

export async function fetchSwapPrices(
  fromId: AssetId,
  toId: AssetId,
  signal?: AbortSignal,
): Promise<SwapPrices> {
  const fromCgId = ASSET_TO_COINGECKO_ID[fromId];
  const toCgId = ASSET_TO_COINGECKO_ID[toId];

  const ids = fromCgId === toCgId ? fromCgId : `${fromCgId},${toCgId}`;
  const endpoint = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd`;

  const response = await coingeckoFetch(endpoint, { maxRetries: 0, signal });

  if (!response.ok) {
    throw new Error(`CoinGecko error: ${response.status}`);
  }

  const data = (await response.json()) as CoinGeckoPriceResponse;

  return {
    priceIn: data[fromCgId].usd,
    priceOut: data[toCgId].usd,
  };
}
