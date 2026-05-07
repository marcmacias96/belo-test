import { createPersistedStore, resetPersistedStorage } from '@/src/shared/state/persist';

import type { Notification, NotificationsState } from '../types';

const NOTIFICATIONS_PERSIST_KEY = 'notifications:v1';

export const useNotificationsStore = createPersistedStore<NotificationsState>(
  NOTIFICATIONS_PERSIST_KEY,
  (set) => ({
    notifications: [],
    add: (n) =>
      set((state) => {
        const notification: Notification = {
          ...n,
          id: `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          read: false,
        } as Notification;
        return {
          notifications: [notification, ...state.notifications],
        };
      }),
    markAllRead: () =>
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      })),
    clearAll: () => set({ notifications: [] }),
  }),
);

export function resetNotificationsStore() {
  useNotificationsStore.getState().clearAll();
}

export async function resetNotificationsStoreAndStorage() {
  resetNotificationsStore();
  await resetPersistedStorage(NOTIFICATIONS_PERSIST_KEY);
}
