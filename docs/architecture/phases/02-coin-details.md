# Fase 2 — Coin Details

## Objetivo

Entregar la pantalla `CoinDetailsScreen` que muestra precio actual con buy/sell simulado (spread fijo), historico 24h y header con datos del activo. Habilita la navegacion desde Market y Portfolio. Es prerrequisito de Swap (F3).

## Dependencias

- Fase 0 verde: navegacion, retry HTTP, i18n, error boundary.
- Fase 1 verde: `useWalletStore` y `PortfolioAssetRow` para origen de navegacion.

## Contrato visible

- El usuario presiona una fila en Market o Portfolio y se abre `CoinDetailsScreen` con el coin correcto.
- El usuario ve nombre, simbolo, icono opcional y precio actual en USD.
- El usuario ve precio Buy y Sell calculados con spread fijo simulado de 0.5% sobre `current_price`.
- El usuario ve un grafico/lista del historico 24h (sparkline simple o lista textual de puntos).
- Si la peticion falla, el usuario ve mensaje y boton Retry.
- Si no hay puntos historicos, el usuario ve estado empty para el chart conservando la cabecera de precio.
- El header muestra skeleton mientras se cargan datos.

## Estructura de carpetas

```txt
src/features/coin-details/
  index.ts
  screens/
    CoinDetailsScreen.tsx
  components/
    CoinPriceHeader.tsx
    CoinHistoryChart.tsx
    CoinBuySellRow.tsx
    CoinDetailsSkeleton.tsx
    index.ts
  services/
    fetchCoinPrice.ts
    fetchCoinHistory.ts
  lib/
    computeBuySellPrice.ts
    formatChartPoints.ts
  types.ts
tests/integration/coin-details/
  coin-details.test.tsx
src/shared/test/fixtures/
  coin-details.ts
```

## Tests de integracion a escribir primero

Frontera mockeada: `/coins/{id}` y `/coins/{id}/market_chart?days=1` via `src/shared/http`.

`tests/integration/coin-details/coin-details.test.tsx`:

- `it("deberia mostrar precio actual buy y sell con spread cuando los endpoints responden ok")` — success.
- `it("deberia mostrar el chart vacio con cabecera intacta cuando market_chart devuelve prices vacio")` — empty.
- `it("deberia mostrar mensaje de error y CTA Retry cuando /coins/{id} falla")` — error.
- `it("deberia recargar y mostrar datos cuando se presiona Retry tras un error")` — retry.
- `it("deberia abrir CoinDetails con el coinId correcto cuando se presiona una fila en Market")` — wiring de navegacion.
- `it("deberia abrir CoinDetails con el coinId correcto cuando se presiona una fila en Portfolio")` — wiring de navegacion.
- `it("deberia mostrar buy 0.5% mas alto y sell 0.5% mas bajo cuando el precio base es 100")` — validacion de spread.

## Implementacion esperada

- `src/features/coin-details/types.ts`: `CoinDetail`, `CoinHistoryPoint = { timestamp: number; priceUsd: number }`, `BuySellPrices = { buy: number; sell: number; spreadPct: number }`.
- `src/features/coin-details/services/fetchCoinPrice.ts`: GET `/coins/{id}` mapeado a `CoinDetail`.
- `src/features/coin-details/services/fetchCoinHistory.ts`: GET `/coins/{id}/market_chart?days=1&vs_currency=usd`, devuelve `CoinHistoryPoint[]`.
- `src/features/coin-details/lib/computeBuySellPrice.ts`: pura, recibe `currentPrice` y `spreadPct = 0.005`, devuelve `{ buy: currentPrice * (1 + spreadPct), sell: currentPrice * (1 - spreadPct), spreadPct }`. Reusable por F3.
- `src/features/coin-details/lib/formatChartPoints.ts`: agrupa o reduce puntos a una serie manejable.
- `src/features/coin-details/components/CoinPriceHeader.tsx`: nombre, simbolo, precio actual y badges.
- `src/features/coin-details/components/CoinBuySellRow.tsx`: dos `Card` con buy/sell, accesibles, tappables hacia Swap (handler opcional, F3 lo conecta).
- `src/features/coin-details/components/CoinHistoryChart.tsx`: implementacion minima — lista textual con primeras/ultimas N entradas, mas un sparkline opcional con `react-native-svg` (ya viable via Reanimated). Si introduce primitive nuevo, documentarlo en `src/features/playground/`.
- `src/features/coin-details/components/CoinDetailsSkeleton.tsx`: usa `Skeleton`.
- `src/features/coin-details/screens/CoinDetailsScreen.tsx`: lee `coinId` de `route.params`, dos `useQuery` (`['coin', id]` y `['coin', id, 'history']`) con `staleTime: 30_000`, manejo combinado de loading/error/empty/success.
- Navegacion: en `MarketAssetRow` y `PortfolioAssetRow` agregar `onPress` que use `useNavigation()` para navegar a `CoinDetails` con `coinId`.

## Estados UX cubiertos

- [ ] `loading` con skeleton de header y chart.
- [ ] `error` con Retry combinado para ambos queries.
- [ ] `empty` cuando `prices.length === 0`.
- [ ] `success` con header + chart + buy/sell.

## Frontera mockeada y datos

- Fixture `/Users/marcmaciasdev/Desktop/belo_test/src/shared/test/fixtures/coin-details.ts` con:
  - `bitcoinPriceSuccess`, `bitcoinHistorySuccess`, `bitcoinHistoryEmpty`, `bitcoinPriceError`, `bitcoinHistoryError`.
- Mock de `/coins/{id}` y `/coins/{id}/market_chart` independiente para validar comportamiento parcial.

## Criterios de cierre (DoD)

- [ ] Suite `npm test -- tests/integration/coin-details` verde.
- [ ] `npm test` completo verde.
- [ ] `npm run lint` sin warnings nuevos.
- [ ] `MarketAssetRow` y `PortfolioAssetRow` navegan correctamente.
- [ ] `computeBuySellPrice` con tests unitarios o cobertura via integracion.
- [ ] Sin mocks fuera de frontera HTTP.
- [ ] Playground actualizado si `CoinHistoryChart` introduce un primitive (sparkline) nuevo.

## Riesgos y mitigaciones

- Riesgo: sparkline complejo retrasa la fase. Mitigacion: comenzar con lista textual + linea SVG basica; sparkline avanzado puede ser deuda.
- Riesgo: `market_chart` devuelve arrays grandes. Mitigacion: down-sampling en `formatChartPoints`.
- Riesgo: navegacion en tests requiere `NavigationContainer`. Mitigacion: usar variante `renderWithAppShell` de Fase 0.

## Reporte esperado del subagente

- Archivos creados/modificados con path absoluto.
- Tests agregados (it + escenario).
- Salidas de `npm test -- tests/integration/coin-details`, `npm test`, `npm run lint`.
- Confirmacion de wiring desde Market y Portfolio.
- Deuda diferida (ej: sparkline avanzado, cache compartida con `fetchPortfolioPrices`).

## Prompt listo para el subagente

```text
Eres un subagente que ejecuta la Fase 2 (Coin Details) del proyecto Crypto Wallet Trading Simulator.

Lectura obligatoria:
1. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/phases/02-coin-details.md
2. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/tdd-integration-vision.md
3. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/ui-work-rules.md
4. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/tdd-integration-playbook/SKILL.md
5. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/ui-feature-playbook/SKILL.md
6. Feature de referencia: /Users/marcmaciasdev/Desktop/belo_test/src/features/market/

Pre-condiciones: Fases 0 y 1 cerradas (navegacion + wallet store).

Reglas:
- TDD red -> green -> refactor.
- Prohibido mockear hooks del feature, providers, stores o React Navigation.
- Mock solo en /Users/marcmaciasdev/Desktop/belo_test/src/shared/http/.
- Estructura segun ui-feature-playbook.

Entregables:
- src/features/coin-details/* completo.
- tests/integration/coin-details/coin-details.test.tsx con los `it` exactos del .md.
- Fixture src/shared/test/fixtures/coin-details.ts.
- onPress de MarketAssetRow y PortfolioAssetRow conectado a CoinDetails con coinId.

Validacion:
- `npm test -- tests/integration/coin-details` verde.
- `npm test` verde sin regresiones.
- `npm run lint` limpio.

Reporte final:
1. Archivos creados/modificados (path absoluto).
2. Tests agregados (it + escenario).
3. Salidas de comandos.
4. Confirmacion de wiring desde Market y Portfolio.
5. Deuda diferida.
```
