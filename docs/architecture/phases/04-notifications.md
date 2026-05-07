# Fase 4 — Notifications

## Objetivo

Entregar la pantalla `NotificationsScreen` con historial persistido, alertas de transaccion (post-swap) y alertas de precio configurables por umbral por activo. Incluir watcher periodico que compara precios contra snapshot y dispara notificaciones cuando el delta supera el threshold. Toast in-app + persistencia.

## Dependencias

- Fase 0 verde: persistencia, navegacion, toast.
- Fase 1 verde: `useWalletStore` para activos a vigilar.
- Fase 3 verde: `swapEvents.executed` y `useTransactionsStore`.

## Contrato visible

- El usuario abre el tab Notifications y ve el historial ordenado por fecha (mas reciente primero).
- Al ejecutar un swap exitoso, se agrega una notificacion `transaction` y aparece un toast.
- Si un activo varia mas de su threshold (default 5%) respecto al snapshot, se agrega una notificacion `price` y aparece un toast.
- El usuario puede configurar el threshold por activo desde la pantalla.
- El usuario puede marcar todas las notificaciones como leidas.
- Si no hay notificaciones, ve estado empty.
- Si el watcher falla, el historial sigue accesible y se muestra un mensaje no bloqueante.
- Tras reiniciar, el historial y los thresholds persisten.

## Estructura de carpetas

```txt
src/features/notifications/
  index.ts
  screens/
    NotificationsScreen.tsx
  components/
    NotificationRow.tsx
    NotificationEmptyState.tsx
    PriceAlertThresholdRow.tsx
    NotificationsHeader.tsx
    index.ts
  services/
    priceAlertWatcher.ts
  lib/
    formatNotification.ts
    computePriceDelta.ts
  state/
    useNotificationsStore.ts
    usePriceAlertsStore.ts
  types.ts
tests/integration/notifications/
  notifications.test.tsx
src/shared/test/fixtures/
  notifications.ts
```

## Tests de integracion a escribir primero

Frontera mockeada: precios via `src/shared/http`. Eventos: `swapEvents` real (no mock). Stores rehidratados: `useNotificationsStore` (`notifications:v1`), `usePriceAlertsStore` (`priceAlerts:v1`).

`tests/integration/notifications/notifications.test.tsx`:

- `it("deberia agregar una notificacion de transaccion y mostrar toast cuando swapEvents emite executed")` — success transaccional.
- `it("deberia agregar una notificacion de precio y mostrar toast cuando el delta supera el threshold")` — success precio (fixture con dos snapshots).
- `it("deberia ignorar el cambio de precio cuando el delta esta por debajo del threshold configurado")` — validacion threshold.
- `it("deberia respetar el threshold personalizado cuando el usuario lo modifica para un activo")` — configuracion.
- `it("deberia mostrar el estado vacio cuando no hay notificaciones")` — empty.
- `it("deberia marcar todas como leidas cuando el usuario presiona Marcar todo leido")` — interaccion.
- `it("deberia rehidratar el historial y los thresholds cuando la app reinicia")` — persistencia.
- `it("deberia mantener el historial accesible y mostrar mensaje cuando el watcher devuelve error")` — error watcher.

## Implementacion esperada

- `src/features/notifications/types.ts`: `NotificationKind = 'transaction' | 'price'`, `Notification = { id, kind, createdAt, read, payload }`, `PriceAlertThresholds = Record<AssetId, number>` (en porcentaje).
- `src/features/notifications/state/useNotificationsStore.ts`: `createPersistedStore` (key `notifications:v1`). API: `notifications: Notification[]`, `add(n)`, `markAllRead()`, `clear()`.
- `src/features/notifications/state/usePriceAlertsStore.ts`: `createPersistedStore` (key `priceAlerts:v1`). API: `thresholds: PriceAlertThresholds` (default 0.05 por activo), `setThreshold(id, pct)`, `getSnapshot(id)`, `setSnapshot(id, price)`, `snapshots: Record<AssetId, number>`.
- `src/features/notifications/services/priceAlertWatcher.ts`: hook `usePriceAlertWatcher()` montado en provider raiz. Usa `useQuery` con `refetchInterval: 60_000` sobre `/simple/price?ids=...`. En cada respuesta compara con `snapshots`, si `|delta%| >= threshold[id]` invoca `useNotificationsStore.add` con `kind: 'price'` y actualiza snapshot.
- Suscripcion a `swapEvents.subscribe('executed', tx => useNotificationsStore.add({ kind: 'transaction', payload: tx, ... }))` montada en provider raiz tambien.
- `src/features/notifications/lib/computePriceDelta.ts`: pura. `(current - snapshot) / snapshot`.
- `src/features/notifications/lib/formatNotification.ts`: traduce notificacion a texto via i18n namespace `notifications`.
- `src/features/notifications/components/NotificationRow.tsx`: usa `Card`, `Badge` para tipo, indicador de leido.
- `src/features/notifications/components/PriceAlertThresholdRow.tsx`: usa `Input` numerico para porcentaje.
- `src/features/notifications/screens/NotificationsScreen.tsx`: header con accion "Marcar todo leido", seccion de configuracion de thresholds y lista del historial.
- Toast: en cada `add` se invoca `useToast().info`/`success` segun `kind`.
- Wiring: `NotificationsScreen` en tab Notifications. Watcher montado dentro de `AppProviders` o de un `NotificationsBootstrap` componente.

## Estados UX cubiertos

- [ ] `loading` minimo (lista vacia mientras llega primer fetch).
- [ ] `error` con mensaje no bloqueante para watcher.
- [ ] `empty` con `NotificationEmptyState`.
- [ ] `success` con `NotificationRow` por entrada.

## Frontera mockeada y datos

- Fixture `/Users/marcmaciasdev/Desktop/belo_test/src/shared/test/fixtures/notifications.ts` con:
  - `priceSnapshotInitial` y `priceSnapshotAfterMove` (delta superior al 5%).
  - `priceSnapshotSmallMove` (delta del 1%).
  - `pricesError503`.
- Para tests del swap event, importar `swapEvents` real y emitir manualmente.
- Reset de stores con `resetPersistedStorage` en `beforeEach`.

## Criterios de cierre (DoD)

- [ ] Suite `npm test -- tests/integration/notifications` verde con los 8 `it` listados.
- [ ] `npm test` completo verde.
- [ ] `npm run lint` limpio.
- [ ] Watcher montado en provider raiz, no dentro de `NotificationsScreen`, para que opere fuera del tab.
- [ ] Persistencia validada con rehidratacion (historial + thresholds + snapshots).
- [ ] Sin mocks fuera de frontera HTTP. `swapEvents` se usa real.
- [ ] Toast in-app conectado via `useToast` (sin mock).

## Riesgos y mitigaciones

- Riesgo: `refetchInterval` flakey en tests. Mitigacion: usar `jest.useFakeTimers()` y avanzar tiempo controlado o invocar el watcher como funcion pura disparada manualmente en tests.
- Riesgo: spam de notificaciones por oscilaciones de precio. Mitigacion: actualizar snapshot solo tras disparar alerta, no en cada fetch.
- Riesgo: orden de montaje del watcher. Mitigacion: bootstrap en `AppProviders` con guard de `useEffect`.

## Reporte esperado del subagente

- Archivos creados/modificados con path absoluto.
- Tests agregados (it + escenario).
- Salidas de `npm test -- tests/integration/notifications`, `npm test`, `npm run lint`.
- Confirmacion de persistencia rehidratada.
- Contrato del watcher (intervalo, fuente de precios, regla de actualizacion de snapshot).
- Deuda diferida (ej: backoff exponencial del watcher, dedupe de alertas).

## Prompt listo para el subagente

```text
Eres un subagente que ejecuta la Fase 4 (Notifications) del proyecto Crypto Wallet Trading Simulator.

Lectura obligatoria:
1. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/phases/04-notifications.md
2. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/tdd-integration-vision.md
3. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/ui-work-rules.md
4. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/tdd-integration-playbook/SKILL.md
5. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/ui-feature-playbook/SKILL.md
6. Feature de referencia: /Users/marcmaciasdev/Desktop/belo_test/src/features/market/

Pre-condiciones: Fases 0, 1 y 3 cerradas. F2 recomendable para precios reusables.

Reglas:
- TDD red -> green -> refactor.
- Prohibido mockear hooks, providers, stores, swapEvents o React Navigation.
- Mock solo en /Users/marcmaciasdev/Desktop/belo_test/src/shared/http/.
- Watcher montado en AppProviders, no dentro de la pantalla.

Entregables:
- src/features/notifications/* completo.
- tests/integration/notifications/notifications.test.tsx con los `it` exactos del .md.
- Fixture src/shared/test/fixtures/notifications.ts.
- Wiring del watcher y suscripcion a swapEvents en AppProviders.

Validacion:
- `npm test -- tests/integration/notifications` verde.
- `npm test` verde sin regresiones.
- `npm run lint` limpio.

Reporte final:
1. Archivos creados/modificados (path absoluto).
2. Tests agregados (it + escenario).
3. Salidas de comandos.
4. Contrato del watcher y reglas de actualizacion de snapshot.
5. Deuda diferida.
```
