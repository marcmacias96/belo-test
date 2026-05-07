export type CoinPrice = {
  id: string;
  priceUsd: number;
  change24h: number | null;
};

export type CoinHistoryPoint = {
  timestamp: number;
  price: number;
};

export type CoinDetailsData = {
  price: CoinPrice;
  history: CoinHistoryPoint[];
};
