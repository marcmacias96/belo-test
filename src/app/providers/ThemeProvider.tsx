import { createContext, useContext, useEffect, type PropsWithChildren } from 'react';
import { StyleSheet, useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { View } from 'react-native';

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

export function ThemeProvider({ children }: PropsWithChildren) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const toggle = useThemeStore((s) => s.toggle);

  useEffect(() => {
    const darkModeFlag = StyleSheet.getFlag('darkMode') ?? 'media';
    if (darkModeFlag === 'media') return;
    setColorScheme(mode === 'system' ? 'system' : mode);
  }, [mode, setColorScheme]);

  const effectiveMode: 'light' | 'dark' =
    mode === 'system' ? (colorScheme ?? 'light') : mode;

  return (
    <ThemeContext.Provider value={{ mode, effectiveMode, setMode, toggle }}>
      <View className={`flex-1 bg-background${effectiveMode === 'dark' ? ' dark' : ''}`}>
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
