type CoinGeckoPriceEntry = { usd: number };
type CoinGeckoPriceResponse = Record<string, CoinGeckoPriceEntry>;

export const SWAP_FIXTURES = {
  swapPricesSuccess: {
    bitcoin: { usd: 100_000 },
    ethereum: { usd: 3_000 },
    tether: { usd: 1 },
    'usd-coin': { usd: 1 },
    dai: { usd: 1 },
  } satisfies CoinGeckoPriceResponse,

  swapPricesError: new Error('Network request failed'),
};
