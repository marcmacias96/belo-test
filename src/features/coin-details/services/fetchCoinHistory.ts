import { COINGECKO_API_BASE } from '@/src/shared/config/coingecko';
import { coingeckoFetch } from '@/src/shared/http';

import { normalizeHistory } from '../lib/normalizeHistory';
import type { CoinHistoryPoint } from '../types';

type MarketChartResponse = {
  prices: [number, number][];
};
const COINGECKO_ID_ALIASES: Record<string, string> = {
  usdt: 'tether',
  usdc: 'usd-coin',
};

function toCoinGeckoId(coinId: string): string {
  return COINGECKO_ID_ALIASES[coinId] ?? coinId;
}

export async function fetchCoinHistory(coinId: string, signal?: AbortSignal): Promise<CoinHistoryPoint[]> {
  const resolvedCoinId = toCoinGeckoId(coinId);
  const query = new URLSearchParams({
    vs_currency: 'usd',
    days: '1',
    interval: 'hourly',
  });

  const endpoint = `${COINGECKO_API_BASE}/coins/${resolvedCoinId}/market_chart?${query.toString()}`;
  const response = await coingeckoFetch(endpoint, { maxRetries: 0, signal });

  if (!response.ok) {
    throw new Error(`CoinGecko error: ${response.status}`);
  }

  const data = (await response.json()) as MarketChartResponse;
  if (!Array.isArray(data.prices)) {
    throw new Error(`CoinGecko history payload missing prices for: ${resolvedCoinId}`);
  }
  return normalizeHistory(data.prices);
}
