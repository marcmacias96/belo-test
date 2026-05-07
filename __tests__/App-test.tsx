/// <reference types="jest" />

import { render, screen, waitFor } from '@testing-library/react-native';

import App from '../App';

describe('App', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    jest.clearAllMocks();
    global.fetch = originalFetch;
  });

  it('renders the market example', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 64000,
        },
      ],
    }) as unknown as typeof fetch;

    render(<App />);

    expect(await screen.findByText('Market (CoinGecko)')).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Bitcoin (BTC)')).toBeTruthy();
    });
  });
});
