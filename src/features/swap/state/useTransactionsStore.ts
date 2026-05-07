import { createPersistedStore, resetPersistedStorage } from '@/src/shared/state/persist';

import type { Transaction } from '../types';

type TransactionsState = {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  clearTransactions: () => void;
};

const TRANSACTIONS_PERSIST_KEY = 'transactions:v1';

export const useTransactionsStore = createPersistedStore<TransactionsState>(
  TRANSACTIONS_PERSIST_KEY,
  (set) => ({
    transactions: [],
    addTransaction: (tx) =>
      set((state) => ({ transactions: [...state.transactions, tx] })),
    clearTransactions: () => set({ transactions: [] }),
  }),
);

export function resetTransactionsStore() {
  useTransactionsStore.getState().clearTransactions();
}

export async function resetTransactionsStoreAndStorage() {
  resetTransactionsStore();
  await resetPersistedStorage(TRANSACTIONS_PERSIST_KEY);
}
