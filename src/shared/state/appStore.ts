import { create } from 'zustand';

/** Global app shell state; extend as the app grows. */
export const useAppStore = create<{ ready: boolean }>(() => ({
  ready: true,
}));
