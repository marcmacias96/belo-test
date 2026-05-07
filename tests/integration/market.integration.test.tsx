/// <reference types="jest" />

import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { MarketScreen } from '@/src/features/market';
import { resetMarketPreferencesStore } from '@/src/features/market/state/useMarketPreferencesStore';
import { renderWithProviders } from '@/src/shared/test';

type MockFetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createJsonResponse(payload: unknown): MockFetchResponse {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

function createErrorResponse(status = 500): MockFetchResponse {
  return {
    ok: false,
    status,
    json: async () => ({}),
  };
}

describe('market integration', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
    act(() => {
      resetMarketPreferencesStore();
    });
  });

  it('renders market assets when request succeeds', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      createJsonResponse([
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 64000,
        },
      ]),
    ) as unknown as typeof fetch;

    renderWithProviders(<MarketScreen />);

    expect(await screen.findByText('Bitcoin (BTC)')).toBeTruthy();
    expect(screen.getByText('$64,000.00')).toBeTruthy();
  });

  it('shows empty state when API returns no assets', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(createJsonResponse([])) as unknown as typeof fetch;

    renderWithProviders(<MarketScreen />);

    expect(await screen.findByText('No market assets available.')).toBeTruthy();
  });

  it('shows error state when API request fails', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(createErrorResponse(503)) as unknown as typeof fetch;

    renderWithProviders(<MarketScreen />);

    expect(await screen.findByText('Could not load market data.')).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('recovers from error after tapping retry', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValueOnce(createErrorResponse(500))
      .mockResolvedValueOnce(
        createJsonResponse([
          {
            id: 'ethereum',
            symbol: 'eth',
            name: 'Ethereum',
            current_price: 3200,
          },
        ]),
      ) as unknown as typeof fetch;

    renderWithProviders(<MarketScreen />);

    const retryButton = await screen.findByText('Retry');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Ethereum (ETH)')).toBeTruthy();
      expect(screen.getByText('$3,200.00')).toBeTruthy();
    });
  });

  it('filters by favorites using shared market preferences store', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue(
      createJsonResponse([
        {
          id: 'bitcoin',
          symbol: 'btc',
          name: 'Bitcoin',
          current_price: 64000,
        },
        {
          id: 'ethereum',
          symbol: 'eth',
          name: 'Ethereum',
          current_price: 3200,
        },
      ]),
    ) as unknown as typeof fetch;

    renderWithProviders(<MarketScreen />);

    expect(await screen.findByText('Bitcoin (BTC)')).toBeTruthy();
    expect(screen.getByText('Ethereum (ETH)')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Toggle BTC favorite'));
    fireEvent.press(screen.getByLabelText('Toggle favorites only'));

    await waitFor(() => {
      expect(screen.getByText('Bitcoin (BTC)')).toBeTruthy();
      expect(screen.queryByText('Ethereum (ETH)')).toBeNull();
    });
  });
});
