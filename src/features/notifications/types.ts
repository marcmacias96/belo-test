import type { AssetId } from '@/src/features/wallet/types';

export type NotificationKind = 'transaction' | 'price';

export type TransactionPayload = {
  txId: string;
  fromId: string;
  toId: string;
  fromAmount: number;
  toAmount: number;
  priceIn: number;
  priceOut: number;
};

export type PriceAlertPayload = {
  assetId: string;
  symbol: string;
  deltaPercent: number;
  threshold: number;
};

export type Notification =
  | { id: string; kind: 'transaction'; createdAt: string; read: boolean; payload: TransactionPayload }
  | { id: string; kind: 'price'; createdAt: string; read: boolean; payload: PriceAlertPayload };

export type PriceAlertThresholds = Record<AssetId, number>;

export type NotificationsState = {
  notifications: Notification[];
  add: (n: Omit<Notification, 'id' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
};
