/// <reference types="jest" />

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { ThemeProvider, useTheme, useThemeStore, resetThemeStore } from '@/src/app/providers/ThemeProvider';
import { renderWithProviders } from '@/src/shared/test';

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

afterEach(async () => {
  await resetThemeStore();
});

describe('theme foundations', () => {
  it('deberia aplicar la clase dark cuando el usuario activa el toggle de tema', async () => {
    renderWithProviders(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>,
    );

    expect(screen.getByTestId('theme-mode').props.children).toBe('light');

    fireEvent.press(screen.getByLabelText('Toggle theme'));

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
    });
  });

  it('deberia conservar el tema oscuro cuando la app se reinicia', async () => {
    await AsyncStorage.setItem(
      'theme:v1',
      JSON.stringify({ state: { mode: 'dark' }, version: 0 }),
    );

    await act(async () => {
      await useThemeStore.persist.rehydrate();
    });

    renderWithProviders(
      <ThemeProvider>
        <ThemeTestComponent />
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('theme-mode').props.children).toBe('dark');
    });
  });
});
