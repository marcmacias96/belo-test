const USD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number): string {
  return USD_FORMATTER.format(value);
}

export function formatChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}

export type BidAsk = {
  bid: number;
  ask: number;
};

const SPREAD_PCT = 0.005;

export function computeBidAsk(price: number): BidAsk {
  return {
    bid: price * (1 - SPREAD_PCT),
    ask: price * (1 + SPREAD_PCT),
  };
}
