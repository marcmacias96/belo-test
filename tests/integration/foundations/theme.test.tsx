/// <reference types="jest" />

import { readFileSync } from 'fs';
import path from 'path';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useTheme, useThemeStore, resetThemeStore } from '@/src/app/providers/ThemeProvider';
import { actAsync, renderWithProviders } from '@/src/shared/test';

function themeRootClassName(): string {
  return (screen.getByTestId('theme-root').props.className as string | undefined) ?? '';
}

function expectThemeRootDarkClass(expectDark: boolean) {
  const cn = themeRootClassName();
  if (expectDark) expect(cn).toContain(' dark');
  else expect(cn).not.toContain(' dark');
}

function ThemeTestComponent() {
  const { effectiveMode, toggle } = useTheme();
  return (
    <>
      <Text testID="theme-mode">{effectiveMode}</Text>
      <Button accessibilityRole="button" accessibilityLabel="Toggle theme" onPress={toggle}>
        <Text>Toggle</Text>
      </Button>
    </>
  );
}

function mockSystemTheme(initialMode: 'light' | 'dark') {
  let currentMode: 'light' | 'dark' = initialMode;
  let onAppearanceChange: ((event: { colorScheme: 'light' | 'dark' | null }) => void) | undefined;
  let onAppStateChange: ((status: string) => void) | undefined;

  jest.spyOn(ReactNative.Appearance, 'getColorScheme').mockImplementation(() => currentMode);
  jest
    .spyOn(ReactNative.Appearance, 'addChangeListener')
    .mockImplementation((listener) => {
      onAppearanceChange = listener;
      return { remove: jest.fn() };
    });
  jest.spyOn(ReactNative.AppState, 'addEventListener').mockImplementation((_, listener) => {
    onAppStateChange = listener as (status: string) => void;
    return { remove: jest.fn() };
  });

  return {
    emitAppearanceChange(nextMode: 'light' | 'dark' | null) {
      if (nextMode) currentMode = nextMode;
      onAppearanceChange?.({ colorScheme: nextMode });
    },
    emitAppActive(nextMode?: 'light' | 'dark') {
      if (nextMode) currentMode = nextMode;
      onAppStateChange?.('active');
    },
  };
}

beforeEach(async () => {
  await actAsync(() => resetThemeStore());
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('theme foundations', () => {
  it('deberia montar el provider de tema sin depender de navigation linking context', async () => {
    mockSystemTheme('light');
    renderWithProviders(<ThemeTestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('light');
    });
    expectThemeRootDarkClass(false);
  });

  it('deberia tener app.json configurado para seguir el tema del sistema (userInterfaceStyle automatic)', () => {
    const appJsonPath = path.join(process.cwd(), 'app.json');
    const expo = JSON.parse(readFileSync(appJsonPath, 'utf8')) as {
      expo?: { userInterfaceStyle?: string };
    };
    expect(expo.expo?.userInterfaceStyle).toBe('automatic');
  });

  it('deberia seguir cambios del tema del sistema cuando mode es system', async () => {
    const systemTheme = mockSystemTheme('light');

    renderWithProviders(<ThemeTestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('light');
    });
    expectThemeRootDarkClass(false);

    act(() => {
      systemTheme.emitAppearanceChange('dark');
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
    });
    expectThemeRootDarkClass(true);

    act(() => {
      systemTheme.emitAppActive('light');
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('light');
    });
    expectThemeRootDarkClass(false);
  });

  it('deberia aplicar la clase dark cuando el usuario activa el toggle de tema', async () => {
    await act(async () => {
      useThemeStore.setState({ mode: 'light' });
    });

    renderWithProviders(<ThemeTestComponent />);

    expect(screen.getByTestId('theme-mode').props.children).toBe('light');
    expectThemeRootDarkClass(false);

    fireEvent.press(screen.getByLabelText('Toggle theme'));

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
    });
    expectThemeRootDarkClass(true);
  });

  it('deberia conservar el tema oscuro cuando la app se reinicia', async () => {
    mockSystemTheme('light');
    await AsyncStorage.setItem(
      'theme:v1',
      JSON.stringify({ state: { mode: 'dark' }, version: 0 }),
    );

    await act(async () => {
      await useThemeStore.persist.rehydrate();
    });

    renderWithProviders(<ThemeTestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
    });
    expectThemeRootDarkClass(true);
  });

  it('deberia respetar mode system persistido al relanzar app', async () => {
    mockSystemTheme('dark');

    await AsyncStorage.setItem(
      'theme:v1',
      JSON.stringify({ state: { mode: 'system' }, version: 0 }),
    );

    await act(async () => {
      await useThemeStore.persist.rehydrate();
    });

    renderWithProviders(<ThemeTestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
    });
    expectThemeRootDarkClass(true);
  });

  it('deberia mapear colorScheme null del sistema a light', async () => {
    const systemTheme = mockSystemTheme('dark');

    renderWithProviders(<ThemeTestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
    });
    expectThemeRootDarkClass(true);

    act(() => {
      systemTheme.emitAppearanceChange(null);
    });

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('light');
    });
    expectThemeRootDarkClass(false);
  });

  it('deberia alinear effectiveMode cuando getColorScheme pasa de null a dark tras cold start', async () => {
    jest.useFakeTimers();
    try {
      let callCount = 0;

      jest.spyOn(ReactNative.Appearance, 'getColorScheme').mockImplementation(() => {
        callCount += 1;
        if (callCount < 3) return null;
        return 'dark';
      });
      jest.spyOn(ReactNative.Appearance, 'addChangeListener').mockImplementation(() => {
        return { remove: jest.fn() };
      });
      jest.spyOn(ReactNative.AppState, 'addEventListener').mockImplementation((_, listener) => {
        return { remove: jest.fn() };
      });

      renderWithProviders(<ThemeTestComponent />);

      expect(screen.getByTestId('theme-mode').props.children).toBe('light');
      expectThemeRootDarkClass(false);

      await act(async () => {
        jest.runOnlyPendingTimers();
      });

      await waitFor(() => {
        expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
      });
      expectThemeRootDarkClass(true);
    } finally {
      jest.useRealTimers();
    }
  });
});
