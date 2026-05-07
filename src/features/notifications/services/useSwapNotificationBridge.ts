import { useEffect } from 'react';

import { swapEventEmitter } from '@/src/shared/events/swapEvents';

import { useNotificationsStore } from '../state/useNotificationsStore';

export function useSwapNotificationBridge() {
  const add = useNotificationsStore((state) => state.add);

  useEffect(() => {
    const unsubscribe = swapEventEmitter.subscribe((payload) => {
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
    });

    return unsubscribe;
  }, [add]);
}
