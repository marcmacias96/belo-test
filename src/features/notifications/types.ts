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
  alertId: string;
  assetId: string;
  symbol: string;
  deltaPercent: number;
  thresholdPercent: number;
};

export type PriceAlert = {
  id: string;
  assetId: AssetId;
  thresholdPercent: number;
  referencePrice?: number;
  createdAt: string;
  updatedAt: string;
};

export type Notification =
  | { id: string; kind: 'transaction'; createdAt: string; read: boolean; payload: TransactionPayload }
  | { id: string; kind: 'price'; createdAt: string; read: boolean; payload: PriceAlertPayload };

export type NotificationsState = {
  notifications: Notification[];
  add: (n: Omit<Notification, 'id' | 'read'>) => void;
  markAllRead: () => void;
  clearAll: () => void;
};
