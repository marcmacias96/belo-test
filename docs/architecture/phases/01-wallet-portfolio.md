# Fase 1 — Wallet / Portfolio

## Objetivo

Entregar la pantalla Portfolio con balances mock persistidos, total en USD calculado a partir de precios reales de CoinGecko, y wiring desde el tab Portfolio del `RootNavigator`. Esta fase habilita Swap (F3) y Notifications (F4) al exponer `useWalletStore` con API estable.

## Dependencias

- Fase 0 verde: navegacion, persistencia, dark mode, i18n, error boundary, retry HTTP.

## Contrato visible

- El usuario abre el tab Portfolio y ve la lista de holdings iniciales: USDT 1000, USDC 500, DAI 500, BTC 0.05, ETH 1.5.
- El usuario ve el total en USD calculado con precios actuales.
- El usuario ve estado de carga mientras se obtienen los precios.
- Si los precios fallan, el usuario ve los balances en cripto y un CTA de Retry; el total queda marcado como "no disponible".
- Si todos los holdings estan en cero, el usuario ve un estado vacio claro.
- Tras cerrar y reabrir la app, los balances persisten.

## Estructura de carpetas

```txt
src/features/wallet/
  index.ts
  screens/
    PortfolioScreen.tsx
  components/
    PortfolioBalanceCard.tsx
    PortfolioAssetRow.tsx
    PortfolioSkeletonList.tsx
    index.ts
  services/
    fetchPortfolioPrices.ts
  lib/
    computeTotalUsd.ts
    formatHolding.ts
  state/
    useWalletStore.ts
  types.ts
tests/integration/wallet/
  portfolio.test.tsx
src/shared/test/fixtures/
  wallet.ts
```

## Tests de integracion a escribir primero

Frontera mockeada: `src/shared/http` (endpoint `/simple/price?ids=bitcoin,ethereum,tether,usd-coin,dai&vs_currencies=usd`). Store rehidratado: `useWalletStore` (`wallet:v1`).

`tests/integration/wallet/portfolio.test.tsx`:

- `it("deberia mostrar holdings iniciales y total en USD cuando los precios responden ok")` — escenario success.
- `it("deberia mostrar el estado vacio cuando todos los holdings estan en cero")` — escenario empty (resetear store antes de render).
- `it("deberia mostrar los balances en cripto y CTA Retry cuando la peticion de precios falla")` — escenario error.
- `it("deberia recuperar el total en USD cuando se presiona Retry y la segunda llamada responde ok")` — escenario retry.
- `it("deberia rehidratar holdings tras unmount y remount cuando el store fue modificado")` — persistencia (mutar via `applySwap` -> unmount -> render -> assert).
- `it("deberia ignorar precios faltantes y marcar total parcial cuando un activo no viene en la respuesta")` — validacion defensiva.

## Implementacion esperada

- `src/features/wallet/types.ts`: `AssetId = 'usdt' | 'usdc' | 'dai' | 'bitcoin' | 'ethereum'`, `Holdings = Record<AssetId, number>`, `PortfolioAsset = { id: AssetId; symbol: string; name: string; amount: number; priceUsd: number | null; valueUsd: number | null }`.
- `src/features/wallet/state/useWalletStore.ts`: usa `createPersistedStore` de Fase 0 con key `wallet:v1`. API:
  - `holdings: Holdings` (default `{ usdt: 1000, usdc: 500, dai: 500, bitcoin: 0.05, ethereum: 1.5 }`).
  - `getBalance(id: AssetId): number`.
  - `applySwap({ fromId, toId, fromAmount, toAmount }): void` — actualiza atomicamente `holdings`.
  - `reset(): void` — solo para tests via helper.
- `src/features/wallet/services/fetchPortfolioPrices.ts`: consume `/simple/price?ids=...&vs_currencies=usd`. Acepta lista de `AssetId` y devuelve `Record<AssetId, number>`.
- `src/features/wallet/lib/computeTotalUsd.ts`: pura, recibe `holdings` + `prices` y devuelve `{ total: number; missingIds: AssetId[] }`.
- `src/features/wallet/lib/formatHolding.ts`: formato consistente con `lib/formatUsd.ts` de Market.
- `src/features/wallet/components/PortfolioBalanceCard.tsx`: muestra total en USD, estado de carga (`Skeleton`), error y delta opcional.
- `src/features/wallet/components/PortfolioAssetRow.tsx`: usa `Card`/`Text`/`Badge`. Tappable -> navega a `CoinDetails` (Fase 2 lo implementa; en F1 dejar `onPress` opcional).
- `src/features/wallet/components/PortfolioSkeletonList.tsx`: equivalente a `MarketAssetSkeletonList`.
- `src/features/wallet/screens/PortfolioScreen.tsx`: usa `ScreenLayout`, header en `Card`, lista en `View`, cubre los 4 estados y un Retry sobre `marketQuery.refetch()`.
- `src/features/wallet/index.ts`: exporta `PortfolioScreen` y `useWalletStore`.
- Wiring: registrar `PortfolioScreen` como pantalla del tab Portfolio en `src/navigation/RootNavigator.tsx`.

## Estados UX cubiertos

- [ ] `loading` con `PortfolioSkeletonList`.
- [ ] `error` con CTA Retry.
- [ ] `empty` cuando `Object.values(holdings).every((amount) => amount === 0)`.
- [ ] `success` con filas y total.

## Frontera mockeada y datos

- Fixture `/Users/marcmaciasdev/Desktop/belo_test/src/shared/test/fixtures/wallet.ts` con:
  - `priceSuccess` — todos los activos.
  - `priceMissingBitcoin` — falta uno para validar total parcial.
  - `priceError503` — para escenario error.
- Reuso opcional de fixtures de Market si los IDs coinciden.

## Criterios de cierre (DoD)

- [ ] Suite `npm test -- tests/integration/wallet` verde con los 6 `it` listados.
- [ ] `npm test` completo verde sin regresiones.
- [ ] `npm run lint` sin warnings nuevos.
- [ ] `useWalletStore` persistido con key `wallet:v1` y rehidratacion validada.
- [ ] Tap en `PortfolioAssetRow` deja preparada la navegacion a `CoinDetails` (handler opcional).
- [ ] Sin mocks fuera de `src/shared/http`.
- [ ] Playground actualizado solo si se introdujo un primitive nuevo (no esperado).

## Riesgos y mitigaciones

- Riesgo: rate limiting de CoinGecko en dev. Mitigacion: `staleTime: 30_000` y reuse de cache (Fase 0).
- Riesgo: `applySwap` mal diseniado bloquea Fase 3. Mitigacion: contrato tipado y test que mute via `applySwap` ya en F1.
- Riesgo: persistencia rehidrata estado obsoleto en tests. Mitigacion: helper `resetPersistedStorage` en `beforeEach`.

## Reporte esperado del subagente

- Archivos creados/modificados con path absoluto.
- Tests agregados con `it` exacto y escenario.
- Salida de `npm test -- tests/integration/wallet`, `npm test`, `npm run lint`.
- Confirmacion de rehidratacion en test.
- Deuda diferida (ej: handler de tap a CoinDetails se cierra en F2).

## Prompt listo para el subagente

```text
Eres un subagente que ejecuta la Fase 1 (Wallet / Portfolio) del proyecto Crypto Wallet Trading Simulator.

Lectura obligatoria antes de actuar:
1. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/phases/01-wallet-portfolio.md
2. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/tdd-integration-vision.md
3. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/ui-work-rules.md
4. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/tdd-integration-playbook/SKILL.md
5. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/ui-feature-playbook/SKILL.md
6. Feature de referencia: /Users/marcmaciasdev/Desktop/belo_test/src/features/market/

Pre-condicion: la Fase 0 esta cerrada (navegacion, persist helper, dark mode, retry HTTP).

Reglas:
- TDD red -> green -> refactor.
- Prohibido mockear hooks de wallet, providers, stores o React Navigation.
- Mock solo en /Users/marcmaciasdev/Desktop/belo_test/src/shared/http/.
- Estructura por feature segun ui-feature-playbook.

Entregables:
- src/features/wallet/* con screens, components, services, lib, state, types.
- tests/integration/wallet/portfolio.test.tsx con los `it("deberia ... cuando ...")` exactos del .md.
- Fixture src/shared/test/fixtures/wallet.ts.
- Wiring del tab Portfolio en src/navigation/RootNavigator.tsx.

Validacion:
- `npm test -- tests/integration/wallet` verde.
- `npm test` verde (sin romper Market ni foundations).
- `npm run lint` limpio.

Reporte final:
1. Archivos creados/modificados con path absoluto.
2. Tests agregados (it + escenario success/empty/error/retry/persistencia).
3. Salidas de comandos.
4. Riesgos residuales y deuda diferida (ej: tap a CoinDetails pendiente para F2).
```
