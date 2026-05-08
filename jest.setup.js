import 'react-native-gesture-handler/jestSetup';

import { notifyManager } from '@tanstack/query-core';
import { act, cleanup } from '@testing-library/react-native';

// `cleanup` antes del siguiente caso evita resets de stores con árboles montados;
// un segundo paso después de cada caso asegura desmontaje del último test del archivo.
beforeEach(() => {
  cleanup();
});
afterEach(() => {
  cleanup();
});

// TanStack Query notifica observers vía microtasks/timeouts fuera del render;
// sin esto React 19 marca muchos "was not wrapped in act(...)" en tests RN.
notifyManager.setNotifyFunction((callback) => {
  act(() => {
    callback();
  });
});
notifyManager.setBatchNotifyFunction((callback) => {
  act(() => {
    callback();
  });
});
// En tests evita pending `setTimeout(0)` en el notify scheduler (véase TanStack notifyManager default).
notifyManager.setScheduler((run) => {
  run();
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

const { format } = require('node:util');

// VirtualizedList agenda `setState` con timers; React lo reporta como `act` aun fuera del test útil.
const originalConsoleError = console.error.bind(console);
jest.spyOn(console, 'error').mockImplementation((...args) => {
  const formatted = format(...args);
  if (formatted.includes('not wrapped in act') && formatted.includes('VirtualizedList')) return;
  originalConsoleError(...args);
});
