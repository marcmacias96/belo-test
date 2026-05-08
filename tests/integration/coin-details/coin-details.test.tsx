/// <reference types="jest" />

import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { RootNavigator } from '@/src/navigation';
import { CoinDetailsScreen } from '@/src/features/coin-details';
import {
  resetTransactionsStoreAndStorage,
  useTransactionsStore,
} from '@/src/features/swap/state/useTransactionsStore';
import { actAsync, renderWithAppShell } from '@/src/shared/test';
import {
  coinHistoryEmpty,
  coinHistorySuccess,
  coinPriceSuccess,
} from '@/src/shared/test/fixtures/coin-details';
import { WALLET_FIXTURES } from '@/src/shared/test/fixtures/wallet';
import { resetWalletStoreAndStorage } from '@/src/features/wallet/state/useWalletStore';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type MockFetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

function createJsonResponse(payload: unknown): MockFetchResponse {
  return { ok: true, status: 200, json: async () => payload };
}

function createErrorResponse(status = 500): MockFetchResponse {
  return { ok: false, status, json: async () => ({}) };
}

/** Mocks fetch to return coin price + history for the success scenario. */
function mockCoinSuccess(pricesOverride?: [number, number][]) {
  const historyPrices = pricesOverride ?? coinHistorySuccess;
  globalThis.fetch = jest.fn().mockImplementation((url: string) => {
    if ((url as string).includes('/simple/price')) {
      return Promise.resolve(createJsonResponse(coinPriceSuccess));
    }
    if ((url as string).includes('/market_chart')) {
      return Promise.resolve(createJsonResponse({ prices: historyPrices }));
    }
    return Promise.resolve(createJsonResponse([]));
  }) as unknown as typeof fetch;
}

/** Renders CoinDetailsScreen with given coinId inside a test navigator. */
function renderCoinDetailsScreen(coinId: string) {
  const Stack = createNativeStackNavigator<{ CoinDetails: { coinId: string } }>();
  return renderWithAppShell(
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoinDetails" component={CoinDetailsScreen} initialParams={{ coinId }} />
    </Stack.Navigator>,
  );
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('coin-details integration', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    await actAsync(async () => {
      await resetWalletStoreAndStorage();
      await resetTransactionsStoreAndStorage();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('deberia mostrar el precio actual y spread bid/ask cuando los datos cargan correctamente', async () => {
    mockCoinSuccess();

    renderCoinDetailsScreen('bitcoin');

    // Current price from fixture: 65_432.10
    expect(await screen.findByTestId('coin-price-current')).toBeTruthy();
    expect(screen.getByText('$65,432.10')).toBeTruthy();

    // Ask = 65_432.10 * 1.005 = 65_759.26
    expect(screen.getByTestId('coin-price-ask')).toBeTruthy();

    // Bid = 65_432.10 * 0.995 = 65_105.03
    expect(screen.getByTestId('coin-price-bid')).toBeTruthy();

    // Change label visible
    expect(screen.getByTestId('coin-price-change')).toBeTruthy();
    expect(screen.getByText('+2.45%')).toBeTruthy();
  });

  it('deberia mostrar el chart de precio y el estado vacio de transacciones cuando no hay swaps para la moneda', async () => {
    mockCoinSuccess();

    renderCoinDetailsScreen('bitcoin');

    expect(await screen.findByTestId('coin-transactions-empty')).toBeTruthy();
    expect(screen.getByTestId('coin-history-chart')).toBeTruthy();
  });

  it('deberia mostrar las transacciones swap relacionadas a la moneda en CoinDetails', async () => {
    mockCoinSuccess();
    useTransactionsStore.setState({
      transactions: [
        {
          id: 'tx-1',
          fromId: 'bitcoin',
          toId: 'ethereum',
          fromAmount: 0.01,
          toAmount: 0.3333,
          priceIn: 100_000,
          priceOut: 3_000,
          executedAt: '2026-05-07T12:00:00.000Z',
        },
        {
          id: 'tx-2',
          fromId: 'usdt',
          toId: 'bitcoin',
          fromAmount: 500,
          toAmount: 0.005,
          priceIn: 1,
          priceOut: 100_000,
          executedAt: '2026-05-07T12:10:00.000Z',
        },
        {
          id: 'tx-3',
          fromId: 'usdc',
          toId: 'dai',
          fromAmount: 40,
          toAmount: 40,
          priceIn: 1,
          priceOut: 1,
          executedAt: '2026-05-07T12:20:00.000Z',
        },
      ],
    });

    renderCoinDetailsScreen('bitcoin');

    expect(await screen.findByTestId('coin-transactions-list')).toBeTruthy();
    expect(screen.getByText('0.0100 BTC -> 0.3333 ETH')).toBeTruthy();
    expect(screen.getByText('500.0000 USDT -> 0.0050 BTC')).toBeTruthy();
    expect(screen.queryByText('40.0000 USDC -> 40.0000 DAI')).toBeNull();
  });

  it('deberia mostrar skeleton mientras los datos de la moneda se obtienen', async () => {
    // Fetch never resolves — query stays in pending state
    globalThis.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as unknown as typeof fetch;

    renderCoinDetailsScreen('bitcoin');

    expect(await screen.findByTestId('coin-details-skeleton')).toBeTruthy();
  });

  it('deberia mostrar error con CTA de reintento cuando falla la peticion de precio', async () => {
    globalThis.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve(createErrorResponse(503)),
    ) as unknown as typeof fetch;

    renderCoinDetailsScreen('bitcoin');

    expect(await screen.findByTestId('coin-details-error')).toBeTruthy();
    expect(screen.getByText('Could not load coin data.')).toBeTruthy();
    expect(screen.getByLabelText('Retry loading coin data')).toBeTruthy();
  });

  it('deberia reintentar y mostrar los datos cuando el usuario presiona reintento', async () => {
    let callCount = 0;
    globalThis.fetch = jest.fn().mockImplementation((url: string) => {
      callCount += 1;
      if (callCount <= 2) {
        // First round: both queries fail
        return Promise.resolve(createErrorResponse(500));
      }
      // Retry round: success
      if ((url as string).includes('/simple/price')) {
        return Promise.resolve(createJsonResponse(coinPriceSuccess));
      }
      return Promise.resolve(createJsonResponse({ prices: coinHistorySuccess }));
    }) as unknown as typeof fetch;

    renderCoinDetailsScreen('bitcoin');

    const retryButton = await screen.findByLabelText('Retry loading coin data');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(screen.getByTestId('coin-price-current')).toBeTruthy();
      expect(screen.getByText('$65,432.10')).toBeTruthy();
    });
  });

  it('deberia mostrar estado vacio de historial cuando no hay datos de las ultimas 24h', async () => {
    mockCoinSuccess(coinHistoryEmpty);

    renderCoinDetailsScreen('bitcoin');

    // Price header should still be visible
    expect(await screen.findByTestId('coin-price-current')).toBeTruthy();

    // History empty state
    expect(screen.getByTestId('coin-transactions-empty')).toBeTruthy();
    expect(screen.getByText('No swap transactions yet for this coin.')).toBeTruthy();

    // Chart should not render when empty
    expect(screen.queryByTestId('coin-history-chart')).toBeNull();
  });

  it('deberia resolver aliases de asset id (usdt/usdc) para CoinGecko', async () => {
    let requestedPriceUrl = '';
    let requestedHistoryUrl = '';
    globalThis.fetch = jest.fn().mockImplementation((url: string) => {
      if ((url as string).includes('/simple/price')) {
        requestedPriceUrl = url;
        return Promise.resolve(
          createJsonResponse({
            tether: { usd: 1, usd_24h_change: 0.03 },
          }),
        );
      }
      if ((url as string).includes('/market_chart')) {
        requestedHistoryUrl = url;
        return Promise.resolve(createJsonResponse({ prices: coinHistorySuccess }));
      }
      return Promise.resolve(createJsonResponse([]));
    }) as unknown as typeof fetch;

    renderCoinDetailsScreen('usdt');

    const currentPrice = await screen.findByTestId('coin-price-current');
    expect(currentPrice).toBeTruthy();
    expect(requestedPriceUrl).toContain('ids=tether');
    expect(requestedHistoryUrl).toContain('/coins/tether/market_chart');
  });

  it('deberia navegar a CoinDetails desde PortfolioAssetRow cuando el usuario presiona una fila', async () => {
    globalThis.fetch = jest.fn().mockImplementation((url: string) => {
      if ((url as string).includes('/simple/price') && (url as string).includes('bitcoin')) {
        return Promise.resolve(createJsonResponse(coinPriceSuccess));
      }
      if ((url as string).includes('/market_chart')) {
        return Promise.resolve(createJsonResponse({ prices: coinHistorySuccess }));
      }
      // Portfolio prices endpoint
      return Promise.resolve(createJsonResponse(WALLET_FIXTURES.portfolioPricesSuccess));
    }) as unknown as typeof fetch;

    const { navigationRef } = renderWithAppShell(<RootNavigator />);

    await waitFor(() => expect(navigationRef.isReady()).toBe(true));

    // Portfolio is the default tab — wait for Bitcoin row
    const bitcoinRow = await screen.findByLabelText('View Bitcoin details');
    fireEvent.press(bitcoinRow);

    await waitFor(() => {
      expect(screen.getByTestId('coin-price-name')).toBeTruthy();
    });
  });
});
