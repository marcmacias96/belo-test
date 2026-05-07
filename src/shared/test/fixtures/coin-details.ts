/** Raw CoinGecko /simple/price response for bitcoin */
export const coinPriceSuccess = {
  bitcoin: {
    usd: 65_432.1,
    usd_24h_change: 2.45,
  },
};

/** Raw CoinGecko /coins/{id}/market_chart prices array — 24 hourly entries */
export const coinHistorySuccess: [number, number][] = Array.from({ length: 24 }, (_, i) => [
  Date.now() - (23 - i) * 3_600_000,
  60_000 + i * 200,
]);

/** Empty prices array — no history points */
export const coinHistoryEmpty: [number, number][] = [];

/** Error thrown when the price endpoint is unreachable */
export const coinPriceError = new Error('Network error: failed to fetch coin price');
