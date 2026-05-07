import i18next from '@/src/i18n';
import { ASSET_METADATA } from '@/src/features/wallet/types';

import type { Notification, PriceAlertPayload, TransactionPayload } from '../types';

export function formatNotificationTitle(n: Notification): string {
  if (n.kind === 'transaction') {
    return i18next.t('notifications:transactionTitle');
  }
  if (n.kind === 'price') {
    const p = n.payload as PriceAlertPayload;
    return i18next.t('notifications:priceAlertTitle', { symbol: p.symbol });
  }
  const _exhaustive: never = n;
  return String(_exhaustive);
}

export function formatNotificationBody(n: Notification): string {
  if (n.kind === 'transaction') {
    const p = n.payload as TransactionPayload;
    const fromSymbol = ASSET_METADATA[p.fromId as keyof typeof ASSET_METADATA]?.symbol ?? p.fromId.toUpperCase();
    const toSymbol = ASSET_METADATA[p.toId as keyof typeof ASSET_METADATA]?.symbol ?? p.toId.toUpperCase();
    return i18next.t('notifications:transactionBody', {
      fromAmount: p.fromAmount.toFixed(4),
      fromSymbol,
      toAmount: p.toAmount.toFixed(4),
      toSymbol,
    });
  }
  if (n.kind === 'price') {
    const p = n.payload as PriceAlertPayload;
    return i18next.t('notifications:priceAlertBody', {
      symbol: p.symbol,
      delta: (p.deltaPercent * (p.deltaPercent >= 0 ? 1 : -1)).toFixed(1),
      threshold: (p.threshold * 100).toFixed(0),
    });
  }
  const _exhaustive: never = n;
  return String(_exhaustive);
}

export function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = Math.max(0, now - then);
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}
