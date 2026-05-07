type CoinGeckoPriceEntry = { usd: number };
type CoinGeckoPriceResponse = Record<string, CoinGeckoPriceEntry>;

export const WALLET_FIXTURES = {
  portfolioPricesSuccess: {
    bitcoin: { usd: 64_000 },
    ethereum: { usd: 3_200 },
    tether: { usd: 1.0 },
    'usd-coin': { usd: 1.0 },
    dai: { usd: 1.0 },
  } satisfies CoinGeckoPriceResponse,

  portfolioPricesMissingBitcoin: {
    ethereum: { usd: 3_200 },
    tether: { usd: 1.0 },
    'usd-coin': { usd: 1.0 },
    dai: { usd: 1.0 },
  } satisfies CoinGeckoPriceResponse,

  portfolioPricesEmpty: {} satisfies CoinGeckoPriceResponse,

  portfolioPricesError: new Error('Network request failed'),
};
