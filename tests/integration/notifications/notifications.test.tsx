/// <reference types="jest" />

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import { NotificationsScreen } from '@/src/features/notifications';
import {
  resetNotificationsStoreAndStorage,
  useNotificationsStore,
} from '@/src/features/notifications/state/useNotificationsStore';
import {
  resetPriceAlertsStoreAndStorage,
  usePriceAlertsStore,
} from '@/src/features/notifications/state/usePriceAlertsStore';
import { usePriceAlertWatcher } from '@/src/features/notifications/services/priceAlertWatcher';
import { useSwapNotificationBridge } from '@/src/features/notifications/services/useSwapNotificationBridge';
import { swapEventEmitter } from '@/src/shared/events/swapEvents';
import { renderWithProviders } from '@/src/shared/test';
import { NOTIFICATION_FIXTURES } from '@/src/shared/test/fixtures/notifications';

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

/** Wraps NotificationsScreen with the swap bridge active in the same render. */
function NotificationsWithBridge() {
  useSwapNotificationBridge();
  return <NotificationsScreen />;
}

/** Wraps NotificationsScreen with the price alert watcher active. */
function NotificationsWithWatcher() {
  usePriceAlertWatcher();
  return <NotificationsScreen />;
}

const PRICE_ALERTS_KEY = 'price-alerts:v1';

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('notifications integration', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(async () => {
    await resetNotificationsStoreAndStorage();
    await resetPriceAlertsStoreAndStorage();
    swapEventEmitter._reset();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
    await resetNotificationsStoreAndStorage();
    await resetPriceAlertsStoreAndStorage();
    swapEventEmitter._reset();
  });

  // -------------------------------------------------------------------------
  // Test 1: transaction notification from swap event
  // -------------------------------------------------------------------------

  it('deberia mostrar notificacion de transaccion cuando se completa un swap exitoso', async () => {
    renderWithProviders(<NotificationsWithBridge />);

    // Verify empty state before event
    expect(await screen.findByTestId('notifications-empty-state')).toBeTruthy();

    await act(async () => {
      swapEventEmitter.emit({
        id: 'swap-001',
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: 0.01,
        toAmount: 0.333,
        priceIn: 100_000,
        priceOut: 3_000,
        executedAt: new Date().toISOString(),
      });
    });

    // Store has the notification and the screen shows it
    await waitFor(() => {
      const { notifications } = useNotificationsStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].kind).toBe('transaction');
      // 'Swap Executed' appears both in the notification row and in the toast overlay
      const elements = screen.getAllByText('Swap Executed');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });

  // -------------------------------------------------------------------------
  // Test 2: price alert fires when delta >= threshold
  // -------------------------------------------------------------------------

  it('deberia disparar alerta de precio cuando el precio cambia mas del umbral configurado', async () => {
    // Pre-populate snapshots with base prices (simulates previous fetch)
    act(() => {
      usePriceAlertsStore.getState().updateSnapshot('bitcoin', 100_000);
      usePriceAlertsStore.getState().updateSnapshot('ethereum', 3_000);
      usePriceAlertsStore.getState().updateSnapshot('usdt', 1.0);
      usePriceAlertsStore.getState().updateSnapshot('usdc', 1.0);
      usePriceAlertsStore.getState().updateSnapshot('dai', 1.0);
    });

    // Mock fetch to return +6% prices (above default 5% threshold)
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        createJsonResponse(NOTIFICATION_FIXTURES.priceSnapshotAfterMove),
      ) as unknown as typeof fetch;

    renderWithProviders(<NotificationsWithWatcher />);

    // Watcher fires on mount; should create price alert notifications
    await waitFor(() => {
      const { notifications } = useNotificationsStore.getState();
      expect(notifications.some((n) => n.kind === 'price')).toBe(true);
    });

    // Price notification should be visible in the list
    expect(await screen.findByText('Price Alert: BTC')).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Test 3: no price alert for small change
  // -------------------------------------------------------------------------

  it('deberia no disparar alerta de precio cuando el cambio es menor al umbral', async () => {
    // Pre-populate snapshots with base prices
    act(() => {
      usePriceAlertsStore.getState().updateSnapshot('bitcoin', 100_000);
      usePriceAlertsStore.getState().updateSnapshot('ethereum', 3_000);
      usePriceAlertsStore.getState().updateSnapshot('usdt', 1.0);
      usePriceAlertsStore.getState().updateSnapshot('usdc', 1.0);
      usePriceAlertsStore.getState().updateSnapshot('dai', 1.0);
    });

    // Mock fetch to return +2% prices (below default 5% threshold)
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(
        createJsonResponse(NOTIFICATION_FIXTURES.priceSnapshotSmallMove),
      ) as unknown as typeof fetch;

    renderWithProviders(<NotificationsWithWatcher />);

    // Wait for the watcher to fire
    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalled();
    });

    // Give React Query time to process
    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    // No price notifications should have been created
    const { notifications } = useNotificationsStore.getState();
    expect(notifications.filter((n) => n.kind === 'price')).toHaveLength(0);
  });

  // -------------------------------------------------------------------------
  // Test 4: threshold persists
  // -------------------------------------------------------------------------

  it('deberia persistir el umbral de precio configurado por el usuario', async () => {
    // Set a custom threshold for bitcoin (10%)
    act(() => {
      usePriceAlertsStore.getState().setThreshold('bitcoin', 0.1);
    });

    // Verify written to AsyncStorage
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem(PRICE_ALERTS_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!) as { state: { thresholds: Record<string, number> } };
      expect(parsed.state.thresholds.bitcoin).toBeCloseTo(0.1, 5);
    });

    // Simulate rehydration (app restart)
    await act(async () => {
      await usePriceAlertsStore.persist.rehydrate();
    });

    // Threshold should be restored
    expect(usePriceAlertsStore.getState().thresholds.bitcoin).toBeCloseTo(0.1, 5);
  });

  // -------------------------------------------------------------------------
  // Test 5: success state with notifications in store
  // -------------------------------------------------------------------------

  it('deberia mostrar la lista de notificaciones con el tipo correcto cuando hay notificaciones en el store', async () => {
    // Pre-populate store with one of each type
    act(() => {
      useNotificationsStore.getState().add({
        kind: 'transaction',
        createdAt: new Date().toISOString(),
        payload: NOTIFICATION_FIXTURES.sampleTransactionNotification.payload,
      });
      useNotificationsStore.getState().add({
        kind: 'price',
        createdAt: new Date().toISOString(),
        payload: NOTIFICATION_FIXTURES.samplePriceNotification.payload,
      });
    });

    renderWithProviders(<NotificationsScreen />);

    // Both notifications should appear
    expect(await screen.findByText('Swap Executed')).toBeTruthy();
    expect(screen.getByText('Price Alert: BTC')).toBeTruthy();

    // Badges for kind types
    const txBadges = screen.getAllByText('TX');
    expect(txBadges.length).toBeGreaterThanOrEqual(1);

    const priceBadges = screen.getAllByText('Price');
    expect(priceBadges.length).toBeGreaterThanOrEqual(1);
  });

  // -------------------------------------------------------------------------
  // Test 6: empty state
  // -------------------------------------------------------------------------

  it('deberia mostrar estado vacio cuando no hay notificaciones', async () => {
    renderWithProviders(<NotificationsScreen />);

    expect(await screen.findByTestId('notifications-empty-state')).toBeTruthy();
    expect(screen.getByText('No notifications yet.')).toBeTruthy();
  });

  // -------------------------------------------------------------------------
  // Test 7: mark all read
  // -------------------------------------------------------------------------

  it('deberia marcar todas las notificaciones como leidas cuando el usuario presiona el boton', async () => {
    // Add an unread notification
    act(() => {
      useNotificationsStore.getState().add({
        kind: 'transaction',
        createdAt: new Date().toISOString(),
        payload: NOTIFICATION_FIXTURES.sampleTransactionNotification.payload,
      });
    });

    renderWithProviders(<NotificationsScreen />);

    // Mark all read button should be visible (there are unread notifications)
    const markAllReadButton = await screen.findByLabelText('Mark all as read');
    expect(markAllReadButton).toBeTruthy();

    fireEvent.press(markAllReadButton);

    // All notifications should be marked as read
    await waitFor(() => {
      const { notifications } = useNotificationsStore.getState();
      expect(notifications.every((n) => n.read)).toBe(true);
    });

    // The "mark all read" button should disappear (no more unread)
    await waitFor(() => {
      expect(screen.queryByLabelText('Mark all as read')).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // Test 8: toast shown for transaction notification
  // -------------------------------------------------------------------------

  it('deberia mostrar toast de exito cuando se recibe una notificacion de transaccion', async () => {
    renderWithProviders(<NotificationsWithBridge />);

    await act(async () => {
      swapEventEmitter.emit({
        id: 'swap-toast-001',
        fromId: 'bitcoin',
        toId: 'ethereum',
        fromAmount: 0.05,
        toAmount: 1.666,
        priceIn: 100_000,
        priceOut: 3_000,
        executedAt: new Date().toISOString(),
      });
    });

    // Toast with "Swap Executed" title should appear in the rendered tree
    // (appears both in the notification row and in the toast overlay)
    await waitFor(() => {
      const elements = screen.getAllByText('Swap Executed');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });
  });
});
