/// <reference types="jest" />

import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { SwapScreen } from '@/src/features/swap';
import {
  resetTransactionsStoreAndStorage,
  useTransactionsStore,
} from '@/src/features/swap/state/useTransactionsStore';
import {
  resetWalletStoreAndStorage,
  useWalletStore,
} from '@/src/features/wallet/state/useWalletStore';
import { swapEventEmitter } from '@/src/shared/events/swapEvents';
import { actAsync, renderWithProviders } from '@/src/shared/test';
import { SWAP_FIXTURES } from '@/src/shared/test/fixtures/swap';

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

function mockSwapPricesSuccess() {
  globalThis.fetch = jest
    .fn()
    .mockResolvedValue(
      createJsonResponse(SWAP_FIXTURES.swapPricesSuccess),
    ) as unknown as typeof fetch;
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('swap integration', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    await actAsync(async () => {
      await resetWalletStoreAndStorage();
      await resetTransactionsStoreAndStorage();
    });
    swapEventEmitter._reset();
  });

  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
    swapEventEmitter._reset();
  });

  it('deberia mostrar la previa del swap con el monto de salida calculado cuando el usuario ingresa un monto valido', async () => {
    mockSwapPricesSuccess();

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    const input = await screen.findByLabelText('Swap amount input');
    fireEvent.changeText(input, '0.02');

    // 0.02 BTC * 100_000 / 3_000 = 0.6666... ETH
    const previewOutput = await screen.findByTestId('swap-preview-output-amount');
    expect(previewOutput).toBeTruthy();
    expect(previewOutput.props.children).toEqual(expect.arrayContaining([expect.stringMatching(/0\.66/)]));

  });

  it('deberia actualizar los balances del portfolio inmediatamente tras un swap exitoso', async () => {
    mockSwapPricesSuccess();

    const initialBitcoin = useWalletStore.getState().holdings.bitcoin; // 0.05

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    const input = await screen.findByLabelText('Swap amount input');
    fireEvent.changeText(input, '0.01');

    const confirmButton = await screen.findByLabelText('Confirm Swap');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(useWalletStore.getState().holdings.bitcoin).toBeCloseTo(initialBitcoin - 0.01, 5);
    });

    // Ethereum balance should have increased
    const expectedEthGain = (0.01 * 100_000) / 3_000; // ~0.3333 ETH
    await waitFor(() => {
      expect(useWalletStore.getState().holdings.ethereum).toBeCloseTo(
        1.5 + expectedEthGain,
        3,
      );
    });
  });

  it('deberia registrar la transaccion en useTransactionsStore tras un swap exitoso', async () => {
    mockSwapPricesSuccess();

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    const input = await screen.findByLabelText('Swap amount input');
    fireEvent.changeText(input, '0.01');

    const confirmButton = await screen.findByLabelText('Confirm Swap');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const { transactions } = useTransactionsStore.getState();
      expect(transactions).toHaveLength(1);
      expect(transactions[0].fromId).toBe('bitcoin');
      expect(transactions[0].toId).toBe('ethereum');
      expect(transactions[0].fromAmount).toBeCloseTo(0.01, 5);
      expect(transactions[0].priceIn).toBe(100_000);
      expect(transactions[0].priceOut).toBe(3_000);
    });
  });

  it('deberia mostrar error de validacion cuando el usuario no tiene saldo suficiente', async () => {
    mockSwapPricesSuccess();

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    const input = await screen.findByLabelText('Swap amount input');
    // Initial bitcoin balance is 0.05; trying to swap 100 BTC
    fireEvent.changeText(input, '100');

    expect(await screen.findByTestId('swap-validation-error')).toBeTruthy();
    expect(screen.getByText('Insufficient balance')).toBeTruthy();
    expect(input.props.className).toContain('border-destructive');
  });

  it('deberia cargar el saldo total al presionar MAX', async () => {
    mockSwapPricesSuccess();

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    const maxButton = await screen.findByLabelText('Use max swap amount');
    fireEvent.press(maxButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('0.05')).toBeTruthy();
    });
  });

  it('deberia cargar el porcentaje seleccionado al presionar un chip', async () => {
    mockSwapPricesSuccess();

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    const fiftyPercentButton = await screen.findByLabelText('Use 50% swap amount');
    fireEvent.press(fiftyPercentButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('0.025')).toBeTruthy();
    });
    expect(screen.getByLabelText('Use 50% swap amount').props.accessibilityState.selected).toBe(true);
  });

  it('deberia mostrar error de validacion cuando el monto equivale a menos de 1 USD', async () => {
    mockSwapPricesSuccess();

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    const input = await screen.findByLabelText('Swap amount input');
    // 0.000001 BTC * 100_000 = $0.1 USD — below $1 minimum
    fireEvent.changeText(input, '0.000001');

    expect(await screen.findByTestId('swap-validation-error')).toBeTruthy();
    expect(screen.getByText('Minimum swap is $1 USD')).toBeTruthy();
  });

  it('deberia mostrar error de validacion cuando los activos de origen y destino son iguales', async () => {
    // No fetch needed — same-asset check is immediate
    globalThis.fetch = jest.fn().mockReturnValue(new Promise(() => {})) as unknown as typeof fetch;

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="bitcoin" />);

    expect(await screen.findByTestId('swap-validation-error')).toBeTruthy();
    expect(screen.getByText('From and To assets must be different')).toBeTruthy();
  });

  it('deberia mostrar error con CTA de reintento cuando falla la peticion de precios para el swap', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValue(SWAP_FIXTURES.swapPricesError) as unknown as typeof fetch;

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    expect(await screen.findByTestId('swap-prices-error')).toBeTruthy();
    expect(screen.getByText('Could not load swap prices.')).toBeTruthy();
    expect(screen.getByLabelText('Retry loading swap prices')).toBeTruthy();
  });

  it('deberia reintentar la obtencion de precios y completar el swap cuando el usuario presiona reintentar', async () => {
    globalThis.fetch = jest
      .fn()
      .mockRejectedValueOnce(SWAP_FIXTURES.swapPricesError)
      .mockResolvedValue(
        createJsonResponse(SWAP_FIXTURES.swapPricesSuccess),
      ) as unknown as typeof fetch;

    renderWithProviders(<SwapScreen fromId="bitcoin" toId="ethereum" />);

    const retryButton = await screen.findByLabelText('Retry loading swap prices');
    act(() => {
      fireEvent.press(retryButton);
    });

    // After retry, prices load — type amount and confirm
    const input = await screen.findByLabelText('Swap amount input');
    fireEvent.changeText(input, '0.01');

    const confirmButton = await screen.findByLabelText('Confirm Swap');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      const { transactions } = useTransactionsStore.getState();
      expect(transactions).toHaveLength(1);
    });
  });
});
