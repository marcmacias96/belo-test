import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { Appearance, AppState, View } from 'react-native';

import { createPersistedStore, resetPersistedStorage } from '@/src/shared/state/persist';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

export const useThemeStore = createPersistedStore<ThemeState>(
  'theme:v1',
  (set, get) => ({
    mode: 'system',
    setMode: (mode) => set({ mode }),
    toggle: () => {
      const current = get().mode;
      set({ mode: current === 'dark' ? 'light' : 'dark' });
    },
  }),
);

export async function resetThemeStore(): Promise<void> {
  useThemeStore.setState({ mode: 'system' });
  await resetPersistedStorage('theme:v1');
}

export type ThemeContextValue = ThemeState & { effectiveMode: 'light' | 'dark' };

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemColorScheme(): 'light' | 'dark' {
  try {
    return Appearance.getColorScheme() ?? 'light';
  } catch {
    return 'light';
  }
}

function useSystemThemeMode(): 'light' | 'dark' {
  const [systemMode, setSystemMode] = useState<'light' | 'dark'>(() => getSystemColorScheme());
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const safeSetMode = (next: 'light' | 'dark') => {
      if (!isMountedRef.current) return;
      setSystemMode((prev) => (prev === next ? prev : next));
    };

    const appearanceSubscription = Appearance.addChangeListener(({ colorScheme }) => {
      try {
        safeSetMode(colorScheme ?? 'light');
      } catch (err) {
        if (__DEV__) console.warn('[ThemeProvider] appearance listener', err);
      }
    });

    const appStateSubscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      try {
        safeSetMode(getSystemColorScheme());
      } catch (err) {
        if (__DEV__) console.warn('[ThemeProvider] appstate listener', err);
      }
    });

    // Re-leer al montar: en cold start Appearance.getColorScheme() puede
    // devolver null antes de que el OS haya hidratado el valor real.
    safeSetMode(getSystemColorScheme());
    const recheckTimeout = setTimeout(() => {
      safeSetMode(getSystemColorScheme());
    }, 0);
    type TimerMaybeUnref = ReturnType<typeof setTimeout> & { unref?: () => void };
    (recheckTimeout as TimerMaybeUnref).unref?.();

    return () => {
      isMountedRef.current = false;
      clearTimeout(recheckTimeout);
      try {
        appearanceSubscription.remove();
      } catch {
        // noop
      }
      try {
        appStateSubscription.remove();
      } catch {
        // noop
      }
    };
  }, []);

  return systemMode;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemThemeMode = useSystemThemeMode();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const toggle = useThemeStore((s) => s.toggle);

  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? systemThemeMode : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, effectiveMode, setMode, toggle }),
    [mode, effectiveMode, setMode, toggle],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View
        testID="theme-root"
        className={`flex-1 bg-background${effectiveMode === 'dark' ? ' dark' : ''}`}
      >
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
