import { COINGECKO_API_BASE } from '@/src/shared/config/coingecko';
import { getJson } from '@/src/shared/http';

import { type MarketAsset } from '../types';

type CoinGeckoMarketCoin = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
};

const MARKET_IDS = 'bitcoin,ethereum,solana,polkadot,dogecoin';

export async function fetchMarketAssets(signal?: AbortSignal): Promise<MarketAsset[]> {
  const query = new URLSearchParams({
    vs_currency: 'usd',
    ids: MARKET_IDS,
    order: 'market_cap_desc',
    per_page: '10',
    page: '1',
    sparkline: 'false',
  });

  const endpoint = `${COINGECKO_API_BASE}/coins/markets?${query.toString()}`;
  const payload = await getJson<CoinGeckoMarketCoin[]>(endpoint, undefined, { signal, maxRetries: 0 });

  return payload.map((coin) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    currentPriceUsd: coin.current_price,
  }));
}
