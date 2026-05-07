import { useEffect } from 'react';

import { swapEventEmitter } from '@/src/shared/events/swapEvents';
import { useToast } from '@/src/shared/hooks/useToast';
import { ASSET_METADATA } from '@/src/features/wallet/types';

import { useNotificationsStore } from '../state/useNotificationsStore';

export function useSwapNotificationBridge() {
  const add = useNotificationsStore((state) => state.add);
  const { success } = useToast();

  useEffect(() => {
    const unsubscribe = swapEventEmitter.subscribe((payload) => {
      const fromMeta = ASSET_METADATA[payload.fromId as keyof typeof ASSET_METADATA];
      const toMeta = ASSET_METADATA[payload.toId as keyof typeof ASSET_METADATA];
      const fromSymbol = fromMeta?.symbol ?? payload.fromId.toUpperCase();
      const toSymbol = toMeta?.symbol ?? payload.toId.toUpperCase();

      add({
        kind: 'transaction',
        createdAt: payload.executedAt,
        payload: {
          txId: payload.id,
          fromId: payload.fromId,
          toId: payload.toId,
          fromAmount: payload.fromAmount,
          toAmount: payload.toAmount,
          priceIn: payload.priceIn,
          priceOut: payload.priceOut,
        },
      });

      success('Swap Executed', `${fromSymbol} → ${toSymbol}`);
    });

    return unsubscribe;
  }, [add, success]);
}
