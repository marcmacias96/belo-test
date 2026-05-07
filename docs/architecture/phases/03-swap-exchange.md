# Fase 3 — Swap / Exchange

## Objetivo

Entregar la pantalla `SwapScreen` que permite intercambiar entre activos del portfolio aplicando precios reales, validaciones de saldo y minimo 1 USD, con actualizacion atomica del wallet, registro en `useTransactionsStore` persistido, y emision de evento consumible por Notifications (F4).

## Dependencias

- Fase 0 verde: navegacion, persistencia, retry HTTP, i18n, toast.
- Fase 1 verde: `useWalletStore` con `applySwap`.
- Fase 2 verde: `computeBuySellPrice` y precios via `fetchCoinPrice`.

## Contrato visible

- El usuario abre `SwapScreen` (desde tab oculto del stack o desde CoinDetails).
- El usuario selecciona activo origen y destino con un picker.
- El usuario ingresa monto en el origen y ve un preview con monto destino, precio aplicado y total en USD.
- El boton Swap se habilita solo si las validaciones pasan: saldo suficiente, monto valido, valor en USD >= 1, activos distintos.
- Al confirmar, el usuario ve toast de exito, los balances en Portfolio reflejan el cambio inmediatamente, y la transaccion queda persistida.
- Si hay error de red al obtener precios, el usuario ve mensaje + Retry.
- Si los datos persisten tras restart, el wallet conserva el saldo post-swap.

## Estructura de carpetas

```txt
src/features/swap/
  index.ts
  screens/
    SwapScreen.tsx
  components/
    SwapAssetPicker.tsx
    SwapAmountInput.tsx
    SwapPreviewCard.tsx
    SwapConfirmButton.tsx
    index.ts
  services/
    fetchSwapPrices.ts
    executeSwap.ts
  lib/
    computeSwap.ts
    validateSwap.ts
  state/
    useTransactionsStore.ts
  types.ts
src/shared/events/
  swapEvents.ts
tests/integration/swap/
  swap.test.tsx
src/shared/test/fixtures/
  swap.ts
```

## Tests de integracion a escribir primero

Frontera mockeada: endpoints de precios CoinGecko via `src/shared/http`. Stores rehidratados: `useWalletStore` y `useTransactionsStore` (`transactions:v1`).

`tests/integration/swap/swap.test.tsx`:

- `it("deberia actualizar holdings y registrar transaccion cuando el usuario confirma un swap valido")` — success.
- `it("deberia rehidratar holdings y transactions con los valores post-swap cuando se reinicia el render")` — persistencia.
- `it("deberia bloquear el boton Swap y mostrar mensaje cuando el saldo del activo origen es insuficiente")` — validacion saldo.
- `it("deberia bloquear el boton Swap y mostrar mensaje cuando el monto en USD es menor a 1")` — validacion minimo.
- `it("deberia bloquear el boton Swap cuando origen y destino son el mismo activo")` — validacion identidad.
- `it("deberia mostrar error y CTA Retry cuando la peticion de precios falla")` — error.
- `it("deberia recuperar el preview cuando se presiona Retry tras un error")` — retry.
- `it("deberia emitir un evento swap:executed con el payload del trade cuando el swap es exitoso")` — contrato para F4.

## Implementacion esperada

- `src/features/swap/types.ts`: `SwapInput { fromId, toId, fromAmount }`, `SwapPreview { fromAmount, toAmount, priceInUsd, priceOutUsd, valueUsd, spreadPct }`, `Transaction { id, fromId, toId, fromAmount, toAmount, priceInUsd, priceOutUsd, createdAt }`.
- `src/features/swap/lib/computeSwap.ts`: pura. `outputAmount = inputAmount * priceIn / priceOut`. Considera spread reusando `computeBuySellPrice` de F2 (sell para origen, buy para destino).
- `src/features/swap/lib/validateSwap.ts`: pura. Devuelve `{ ok: true } | { ok: false; reason: 'insufficient_balance' | 'below_minimum_usd' | 'same_asset' | 'invalid_amount' }`.
- `src/features/swap/services/fetchSwapPrices.ts`: obtiene precios de los dos activos en una sola llamada `/simple/price?ids=<from>,<to>&vs_currencies=usd`.
- `src/features/swap/services/executeSwap.ts`: orquesta `validateSwap` -> `useWalletStore.applySwap` -> `useTransactionsStore.add` -> emite `swapEvents.emit('executed', tx)`.
- `src/features/swap/state/useTransactionsStore.ts`: `createPersistedStore` (key `transactions:v1`). API: `transactions: Transaction[]`, `add(tx)`, `clear()`.
- `src/shared/events/swapEvents.ts`: emisor minimo (mitt o manual) `subscribe('executed', handler)`, `emit('executed', tx)`. Contrato de F4.
- `src/features/swap/screens/SwapScreen.tsx`: composicion en `ScreenLayout`, dos `SwapAssetPicker`, `SwapAmountInput`, `SwapPreviewCard`, `SwapConfirmButton`. Wiring con `useQuery` para precios, validaciones reactivas y toast de feedback.
- Navegacion: registrar `Swap` en `RootStackParamList` (Fase 0 ya lo dejo). Acceso desde `CoinBuySellRow` (F2 lo deja preparado) o desde un boton en Portfolio (opcional).

## Estados UX cubiertos

- [ ] `loading` durante fetch de precios.
- [ ] `error` con Retry.
- [ ] `empty` no aplica directamente; se cubre con boton deshabilitado y mensaje contextual cuando no hay activos.
- [ ] `success` con toast y refresh visible del Portfolio.

## Frontera mockeada y datos

- Fixture `/Users/marcmaciasdev/Desktop/belo_test/src/shared/test/fixtures/swap.ts` con escenarios:
  - `pricesSuccess` (BTC/USDT, ETH/USDC).
  - `pricesError`.
  - `pricesPartial` para validar manejo defensivo.
- Reset de `useWalletStore` y `useTransactionsStore` en `beforeEach` con `resetPersistedStorage`.

## Criterios de cierre (DoD)

- [ ] Suite `npm test -- tests/integration/swap` verde con los 8 `it` listados.
- [ ] `npm test` completo verde sin regresiones de Wallet, Coin Details ni Foundations.
- [ ] `npm run lint` sin warnings nuevos.
- [ ] `useTransactionsStore` persistido y rehidratado en test.
- [ ] `useWalletStore.applySwap` invocado de forma atomica (un solo `set`).
- [ ] `swapEvents` emite `executed` con payload tipado.
- [ ] Sin mocks fuera de frontera HTTP.

## Riesgos y mitigaciones

- Riesgo: condicion de carrera entre `applySwap` y `add` de transaccion. Mitigacion: orquestacion en `executeSwap` con secuencia clara y rollback documentado (deuda).
- Riesgo: precios viejos por cache. Mitigacion: `staleTime: 5_000` en query de Swap o `refetchOnMount: 'always'`.
- Riesgo: emisor de eventos en RN sin libreria. Mitigacion: implementacion manual minima en `src/shared/events/swapEvents.ts`.

## Reporte esperado del subagente

- Archivos creados/modificados con path absoluto.
- Tests agregados (it + escenario).
- Salidas de `npm test -- tests/integration/swap`, `npm test`, `npm run lint`.
- Confirmacion de persistencia rehidratada.
- Contrato del evento `swap:executed` documentado para F4.
- Deuda diferida.

## Prompt listo para el subagente

```text
Eres un subagente que ejecuta la Fase 3 (Swap / Exchange) del proyecto Crypto Wallet Trading Simulator.

Lectura obligatoria:
1. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/phases/03-swap-exchange.md
2. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/tdd-integration-vision.md
3. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/ui-work-rules.md
4. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/tdd-integration-playbook/SKILL.md
5. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/ui-feature-playbook/SKILL.md
6. Feature de referencia: /Users/marcmaciasdev/Desktop/belo_test/src/features/market/

Pre-condiciones: Fases 0, 1 y 2 cerradas.

Reglas:
- TDD red -> green -> refactor.
- Prohibido mockear hooks de wallet/swap, providers, stores o React Navigation.
- Mock solo en /Users/marcmaciasdev/Desktop/belo_test/src/shared/http/.
- Sin reescribir useWalletStore: solo extender uso via applySwap.

Entregables:
- src/features/swap/* completo.
- src/shared/events/swapEvents.ts (emisor minimo).
- tests/integration/swap/swap.test.tsx con los `it` exactos del .md.
- Fixture src/shared/test/fixtures/swap.ts.

Validacion:
- `npm test -- tests/integration/swap` verde.
- `npm test` verde.
- `npm run lint` limpio.

Reporte final:
1. Archivos creados/modificados.
2. Tests agregados (it + escenario, incluyendo persistencia).
3. Salidas de comandos.
4. Contrato del evento swap:executed (payload).
5. Deuda diferida (ej: rollback ante fallo intermedio).
```
