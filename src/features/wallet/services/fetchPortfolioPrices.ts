import { COINGECKO_API_BASE } from '@/src/shared/config/coingecko';
import { coingeckoFetch } from '@/src/shared/http';

import type { AssetId, PriceMap } from '../types';

type CoinGeckoPriceEntry = { usd: number };
type CoinGeckoPriceResponse = Record<string, CoinGeckoPriceEntry>;

const COINGECKO_IDS = 'bitcoin,ethereum,tether,usd-coin,dai';

const COINGECKO_ID_TO_ASSET_ID: Record<string, AssetId> = {
  bitcoin: 'bitcoin',
  ethereum: 'ethereum',
  tether: 'usdt',
  'usd-coin': 'usdc',
  dai: 'dai',
};

export async function fetchPortfolioPrices(): Promise<PriceMap> {
  const endpoint = `${COINGECKO_API_BASE}/simple/price?ids=${COINGECKO_IDS}&vs_currencies=usd`;
  const response = await coingeckoFetch(endpoint, { maxRetries: 0 });

  if (!response.ok) {
    throw new Error(`CoinGecko error: ${response.status}`);
  }

  const data = (await response.json()) as CoinGeckoPriceResponse;

  const priceMap: PriceMap = {};
  for (const [cgId, entry] of Object.entries(data)) {
    const assetId = COINGECKO_ID_TO_ASSET_ID[cgId];
    if (assetId !== undefined) {
      priceMap[assetId] = entry.usd;
    }
  }

  return priceMap;
}
