/// <reference types="jest" />

import { act, screen, waitFor } from '@testing-library/react-native';

import { RootNavigator } from '@/src/navigation';
import { PortfolioScreen } from '@/src/features/wallet';
import { SwapScreen } from '@/src/features/swap';
import {
  resetWalletStoreAndStorage,
  useWalletStore,
} from '@/src/features/wallet/state/useWalletStore';
import { resetTransactionsStoreAndStorage } from '@/src/features/swap/state/useTransactionsStore';
import { WALLET_FIXTURES } from '@/src/shared/test/fixtures/wallet';
import { renderWithProviders, renderWithAppShell } from '@/src/shared/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchSuccess(payload: unknown) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

function mockFetchPending() {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  globalThis.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as unknown as typeof fetch;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('a11y integration', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    await resetWalletStoreAndStorage();
    await resetTransactionsStoreAndStorage();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
    await resetWalletStoreAndStorage();
    await resetTransactionsStoreAndStorage();
  });

  // -------------------------------------------------------------------------
  // Test 1: SwapConfirmButton accessible by label
  // -------------------------------------------------------------------------

  it('deberia encontrar el boton de confirmar swap por su accessibilityLabel', async () => {
    mockFetchPending();

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    // SwapConfirmButton is always rendered (disabled initially)
    const confirmButton = screen.getByRole('button', { name: 'Confirm Swap' });
    expect(confirmButton).toBeTruthy();

    // Should expose accessibilityState disabled when prices not loaded
    expect(confirmButton.props.accessibilityState?.disabled).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Test 2: Portfolio rows accessible by role
  // -------------------------------------------------------------------------

  it('deberia encontrar todas las filas de assets por su accessibilityRole en el portfolio', async () => {
    mockFetchSuccess(WALLET_FIXTURES.portfolioPricesSuccess);

    // Ensure wallet has non-zero holdings (default initial state)
    act(() => {
      useWalletStore.setState({
        holdings: { bitcoin: 0.05, ethereum: 1.5, usdt: 1000, usdc: 500, dai: 500 },
      });
    });

    renderWithProviders(<PortfolioScreen />);

    // Wait for prices to load and rows to render
    await screen.findByText('Bitcoin');

    // Each PortfolioAssetRow has accessibilityRole="button"
    const assetButtons = screen.getAllByRole('button', { name: /View .* details/i });
    expect(assetButtons.length).toBeGreaterThanOrEqual(5);

    // All rows should have descriptive labels
    expect(screen.getByRole('button', { name: 'View Bitcoin details' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'View Ethereum details' })).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Test 3: Header notifications action accessible by role
  // -------------------------------------------------------------------------

  it('deberia encontrar el boton de notificaciones en el header', async () => {
    // Mock empty responses for all screens
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [],
    }) as unknown as typeof fetch;

    renderWithAppShell(<RootNavigator />);

    // Wait for Home to render
    await screen.findByTestId('portfolio-screen');

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open notifications' })).toBeTruthy();
    });
  });
});
