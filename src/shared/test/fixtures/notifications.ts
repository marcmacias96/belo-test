import type { Notification } from '@/src/features/notifications/types';

type CoinGeckoPriceEntry = { usd: number };
type CoinGeckoPriceResponse = Record<string, CoinGeckoPriceEntry>;

export const NOTIFICATION_FIXTURES = {
  priceSnapshotInitial: {
    bitcoin: { usd: 100_000 },
    ethereum: { usd: 3_000 },
    tether: { usd: 1.0 },
    'usd-coin': { usd: 1.0 },
    dai: { usd: 1.0 },
  } satisfies CoinGeckoPriceResponse,

  priceSnapshotAfterMove: {
    bitcoin: { usd: 106_000 },
    ethereum: { usd: 3_180 },
    tether: { usd: 1.06 },
    'usd-coin': { usd: 1.06 },
    dai: { usd: 1.06 },
  } satisfies CoinGeckoPriceResponse,

  priceSnapshotSmallMove: {
    bitcoin: { usd: 102_000 },
    ethereum: { usd: 3_060 },
    tether: { usd: 1.02 },
    'usd-coin': { usd: 1.02 },
    dai: { usd: 1.02 },
  } satisfies CoinGeckoPriceResponse,

  pricesError503: { ok: false, status: 503, json: async () => ({}) },

  sampleTransactionNotification: {
    id: 'notif-tx-001',
    kind: 'transaction',
    createdAt: '2026-05-07T12:00:00.000Z',
    read: false,
    payload: {
      txId: 'swap-001',
      fromId: 'bitcoin',
      toId: 'ethereum',
      fromAmount: 0.01,
      toAmount: 0.333,
      priceIn: 100_000,
      priceOut: 3_000,
    },
  } satisfies Notification,

  samplePriceNotification: {
    id: 'notif-price-001',
    kind: 'price',
    createdAt: '2026-05-07T12:01:00.000Z',
    read: false,
    payload: {
      assetId: 'bitcoin',
      symbol: 'BTC',
      deltaPercent: 6,
      threshold: 5,
    },
  } satisfies Notification,
};
