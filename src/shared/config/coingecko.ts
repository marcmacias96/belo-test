/** CoinGecko REST API base URL. */
export const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Demo API key loaded from EXPO_PUBLIC_COINGECKO_API_KEY.
 * Set the variable in .env (already git-ignored).
 */
export const COINGECKO_API_KEY = process.env.EXPO_PUBLIC_COINGECKO_API_KEY ?? '';
