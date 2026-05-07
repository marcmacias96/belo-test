/// <reference types="jest" />

import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '@/src/navigation';
import { renderWithAppShell } from '@/src/shared/test';

const originalFetch = globalThis.fetch;

describe('navigation foundations', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('deberia mostrar Home cuando la app monta', async () => {
    renderWithAppShell(<RootNavigator />);

    expect(await screen.findByTestId('portfolio-screen')).toBeTruthy();
  });

  it('deberia navegar a Notifications cuando el usuario presiona el icono del header', async () => {
    renderWithAppShell(<RootNavigator />);

    await screen.findByTestId('portfolio-screen');

    const notificationsButton = screen.getByRole('button', { name: 'Open notifications' });

    fireEvent.press(notificationsButton);

    await waitFor(() => {
      expect(screen.getByTestId('notifications-list')).toBeTruthy();
    });
  });

  it('deberia navegar a PriceAlerts desde el acceso rapido en Notifications', async () => {
    renderWithAppShell(<RootNavigator />);

    await screen.findByTestId('portfolio-screen');

    fireEvent.press(screen.getByRole('button', { name: 'Open notifications' }));
    await screen.findByTestId('notifications-list');

    fireEvent.press(screen.getByRole('button', { name: 'Manage price alerts' }));

    await waitFor(() => {
      expect(screen.getByTestId('price-alerts-screen')).toBeTruthy();
    });
  });

  it('deberia abrir CoinDetails con el coinId en params cuando se navega desde un stack interno', async () => {
    const { navigationRef } = renderWithAppShell(<RootNavigator />);

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    act(() => {
      navigationRef.navigate('CoinDetails', { coinId: 'bitcoin' });
    });

    await waitFor(() => {
      expect(screen.getByTestId('coin-details-skeleton')).toBeTruthy();
    });
  });

  it('deberia abrir Swap desde el stack interno cuando se dispara la navegacion', async () => {
    const { navigationRef } = renderWithAppShell(<RootNavigator />);

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    act(() => {
      navigationRef.navigate('Swap', undefined);
    });

    await waitFor(() => {
      expect(screen.getByTestId('swap-screen')).toBeTruthy();
    });
  });
});
