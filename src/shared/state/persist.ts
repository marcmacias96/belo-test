import AsyncStorage from '@react-native-async-storage/async-storage';
import { create, type StateCreator } from 'zustand';
import { createJSONStorage, persist, type PersistOptions } from 'zustand/middleware';

export function createPersistedStore<T>(
  name: string,
  initializer: StateCreator<T>,
  options?: Partial<PersistOptions<T>>,
) {
  return create<T>()(
    persist(initializer, {
      name,
      storage: createJSONStorage(() => AsyncStorage),
      ...options,
    }),
  );
}

export async function resetPersistedStorage(name: string): Promise<void> {
  await AsyncStorage.removeItem(name);
}
