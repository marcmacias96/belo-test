/// <reference types="jest" />

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { PortfolioScreen } from '@/src/features/wallet';
import {
  resetWalletStore,
  resetWalletStoreAndStorage,
  useWalletStore,
} from '@/src/features/wallet/state/useWalletStore';
import { renderWithProviders } from '@/src/shared/test';
import { WALLET_FIXTURES } from '@/src/shared/test/fixtures/wallet';

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

describe('wallet portfolio integration', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    await resetWalletStoreAndStorage();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
    await resetWalletStoreAndStorage();
  });

  it('deberia mostrar el balance total en USD cuando los precios cargan correctamente', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        createJsonResponse(WALLET_FIXTURES.portfolioPricesSuccess),
      ) as unknown as typeof fetch;

    renderWithProviders(<PortfolioScreen />);

    // bitcoin 0.05 * 64000 = 3200, ethereum 1.5 * 3200 = 4800
    // usdt 1000 * 1 = 1000, usdc 500 * 1 = 500, dai 500 * 1 = 500 → total = 10000
    expect(await screen.findByText('$10,000.00')).toBeTruthy();
  });

  it('deberia mostrar la lista de assets con sus holdings cuando los precios cargan', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        createJsonResponse(WALLET_FIXTURES.portfolioPricesSuccess),
      ) as unknown as typeof fetch;

    renderWithProviders(<PortfolioScreen />);

    expect(await screen.findByText('Bitcoin')).toBeTruthy();
    expect(screen.getByText('Ethereum')).toBeTruthy();
    expect(screen.getByText('Tether')).toBeTruthy();

    // holdings amounts
    expect(screen.getByText('0.05 BTC')).toBeTruthy();
    expect(screen.getByText('1.50 ETH')).toBeTruthy();
  });

  it('deberia mostrar skeleton de carga mientras los precios se obtienen', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    globalThis.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as unknown as typeof fetch;

    renderWithProviders(<PortfolioScreen />);

    expect(screen.getByTestId('portfolio-skeleton-list')).toBeTruthy();
  });

  it('deberia mostrar error con CTA de reintento cuando falla la peticion de precios', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(WALLET_FIXTURES.portfolioPricesError) as unknown as typeof fetch;

    renderWithProviders(<PortfolioScreen />);

    expect(await screen.findByText('Could not load prices.')).toBeTruthy();
    expect(screen.getByText('Retry')).toBeTruthy();
  });

  it('deberia reintentar y mostrar el balance cuando el usuario presiona reintento', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValueOnce(WALLET_FIXTURES.portfolioPricesError)
      .mockResolvedValueOnce(
        createJsonResponse(WALLET_FIXTURES.portfolioPricesSuccess),
      ) as unknown as typeof fetch;

    renderWithProviders(<PortfolioScreen />);

    const retryButton = await screen.findByText('Retry');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(screen.getByText('$10,000.00')).toBeTruthy();
    });
  });

  it('deberia mostrar holdings en cero sin total cuando los saldos son todos cero', async () => {
    act(() => {
      useWalletStore.setState({
        holdings: { usdt: 0, usdc: 0, dai: 0, bitcoin: 0, ethereum: 0 },
      });
    });

    renderWithProviders(<PortfolioScreen />);

    expect(await screen.findByText('No assets in your portfolio yet.')).toBeTruthy();
    expect(screen.queryByTestId('portfolio-total-balance')).toBeNull();
  });

  it('deberia rehidratar los holdings persistidos cuando el componente se vuelve a montar', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        createJsonResponse(WALLET_FIXTURES.portfolioPricesSuccess),
      ) as unknown as typeof fetch;

    // Reset in-memory store first (so the subsequent persist-write to storage uses initial values)
    act(() => {
      resetWalletStore();
    });

    // Now overwrite AsyncStorage with modified holdings (simulating a previous session's data)
    const modifiedHoldings = {
      usdt: 2000,
      usdc: 500,
      dai: 500,
      bitcoin: 0.05,
      ethereum: 1.5,
    };
    await AsyncStorage.setItem(
      'wallet:v1',
      JSON.stringify({ state: { holdings: modifiedHoldings }, version: 0 }),
    );

    // Rehydrate from AsyncStorage (simulating app restart that loads persisted data)
    await act(async () => {
      await useWalletStore.persist.rehydrate();
    });

    renderWithProviders(<PortfolioScreen />);

    // usdt 2000 formatted as "2,000.00 USDT"
    expect(await screen.findByText('2,000.00 USDT')).toBeTruthy();
  });
});
