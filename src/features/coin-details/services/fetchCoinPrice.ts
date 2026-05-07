import { COINGECKO_API_BASE } from '@/src/shared/config/coingecko';
import { coingeckoFetch } from '@/src/shared/http';

import type { CoinPrice } from '../types';

type SimplePriceResponse = Record<string, { usd: number; usd_24h_change: number | null }>;
const COINGECKO_ID_ALIASES: Record<string, string> = {
  usdt: 'tether',
  usdc: 'usd-coin',
};

function toCoinGeckoId(coinId: string): string {
  return COINGECKO_ID_ALIASES[coinId] ?? coinId;
}

export async function fetchCoinPrice(coinId: string): Promise<CoinPrice> {
  const resolvedCoinId = toCoinGeckoId(coinId);
  const query = new URLSearchParams({
    ids: resolvedCoinId,
    vs_currencies: 'usd',
    include_24hr_change: 'true',
  });

  const endpoint = `${COINGECKO_API_BASE}/simple/price?${query.toString()}`;
  const response = await coingeckoFetch(endpoint, { maxRetries: 0 });

  if (!response.ok) {
    throw new Error(`CoinGecko error: ${response.status}`);
  }

  const data = (await response.json()) as SimplePriceResponse;
  const coin = data[resolvedCoinId];
  if (!coin || typeof coin.usd !== 'number') {
    throw new Error(`CoinGecko price payload missing for: ${resolvedCoinId}`);
  }

  return {
    id: coinId,
    priceUsd: coin.usd,
    change24h: coin.usd_24h_change ?? null,
  };
}
