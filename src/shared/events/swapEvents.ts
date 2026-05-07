export type SwapExecutedPayload = {
  id: string;
  fromId: string;
  toId: string;
  fromAmount: number;
  toAmount: number;
  priceIn: number;
  priceOut: number;
  executedAt: string;
};

type SwapEventHandler = (payload: SwapExecutedPayload) => void;

let listeners: SwapEventHandler[] = [];

export const swapEventEmitter = {
  emit(payload: SwapExecutedPayload): void {
    listeners.forEach((handler) => handler(payload));
  },

  subscribe(handler: SwapEventHandler): () => void {
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((h) => h !== handler);
    };
  },

  unsubscribe(handler: SwapEventHandler): void {
    listeners = listeners.filter((h) => h !== handler);
  },

  _reset(): void {
    listeners = [];
  },
};
