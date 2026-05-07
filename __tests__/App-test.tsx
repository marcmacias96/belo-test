/// <reference types="jest" />

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import App from '../App';
import { WALLET_FIXTURES } from '@/src/shared/test/fixtures/wallet';

describe('App', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('renders the portfolio screen on launch and shows asset balances', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => WALLET_FIXTURES.portfolioPricesSuccess,
    }) as unknown as typeof fetch;

    render(<App />);

    // App starts on Portfolio tab
    expect(await screen.findByTestId('portfolio-screen')).toBeTruthy();

    // Portfolio shows asset names once prices load
    await waitFor(() => {
      expect(screen.getByText('Bitcoin')).toBeTruthy();
      expect(screen.getByText('Ethereum')).toBeTruthy();
    });
  });

  it('navigates to Notifications tab when user presses the tab', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => WALLET_FIXTURES.portfolioPricesSuccess,
    }) as unknown as typeof fetch;

    render(<App />);

    await screen.findByTestId('portfolio-screen');

    const notificationsTab = screen.getByLabelText('Notifications, tab, 2 of 2');
    fireEvent.press(notificationsTab);

    await waitFor(() => {
      expect(screen.getByTestId('notifications-list')).toBeTruthy();
    });
  });
});
