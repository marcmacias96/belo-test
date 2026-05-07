/// <reference types="jest" />

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, waitFor } from '@testing-library/react-native';

import {
  createPersistedStore,
  resetPersistedStorage,
} from '@/src/shared/state/persist';

const TEST_KEY_REHYDRATE = 'test-rehydrate:v1';
const TEST_KEY_RESET = 'test-reset:v1';

afterEach(async () => {
  await AsyncStorage.removeItem(TEST_KEY_REHYDRATE);
  await AsyncStorage.removeItem(TEST_KEY_RESET);
});

describe('persistence foundations', () => {
  it('deberia rehidratar el valor persistido cuando se monta un store luego de unmount', async () => {
    type CountState = { count: number; setCount: (n: number) => void };

    const useFirst = createPersistedStore<CountState>(TEST_KEY_REHYDRATE, (set) => ({
      count: 0,
      setCount: (count) => set({ count }),
    }));

    act(() => {
      useFirst.getState().setCount(42);
    });

    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(TEST_KEY_REHYDRATE);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!) as { state: { count: number } };
      expect(parsed.state.count).toBe(42);
    });

    const useSecond = createPersistedStore<CountState>(TEST_KEY_REHYDRATE, (set) => ({
      count: 0,
      setCount: (count) => set({ count }),
    }));

    await act(async () => {
      await useSecond.persist.rehydrate();
    });

    expect(useSecond.getState().count).toBe(42);
  });

  it('deberia limpiar el storage cuando se invoca el helper de reset en tests', async () => {
    await AsyncStorage.setItem(
      TEST_KEY_RESET,
      JSON.stringify({ state: { value: 'stored' }, version: 0 }),
    );

    const beforeReset = await AsyncStorage.getItem(TEST_KEY_RESET);
    expect(beforeReset).not.toBeNull();

    await resetPersistedStorage(TEST_KEY_RESET);

    const afterReset = await AsyncStorage.getItem(TEST_KEY_RESET);
    expect(afterReset).toBeNull();
  });
});
