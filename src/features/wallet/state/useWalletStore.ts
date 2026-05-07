import { createPersistedStore, resetPersistedStorage } from '@/src/shared/state/persist';

import type { AssetId, Holdings, SwapParams } from '../types';

type WalletState = {
  holdings: Holdings;
  getBalance: (id: AssetId) => number;
  applySwap: (params: SwapParams) => void;
  reset: () => void;
};

const WALLET_PERSIST_KEY = 'wallet:v1';

const INITIAL_HOLDINGS: Holdings = {
  usdt: 1000,
  usdc: 500,
  dai: 500,
  bitcoin: 0.05,
  ethereum: 1.5,
};

export const useWalletStore = createPersistedStore<WalletState>(
  WALLET_PERSIST_KEY,
  (set, get) => ({
    holdings: { ...INITIAL_HOLDINGS },
    getBalance: (id) => get().holdings[id],
    applySwap: ({ fromId, toId, fromAmount, toAmount }) => {
      set((state) => ({
        holdings: {
          ...state.holdings,
          [fromId]: state.holdings[fromId] - fromAmount,
          [toId]: state.holdings[toId] + toAmount,
        },
      }));
    },
    reset: () => {
      set({ holdings: { ...INITIAL_HOLDINGS } });
    },
  }),
);

export function resetWalletStore() {
  useWalletStore.getState().reset();
}

export async function resetWalletStoreAndStorage() {
  resetWalletStore();
  await resetPersistedStorage(WALLET_PERSIST_KEY);
}
