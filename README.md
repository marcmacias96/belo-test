# Crypto Wallet Trading Simulator

Prueba técnica: simulador de wallet cripto multi-pantalla sobre React Native (Expo), con datos de precios en tiempo real de CoinGecko, persistencia local, sistema de notificaciones basado en eventos y cobertura de integración end-to-end.

![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![NativeWind](https://img.shields.io/badge/NativeWind-4-38BDF8)
![Zustand](https://img.shields.io/badge/Zustand-5-orange)
![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5-FF4154)
![Jest](https://img.shields.io/badge/Jest-29-C21325?logo=jest)

---

## Tabla de contenidos

- [Objetivo](#objetivo)
- [Stack y dependencias clave](#stack-y-dependencias-clave)
- [Quick start](#quick-start)
- [Arquitectura](#arquitectura)
- [Features embarcadas](#features-embarcadas)
  - [Portfolio / Wallet](#1-portfolio--wallet)
  - [Coin Details](#2-coin-details)
  - [Swap / Exchange](#3-swap--exchange)
  - [Notifications](#4-notifications)
- [Capas transversales](#capas-transversales)
- [Estrategia de testing](#estrategia-de-testing)
- [Suites de tests](#suites-de-tests)
- [Workflow de desarrollo](#workflow-de-desarrollo)
- [Apéndice: reference features](#apéndice-reference-features)
- [Documentación complementaria](#documentación-complementaria)

---

## Objetivo

Este repositorio implementa un simulador de wallet cripto para una prueba técnica. El usuario puede visualizar su portfolio con valores en USD calculados con precios reales, ver el detalle y el historial 24 h de cada moneda, ejecutar swaps entre activos con validaciones de saldo y mínimo de operación, y recibir notificaciones tanto de transacciones como de cambios de precio por encima de un umbral configurable.

Las restricciones autoimpuestas son parte del scope de la prueba:

- **TDD de integración como contrato**: ningún comportamiento nuevo se implementa sin un test de integración en rojo previo ([docs/architecture/tdd-integration-vision.md](docs/architecture/tdd-integration-vision.md)).
- **Mocking limitado a la frontera HTTP**: solo se simula la capa `src/shared/http/`; providers, stores y navegación corren reales en los tests.
- **Theming que sigue al sistema**: la app respeta el modo claro/oscuro del dispositivo y permite override persistido.
- **i18n EN/ES desde el primer render**: todos los textos de usuario pasan por namespaces de i18next.

---

## Stack y dependencias clave

| Categoría       | Tecnología                                     |
| --------------- | ---------------------------------------------- |
| Runtime         | React Native 0.81, Expo 54                     |
| Lenguaje        | TypeScript 5.9 (strict)                        |
| Estilos         | NativeWind 4 + Tailwind CSS 3                  |
| Estado global   | Zustand 5 con `persist` sobre AsyncStorage     |
| Estado servidor | TanStack Query 5                               |
| Navegación      | React Navigation 7 (native stack)              |
| i18n            | i18next + react-i18next                        |
| Animaciones     | Reanimated 4                                   |
| Tests           | jest-expo 54 + Testing Library React Native 13 |
| Datos externos  | CoinGecko Demo API                             |

---

## Quick start

```bash
# Instalar dependencias
npm install

# Configurar variable de entorno
echo "EXPO_PUBLIC_COINGECKO_API_KEY=tu_clave_demo" > .env

# Iniciar en iOS / Android / Web
npm run start

# Ejecutar toda la suite de tests
npm test

# Ejecutar solo una suite
npm test -- tests/integration/wallet

# Lint
npm run lint

# Formato
npm run format
```

> La app funciona sin clave de API (modo sin autenticación del tier Demo de CoinGecko), pero con la clave se evita el rate limiting.

---

## Arquitectura

### Capas

```
App.tsx
└── AppProviders                    ← providers globales
    ├── RootNavigator               ← árbol de pantallas
    │   ├── PortfolioScreen (Home)
    │   ├── NotificationsScreen
    │   ├── PriceAlertsScreen
    │   ├── CoinDetailsScreen
    │   └── SwapScreen
    └── NotificationsBootstrap      ← servicios de fondo (sin UI)
        ├── usePriceAlertWatcher
        └── useSwapNotificationBridge
```

### Provider tree

Definido en [src/app/providers/AppProviders.tsx](src/app/providers/AppProviders.tsx):

```
QueryClientProvider (retry: 2, staleTime: 30 000 ms)
└── SafeAreaProvider
    └── ErrorBoundary
        └── NavigationContainer
            └── ThemeProvider
                └── GlobalSafeArea
                    └── ToastProvider
                        └── NotificationsBootstrap + {children}
```

### Árbol de carpetas

```
src/
├── app/
│   ├── providers/          AppProviders, ThemeProvider, ErrorBoundary
│   └── layout/             GlobalSafeArea (re-export)
├── navigation/             RootNavigator, types.ts
├── features/
│   ├── wallet/             Portfolio + balances
│   ├── coin-details/       Detalle de moneda + historial
│   ├── swap/               Exchange entre activos
│   ├── notifications/      Historial + alertas de precio
│   ├── market/             [solo referencia arquitectónica — ver apéndice]
│   └── playground/         Documentación viva de primitives
├── shared/
│   ├── http/               fetchWithTimeout, coingeckoFetch, errors
│   ├── state/              createPersistedStore, resetPersistedStorage
│   ├── events/             swapEventEmitter
│   ├── hooks/              useToast
│   ├── haptics/            haptics.ts
│   ├── animations/         useCountUp, useFadeIn
│   ├── config/             coingecko.ts
│   └── test/               renderWithProviders, fixtures/
├── i18n/                   index.ts, locales/{en,es}.json
├── layout/                 GlobalSafeArea, ScreenLayout
└── stores/                 appStore (global secundario)

components/
└── ui/                     primitives: Button, Card, Badge, Input,
                            SelectDrawer, Skeleton, Toast, Toggle…

tests/
└── integration/
    ├── foundations/
    ├── wallet/
    ├── coin-details/
    ├── swap/
    ├── notifications/
    ├── a11y/
    └── polish/
```

### Mapa de navegación

Definido en [src/navigation/RootNavigator.tsx](src/navigation/RootNavigator.tsx) y [src/navigation/types.ts](src/navigation/types.ts). La navegación es un **native stack** sin tabs. El acceso a Notifications se realiza desde el botón de la cabecera de Home.

```
Home (PortfolioScreen)
 ├── [header] → Notifications
 │               └── PriceAlerts
 ├── [tap fila] → CoinDetails (params: coinId, name?, symbol?)
 │               └── [CoinBuySellRow] → Swap (params: fromId?, toId?)
 └── [QuickActions] → Swap
```

### Reglas de dependencia

```
features/*   → puede importar de  shared/*  y  components/ui/*
shared/*     → no puede importar de  features/*
playground   → no puede importar lógica de negocio de otros features
```

---

## Features embarcadas

Cada feature sigue la estructura canónica `src/features/<dominio>/{screens,components,services,state,lib,types.ts,index.ts}`. La referencia estructural es `src/features/market/`; ver [docs/architecture/ui-work-rules.md](docs/architecture/ui-work-rules.md).

---

### 1. Portfolio / Wallet

#### Ubicación

[src/features/wallet/](src/features/wallet/)

- `screens/PortfolioScreen.tsx` — pantalla principal
- `components/` — `PortfolioBalanceCard`, `PortfolioAssetRow`, `PortfolioAssetSkeletonList`, `PortfolioQuickActions`
- `services/fetchPortfolioPrices.ts` — GET `/simple/price?ids=...&vs_currencies=usd`
- `state/useWalletStore.ts` — store persistido (`wallet:v1`)
- `lib/computeTotalUsd.ts`, `lib/formatHolding.ts` — helpers puros
- `types.ts` — `AssetId`, `Holdings`, `PortfolioAsset`, `PriceMap`, `SwapParams`

#### Explicación técnica

El store ([src/features/wallet/state/useWalletStore.ts](src/features/wallet/state/useWalletStore.ts)) usa `createPersistedStore` de [src/shared/state/persist.ts](src/shared/state/persist.ts) con clave `wallet:v1` sobre AsyncStorage. La API expone `holdings`, `getBalance(id)`, `applySwap({ fromId, toId, fromAmount, toAmount })` y `reset()`.

`PortfolioScreen` ejecuta un `useQuery` sobre `fetchPortfolioPrices` que consume el endpoint `/simple/price` de CoinGecko vía `coingeckoFetch`. El helper puro `computeTotalUsd` combina `holdings` con el mapa de precios y devuelve `{ total: number; missingIds: AssetId[] }`, permitiendo un total parcial cuando algún precio no está disponible. La pantalla cubre cuatro estados UX explícitos: `loading` (SkeletonList), `error` (CTA Retry), `empty` (todos los saldos en cero) y `success` (filas y total).

Tap en cualquier fila de `PortfolioAssetRow` navega a `CoinDetails` pasando `coinId`.

#### Dominio y negocio

El portfolio representa los activos que el usuario puede mover dentro de la app. Los balances iniciales son: USDT 1 000, USDC 500, DAI 500, BTC 0.05, ETH 1.5. Estos valores no provienen de una API externa; son el estado de partida simulado. El valor total en USD se calcula con precios de mercado en tiempo real, por lo que varía con cada refresco. Si la llamada de precios falla, los balances en cripto siguen visibles y el total muestra "no disponible" hasta el siguiente reintento exitoso, evitando bloquear al usuario.

Referencia de contratos de producto: [docs/architecture/phases/01-wallet-portfolio.md](docs/architecture/phases/01-wallet-portfolio.md).

---

### 2. Coin Details

#### Ubicación

[src/features/coin-details/](src/features/coin-details/)

- `screens/CoinDetailsScreen.tsx`
- `components/` — `CoinPriceHeader`, `CoinHistoryChart`, `CoinTransactionsList`, `CoinDetailsSkeleton`
- `services/fetchCoinPrice.ts` — GET `/coins/{id}?localization=false&tickers=false&market_data=true`
- `services/fetchCoinHistory.ts` — GET `/coins/{id}/market_chart?days=1&vs_currency=usd`
- `lib/formatCoin.ts`, `lib/normalizeHistory.ts`
- `types.ts` — `CoinDetail`, `CoinHistoryPoint`

#### Explicación técnica

La pantalla lanza dos `useQuery` en paralelo: `['coin', coinId]` para el precio actual y `['coin', coinId, 'history']` para el historial 24 h. Ambos comparten `staleTime: 30 000` y los estados de carga se combinan en un único estado de pantalla.

`normalizeHistory` reduce el array crudo de `[timestamp, price]` a un máximo de 24 puntos mediante muestreo uniforme, evitando renders pesados con series densas. Los precios Buy y Sell se calculan con un spread fijo simulado de 0,5 % sobre el precio actual: `buy = price × 1,005`, `sell = price × 0,995`.

`CoinTransactionsList` lee `useTransactionsStore` para mostrar el historial de swaps ejecutados que involucran esa moneda. Incluye resolución de aliases (p.ej. `usdt`/`usdc` no tienen IDs directos en CoinGecko; la capa de servicio gestiona el mapeo).

#### Dominio y negocio

El spread simulado representa la diferencia entre el precio al que un exchange compra y vende un activo. En un exchange real este diferencial es la principal fuente de ingresos por operación; aquí se modela como constante para simplificar. El historial 24 h permite al usuario evaluar la tendencia reciente antes de decidir un swap. La pantalla también expone el historial de operaciones propias para ese activo, dando contexto sobre el comportamiento pasado del usuario.

Referencia: [docs/architecture/phases/02-coin-details.md](docs/architecture/phases/02-coin-details.md).

---

### 3. Swap / Exchange

#### Ubicación

[src/features/swap/](src/features/swap/)

- `screens/SwapScreen.tsx`
- `components/` — `SwapAssetPicker`, `SwapPreviewCard`, `SwapConfirmButton`
- `services/fetchSwapPrices.ts` — GET `/simple/price?ids=<from>,<to>&vs_currencies=usd`
- `state/useTransactionsStore.ts` — store persistido (`transactions:v1`)
- `lib/computeSwap.ts`, `lib/validateSwap.ts`, `lib/normalizeSwapAmountInput.ts`
- `types.ts` — `SwapInput`, `SwapPreview`, `Transaction`, `ValidationResult`

#### Explicación técnica

El flujo de swap opera en cuatro pasos:

1. **Fetch de precios**: `useQuery` sobre `fetchSwapPrices` obtiene los precios de los dos activos en una sola llamada.
2. **Cálculo del preview**: `computeSwap({ fromAmount, priceIn, priceOut })` aplica la fórmula `toAmount = fromAmount × priceIn / priceOut`.
3. **Validación reactiva**: `validateSwap` devuelve un `ValidationResult` antes de habilitar el botón confirmar. Los códigos de error posibles son `SAME_ASSET`, `INVALID_AMOUNT`, `INSUFFICIENT_BALANCE` y `BELOW_MIN_USD`.
4. **Ejecución atómica**: al confirmar, `useWalletStore.applySwap` actualiza los balances en una sola mutación, `useTransactionsStore.addTransaction` registra la operación, y `swapEventEmitter.emit` dispara el evento para que el sistema de notificaciones lo reciba de forma desacoplada.

La entrada de monto es libre (sin auto-clamp); si el monto supera el saldo se muestra el error de validación en lugar de truncar el valor. Los chips de porcentaje (25 %, 50 %, 75 %, MAX) calculan la fracción sobre el saldo disponible del activo origen.

El bus de eventos ([src/shared/events/swapEvents.ts](src/shared/events/swapEvents.ts)) es un emisor manual con `subscribe`/`emit`/`unsubscribe`. Esta capa de desacoplamiento permite que Notifications no dependa de `swap` como módulo.

#### Dominio y negocio

Un swap es el intercambio directo entre dos activos del portfolio sin paso por dinero fiat. Las reglas de negocio reflejan restricciones reales de exchanges:

- **Mínimo de 1 USD por operación**: evita dust trades que no tienen utilidad económica y generan costos de red.
- **Activos distintos**: intercambiar un activo consigo mismo no tiene efecto económico.
- **Saldo suficiente**: la app no permite operar en negativo; modela un balance custodial cerrado.

El spread se calcula externamente (en CoinDetails); en el formulario de Swap los precios aplicados son los de mercado sin spread adicional para simplificar el modelo.

Referencia: [docs/architecture/phases/03-swap-exchange.md](docs/architecture/phases/03-swap-exchange.md).

---

### 4. Notifications

#### Ubicación

[src/features/notifications/](src/features/notifications/)

- `screens/NotificationsScreen.tsx`, `screens/PriceAlertsScreen.tsx`
- `components/` — `NotificationRow`, `NotificationEmptyState`, `NotificationsHeader`, `NotificationsSkeletonList`, `NotificationBadge`, `PriceAlertThresholdRow`
- `services/priceAlertWatcher.ts` — hook de polling montado en `AppProviders`
- `services/useSwapNotificationBridge.ts` — suscriptor de `swapEventEmitter`
- `state/useNotificationsStore.ts` — historial persistido (`notifications:v1`)
- `state/usePriceAlertsStore.ts` — alertas y precios de referencia (`price-alerts:v1`)
- `lib/computePriceDelta.ts`, `lib/formatNotification.ts`

#### Explicación técnica

El sistema tiene dos fuentes de notificaciones que corren de forma paralela e independiente:

**Bridge de swap** (`useSwapNotificationBridge`): se suscribe a `swapEventEmitter` al montarse en `NotificationsBootstrap`. Cuando recibe un evento `swap:executed`, crea una notificación `kind: 'transaction'` en `useNotificationsStore` y dispara un toast. La suscripción se limpia al desmontarse.

**Watcher de precio** (`usePriceAlertWatcher`): ejecuta un `useQuery` con `refetchInterval: 60 000` sobre el mismo endpoint que Portfolio (`/simple/price`). En cada respuesta compara el precio actual contra el `referencePrice` de cada alerta activa usando `computePriceDelta = (current - reference) / reference`. Si `|delta| >= thresholdPercent / 100`, se añade una notificación `kind: 'price'` y se actualiza el `referencePrice` para evitar alertas duplicadas en el siguiente ciclo. En entorno de test el intervalo se desactiva para evitar leaks de timers.

`usePriceAlertsStore` (clave `price-alerts:v1`) gestiona las alertas con su array de `PriceAlert` (id, assetId, thresholdPercent, referencePrice, createdAt) y el mapa de `latestPrices` por activo.

`useNotificationsStore` (clave `notifications:v1`) expone `add(n)`, `markAllRead()` y `clear()`. La badge de notificaciones en el header de `PortfolioScreen` refleja el conteo de notificaciones no leídas en tiempo real.

#### Dominio y negocio

Las alertas de precio replican una funcionalidad habitual en apps de cripto: el usuario configura un umbral porcentual por activo (sin límite de alertas por activo) y la app le avisa cuando el precio varía lo suficiente respecto al precio de referencia capturado en el momento de crear la alerta. El diseño actual soporta solo crear y eliminar alertas; la edición es intencional excluida del scope.

Las notificaciones de swap informan del resultado de la operación (outcome), no del inicio. Esto modela el comportamiento de apps de trading reales donde la confirmación es lo que importa al usuario.

Referencia: [docs/architecture/phases/04-notifications.md](docs/architecture/phases/04-notifications.md).

---

## Capas transversales

### HTTP y retry

[src/shared/http/client.ts](src/shared/http/client.ts) expone tres funciones:

- `fetchWithTimeout(url, init, options)`: implementa retry con backoff exponencial (`250 ms · 2^n`, hasta `maxRetries = 2`). Solo reintenta en errores HTTP 5xx. Cancela mediante `AbortController` si supera `timeoutMs` (por defecto 10 000 ms).
- `getJson<T>(url, init)`: wrapper de fetch simple sin retry para casos donde el error debe propagarse directamente.
- `coingeckoFetch(path, options)`: inyecta automáticamente el header `x-cg-demo-api-key` en cada petición a CoinGecko.

Los errores se normalizan en [src/shared/http/errors.ts](src/shared/http/errors.ts) a `HttpClientError` con campo `status` opcional.

### Persistencia

[src/shared/state/persist.ts](src/shared/state/persist.ts) expone `createPersistedStore<T>(name, initializer)` que encapsula `zustand/middleware/persist` con `AsyncStorage` como backend. Cada store define su clave de versión:

| Store                   | Clave              |
| ----------------------- | ------------------ |
| `useWalletStore`        | `wallet:v1`        |
| `useTransactionsStore`  | `transactions:v1`  |
| `useNotificationsStore` | `notifications:v1` |
| `usePriceAlertsStore`   | `price-alerts:v1`  |
| `useThemeStore`         | `theme:v1`         |

La función `resetPersistedStorage(name)` limpia la entrada de AsyncStorage y se usa en los teardowns de tests de rehidratación.

### Theming

[src/app/providers/ThemeProvider.tsx](src/app/providers/ThemeProvider.tsx) mantiene `mode: 'light' | 'dark' | 'system'` en `useThemeStore` (persistido). `effectiveMode` resuelve `system` a la preferencia actual del OS vía `Appearance.getColorScheme()`. Se suscribe a `Appearance.addChangeListener` y a `AppState` para capturar cambios en caliente y al volver al primer plano. NativeWind aplica el modo dark añadiendo la clase `dark` al `View` raíz, lo que propaga las variantes `dark:*` de Tailwind a todos los componentes hijos.

### i18n

Los namespaces (`common`, `wallet`, `coin`, `swap`, `notifications`) se cargan sincrónicamente desde bundle en `src/i18n/locales/{en.json,es.json}`. La detección de locale se basa en `Intl.DateTimeFormat().resolvedOptions().locale` como fallback universal.

### Bus de eventos

[src/shared/events/swapEvents.ts](src/shared/events/swapEvents.ts) implementa un emisor manual (`swapEventEmitter`) con `emit`, `subscribe` y `unsubscribe`. No usa ninguna librería externa. El método `_reset()` existe exclusivamente para limpiar listeners entre tests.

### Layout

Dos capas de contenedor de pantalla:

- `GlobalSafeArea` ([src/layout/GlobalSafeArea.tsx](src/layout/GlobalSafeArea.tsx)): wrapper global de safe area, montado una sola vez en el árbol de providers.
- `ScreenLayout` ([src/layout/ScreenLayout.tsx](src/layout/ScreenLayout.tsx)): aplica padding, scroll y color de fondo por pantalla. Todas las pantallas de feature lo usan como contenedor base.

### Animaciones y haptics

- `useCountUp` y `useFadeIn` en [src/shared/animations/](src/shared/animations/): hooks Reanimated para animaciones de entrada y count-up del balance.
- [src/shared/haptics/haptics.ts](src/shared/haptics/haptics.ts): wrappers de `expo-haptics` (`light`, `medium`, `success`, etc.) con no-op en web y entorno de test.

---

## Estrategia de testing

El proyecto adopta una estrategia **integration-first** documentada en [docs/architecture/tdd-integration-vision.md](docs/architecture/tdd-integration-vision.md). Las reglas innegociables son:

- **Test en rojo antes de implementar**: ningún comportamiento nuevo se implementa sin un test de integración fallando primero (Red → Green → Refactor).
- **Providers reales en tests**: cada test renderiza la pantalla con `renderWithProviders` o `renderWithAppShell`, que incluyen `QueryClientProvider`, `SafeAreaProvider`, `ThemeProvider`, `GlobalSafeArea` y `ToastProvider`.
- **Mocking solo en la frontera externa**: se permite mockear `fetch` (a través de `jest.spyOn(global, 'fetch')`) y `AsyncStorage` (mock provisto por `jest-expo`). Está prohibido mockear hooks del feature, providers o stores globales.
- **Escenarios mínimos por feature**: `success`, `empty`, `error` y `retry` cuando el flujo lo permite. Persistencia validada con ciclos unmount → remount.

### Helpers de test

[src/shared/test/renderWithProviders.tsx](src/shared/test/renderWithProviders.tsx) expone dos variantes:

- `renderWithProviders(ui, options)`: sin `NavigationContainer`. Para tests que no necesitan navegar.
- `renderWithAppShell(ui, options)`: añade `NavigationContainer` con una ref exportada `navigationRef`. Para tests de navegación.

Los fixtures de frontera externa viven en [src/shared/test/fixtures/](src/shared/test/fixtures/) (uno por feature: `wallet.ts`, `coin-details.ts`, `swap.ts`, `notifications.ts`, `http.ts`, `market.ts`, `market-large.ts`).

Los tests de rehidratación siguen el patrón: render inicial → mutación de estado → `unmount()` → nuevo render → assert sobre el estado rehidratado.

---

## Suites de tests

### `tests/integration/foundations/`

**Propósito técnico**: valida las infraestructuras transversales (navegación, persistencia, theming, retry HTTP, error boundary) de forma aislada antes de que las features las consuman.

**Riesgo de dominio cubierto**: que una regresión en la infraestructura rompa silenciosamente múltiples features sin que lo detecte ningún test de feature.

**Tests incluidos**:

`navigation.test.tsx`

- `deberia mostrar Home cuando la app monta`
- `deberia navegar a Notifications cuando el usuario presiona el icono del header`
- `deberia navegar a PriceAlerts desde el acceso rapido en Notifications`
- `deberia abrir CoinDetails con el coinId en params cuando se navega desde un stack interno`
- `deberia abrir Swap desde el stack interno cuando se dispara la navegacion`

`theme.test.tsx`

- `deberia montar el provider de tema sin depender de navigation linking context`
- `deberia tener app.json configurado para seguir el tema del sistema (userInterfaceStyle automatic)`
- `deberia seguir cambios del tema del sistema cuando mode es system`
- `deberia aplicar la clase dark cuando el usuario activa el toggle de tema`
- `deberia conservar el tema oscuro cuando la app se reinicia`
- `deberia respetar mode system persistido al relanzar app`
- `deberia mapear colorScheme null del sistema a light`
- `deberia alinear effectiveMode cuando getColorScheme pasa de null a dark tras cold start`

`persistence.test.tsx`

- `deberia rehidratar el valor persistido cuando se monta un store luego de unmount`
- `deberia limpiar el storage cuando se invoca el helper de reset en tests`

`http-retry.test.tsx`

- `deberia reintentar dos veces y mostrar exito cuando la primera respuesta falla con 503`
- `deberia mostrar error final cuando se exceden los reintentos`
- `deberia abortar la peticion cuando se supera el timeout configurado`

`error-boundary.test.tsx`

- `deberia mostrar fallback con CTA de retry cuando un hijo lanza durante render`
- `deberia volver a renderizar el arbol cuando se presiona retry`

---

### `tests/integration/wallet/portfolio.test.tsx`

**Propósito técnico**: verifica el data flow completo desde la respuesta HTTP de precios hasta los valores renderizados en la UI, incluyendo el cálculo de total USD, los estados UX y la rehidratación del store.

**Riesgo de dominio cubierto**: que los balances iniciales sean incorrectos, que el total se calcule mal cuando faltan precios o que los holdings se pierdan al reiniciar la app.

**Tests incluidos**:

- `deberia mostrar el balance total en USD cuando los precios cargan correctamente`
- `deberia mostrar la lista de assets con sus holdings cuando los precios cargan`
- `deberia mostrar skeleton de carga mientras los precios se obtienen`
- `deberia mostrar error con CTA de reintento cuando falla la peticion de precios`
- `deberia reintentar y mostrar el balance cuando el usuario presiona reintento`
- `deberia mostrar holdings en cero sin total cuando los saldos son todos cero`
- `deberia rehidratar los holdings persistidos cuando el componente se vuelve a montar`

---

### `tests/integration/coin-details/coin-details.test.tsx`

**Propósito técnico**: cubre los dos queries paralelos (precio + historial), el cálculo del spread, la resolución de aliases de ID para CoinGecko y el wiring de navegación desde Portfolio.

**Riesgo de dominio cubierto**: que el precio Buy/Sell se calcule incorrectamente, que el historial vacío rompa la UI, y que el alias de IDs estables (usdt, usdc) no se resuelva correctamente hacia CoinGecko.

**Tests incluidos**:

- `deberia mostrar el precio actual y spread bid/ask cuando los datos cargan correctamente`
- `deberia mostrar el chart de precio y el estado vacio de transacciones cuando no hay swaps para la moneda`
- `deberia mostrar las transacciones swap relacionadas a la moneda en CoinDetails`
- `deberia mostrar skeleton mientras los datos de la moneda se obtienen`
- `deberia mostrar error con CTA de reintento cuando falla la peticion de precio`
- `deberia reintentar y mostrar los datos cuando el usuario presiona reintento`
- `deberia mostrar estado vacio de historial cuando no hay datos de las ultimas 24h`
- `deberia resolver aliases de asset id (usdt/usdc) para CoinGecko`
- `deberia navegar a CoinDetails desde PortfolioAssetRow cuando el usuario presiona una fila`

---

### `tests/integration/swap/swap.test.tsx`

**Propósito técnico**: verifica el flujo completo de un swap, todas las validaciones de negocio, la actualización atómica de balances, el registro en el store de transacciones, y la funcionalidad de atajos de monto (MAX, chips de porcentaje).

**Riesgo de dominio cubierto**: que un swap ejecutado incorrectamente modifique balances de forma no atómica, que las validaciones fallen y permitan operaciones inválidas, o que el store de transacciones no persista correctamente.

**Tests incluidos**:

- `deberia mostrar la previa del swap con el monto de salida calculado cuando el usuario ingresa un monto valido`
- `deberia actualizar los balances del portfolio inmediatamente tras un swap exitoso`
- `deberia registrar la transaccion en useTransactionsStore tras un swap exitoso`
- `deberia mostrar error de validacion cuando el usuario no tiene saldo suficiente`
- `deberia cargar el saldo total al presionar MAX`
- `deberia cargar el porcentaje seleccionado al presionar un chip`
- `deberia mostrar error de validacion cuando el monto equivale a menos de 1 USD`
- `deberia mostrar error de validacion cuando los activos de origen y destino son iguales`
- `deberia mostrar error con CTA de reintento cuando falla la peticion de precios para el swap`
- `deberia reintentar la obtencion de precios y completar el swap cuando el usuario presiona reintentar`

---

### `tests/integration/notifications/notifications.test.tsx`

**Propósito técnico**: valida los dos canales de notificación (swap bridge y price watcher), el ciclo completo de alertas de precio (creación → umbral → disparo → reset de referencia), la persistencia de historial y thresholds, y las interacciones de UI (mark all read, vacío).

**Riesgo de dominio cubierto**: que las notificaciones de swap no lleguen al store, que alertas de precio se disparen por debajo del umbral, que el historial se pierda al reiniciar, o que alertas duplicadas aparezcan en ciclos consecutivos.

**Tests incluidos**:

- `deberia mostrar notificacion de transaccion cuando se completa un swap exitoso`
- `deberia disparar alerta de precio cuando el precio cambia mas del umbral configurado`
- `deberia no disparar alerta de precio cuando el cambio es menor al umbral`
- `deberia persistir las alertas de precio configuradas por el usuario`
- `deberia permitir crear y eliminar alertas de precio desde la pantalla`
- `deberia mostrar la lista de notificaciones con el tipo correcto cuando hay notificaciones en el store`
- `deberia mostrar estado vacio cuando no hay notificaciones`
- `deberia marcar todas las notificaciones como leidas cuando el usuario presiona el boton`
- `deberia mostrar toast de exito cuando se recibe una notificacion de transaccion`

---

### `tests/integration/a11y/accessibility.test.tsx`

**Propósito técnico**: verifica que los componentes interactivos exponen `accessibilityLabel` y `accessibilityRole` correctos para lectores de pantalla.

**Riesgo de dominio cubierto**: que VoiceOver / TalkBack no puedan identificar controles críticos, haciendo la app inutilizable para usuarios con discapacidad visual.

**Tests incluidos**:

- `deberia encontrar el boton de confirmar swap por su accessibilityLabel`
- `deberia encontrar todas las filas de assets por su accessibilityRole en el portfolio`
- `deberia encontrar el boton de notificaciones en el header`

---

### `tests/integration/polish/performance.md`

Documento de checks manuales (no tests automatizados) para FPS en scroll de listas con 100+ ítems, cold start time y comportamiento de `FlatList` con `removeClippedSubviews`. Se corre como checklist previo a cada release candidate.

---

### Tests de referencia (no embarcados en el producto)

- `tests/integration/market.integration.test.tsx`: suite del feature Market (reference). Cubre `success`, `empty`, `error`, `retry` y filtrado por favoritos. Sirve como ejemplo de patrón TDD completo.
- `tests/integration/playground.bootstrap.integration.test.tsx`: smoke test de que el Playground arranca correctamente con AppProviders.

---

## Workflow de desarrollo

```bash
npm run start          # Expo dev server (iOS / Android / Web)
npm run ios            # arrancar en simulador iOS
npm run android        # arrancar en emulador Android
npm test               # suite completa
npm test -- <path>     # suite individual
npm run lint           # ESLint (eslint-config-expo)
npm run format         # Prettier (escribe)
npm run format:check   # Prettier (solo verifica)
```

**Convenciones de naming de tests**: `deberia <resultado visible> cuando <condición>`.

**Convención de commits**: mensajes descriptivos en inglés o español, sin co-author de herramientas.

**Estructura de branches**: cada fase del plan tiene su rama. El plan maestro de fases vive en [docs/architecture/phases/README.md](docs/architecture/phases/README.md).

---

## Apéndice: reference features

### `src/features/market/`

Feature **no embarcado** en la navegación del producto final. Existe como referencia arquitectónica canónica del patrón `feature-nested` descrito en [docs/architecture/ui-work-rules.md](docs/architecture/ui-work-rules.md). Implementa el ciclo TDD completo para un listado de activos con datos reales de CoinGecko y filtrado por favoritos vía `useMarketPreferencesStore`. Toda nueva feature debe seguir su misma estructura de carpetas.

### `src/features/playground/` y `src/screens/PlaygroundScreen.tsx`

Documentación viva de los primitives de `components/ui/`. Cada nuevo primitive o patrón de UI se documenta aquí antes de usarse en features reales. No contiene lógica de negocio.

---

## Documentación complementaria

| Documento                                                                                          | Contenido                                                                                     |
| -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [docs/architecture/tdd-integration-vision.md](docs/architecture/tdd-integration-vision.md)         | Contrato TDD de integración: principios, definición formal, anti-patrones, Definition of Done |
| [docs/architecture/ui-work-rules.md](docs/architecture/ui-work-rules.md)                           | Estándar de carpetas por feature, reglas de componentes UI, checklist de estados UX           |
| [docs/architecture/phases/README.md](docs/architecture/phases/README.md)                           | Índice de fases, mapa de dependencias, protocolo de despacho a subagentes                     |
| [docs/architecture/phases/00-foundations.md](docs/architecture/phases/00-foundations.md)           | Fase 0: navegación, persistencia, dark mode, i18n, error boundary, retry HTTP                 |
| [docs/architecture/phases/01-wallet-portfolio.md](docs/architecture/phases/01-wallet-portfolio.md) | Fase 1: Portfolio, balances, total USD, persistencia                                          |
| [docs/architecture/phases/02-coin-details.md](docs/architecture/phases/02-coin-details.md)         | Fase 2: CoinDetails, historial 24 h, spread buy/sell                                          |
| [docs/architecture/phases/03-swap-exchange.md](docs/architecture/phases/03-swap-exchange.md)       | Fase 3: Swap, validaciones, transacciones, evento desacoplado                                 |
| [docs/architecture/phases/04-notifications.md](docs/architecture/phases/04-notifications.md)       | Fase 4: Notifications, alertas de precio, bridge de swap                                      |
| [docs/architecture/phases/05-polish-a11y.md](docs/architecture/phases/05-polish-a11y.md)           | Fase 5: virtualización, animaciones, haptics, accesibilidad, dark mode QA                     |
