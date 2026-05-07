# Fase 0 — Fundamentos compartidos

## Objetivo

Dejar lista la base transversal sobre la que se construyen las fases 1 a 5: navegacion entre tabs, persistencia con `AsyncStorage`, dark mode con NativeWind, i18n EN/ES por namespaces, error boundary global, retry HTTP con timeout y feedback con toasts. Sin esta fase no se puede empezar Wallet, Coin Details, Swap ni Notifications.

## Dependencias

- Ninguna fase previa. Solo el codigo actual del repositorio (Market funcionando, providers basicos, `renderWithProviders`).

## Contrato visible

- El usuario abre la app y ve un `BottomTabs` con tres tabs: Portfolio, Market, Notifications.
- El usuario puede navegar a una pantalla `CoinDetails` y a una pantalla `Swap` desde un stack interno.
- El usuario puede alternar tema claro/oscuro desde un control accesible y la preferencia persiste tras reiniciar la app.
- Si la app cae con un error de render, el usuario ve una pantalla de fallback con boton de reintento.
- Cuando una llamada HTTP falla con error transitorio, la app reintenta automaticamente (max 2 veces, backoff exponencial) antes de mostrar error.
- El usuario ve textos en su idioma de dispositivo (EN o ES) desde el primer render.

## Estructura de carpetas

```txt
src/
  navigation/
    RootNavigator.tsx
    types.ts
    index.ts
  app/
    providers/
      AppProviders.tsx        # se extiende; no se reemplaza
      ThemeProvider.tsx
      ErrorBoundary.tsx
      ToastBridge.tsx         # opcional si hay que conectar useToast a navegacion
  shared/
    state/
      persist.ts              # factory zustand persist + AsyncStorage
    http/
      client.ts               # se extiende con timeout y retry
      errors.ts               # se extiende con normalizacion ya existente
    hooks/
      useToast.ts             # hook fino sobre el primitive existente
  i18n/
    index.ts                  # se completa
    locales/
      en.json
      es.json
tests/
  integration/
    foundations/
      navigation.test.tsx
      persistence.test.tsx
      theme.test.tsx
      error-boundary.test.tsx
      http-retry.test.tsx
```

Modificaciones permitidas (no creaciones nuevas) en archivos existentes:

- `/Users/marcmaciasdev/Desktop/belo_test/App.tsx` — montar `RootNavigator` dentro de `AppProviders`.
- `/Users/marcmaciasdev/Desktop/belo_test/src/app/providers/AppProviders.tsx` — anidar `ThemeProvider`, `ErrorBoundary`, `NavigationContainer` y ajustar `QueryClient` con `retry: 2` y `staleTime: 30_000`.
- `/Users/marcmaciasdev/Desktop/belo_test/src/shared/test/renderWithProviders.tsx` — exponer variante `renderWithAppShell` que incluya `NavigationContainer` y `ThemeProvider` para tests de integracion que necesiten navegacion.
- `/Users/marcmaciasdev/Desktop/belo_test/tailwind.config.js` — habilitar `darkMode: 'class'` y tokens de color para dark.

## Tests de integracion a escribir primero

Frontera mockeada: `src/shared/http/client.ts` (fetch con timeout). Stores rehidratados: `theme` (persist key `theme:v1`).

- `tests/integration/foundations/navigation.test.tsx`
  - `it("deberia mostrar el tab Portfolio activo cuando la app monta")`
  - `it("deberia navegar al tab Market cuando el usuario presiona la pestania Market")`
  - `it("deberia abrir CoinDetails con el coinId en params cuando se navega desde un stack interno")`
  - `it("deberia abrir Swap desde el stack interno cuando se dispara la navegacion")`
- `tests/integration/foundations/persistence.test.tsx`
  - `it("deberia rehidratar el valor persistido cuando se monta un store luego de unmount")`
  - `it("deberia limpiar el storage cuando se invoca el helper de reset en tests")`
- `tests/integration/foundations/theme.test.tsx`
  - `it("deberia aplicar la clase dark cuando el usuario activa el toggle de tema")`
  - `it("deberia conservar el tema oscuro cuando la app se reinicia")` (rehidratacion)
- `tests/integration/foundations/error-boundary.test.tsx`
  - `it("deberia mostrar fallback con CTA de retry cuando un hijo lanza durante render")`
  - `it("deberia volver a renderizar el arbol cuando se presiona retry")`
- `tests/integration/foundations/http-retry.test.tsx`
  - `it("deberia reintentar dos veces y mostrar exito cuando la primera respuesta falla con 503")`
  - `it("deberia mostrar error final cuando se exceden los reintentos")`
  - `it("deberia abortar la peticion cuando se supera el timeout configurado")`

## Implementacion esperada

Resumen accionable, sin codigo:

- Agregar dependencia `@react-native-async-storage/async-storage` y, si hace falta, `@react-navigation/elements`.
- Crear `src/shared/state/persist.ts` con una factory `createPersistedStore<T>(name, initializer)` que envuelve `zustand` con `persist` + `createJSONStorage(() => AsyncStorage)` y expone helper `resetPersistedStorage()` para tests.
- Extender `src/shared/http/client.ts` con `fetchWithTimeout(url, init, { timeoutMs })` y `retry: 2` con backoff exponencial (250ms, 500ms). Mantener normalizacion existente en `errors.ts`.
- Crear `src/app/providers/ThemeProvider.tsx` que: detecta `useColorScheme`, expone `useTheme()` con `mode`, `effectiveMode`, `setMode`, `toggle`, persiste en `AsyncStorage` (key `theme:v1`) via `createPersistedStore`, y aplica `dark` a la raiz de NativeWind.
- Crear `src/app/providers/ErrorBoundary.tsx` (clase) con fallback que renderiza `Card` + `Button Retry` y resetea estado.
- Crear `src/navigation/RootNavigator.tsx` con `BottomTabs` (`Portfolio`, `Market`, `Notifications`) y `NativeStack` interno con rutas `CoinDetails` (param `coinId: string`) y `Swap` (params opcionales `fromId`, `toId`). Tipos en `src/navigation/types.ts` siguiendo el patron de React Navigation con `RootStackParamList` y declaracion global.
- Completar `src/i18n/index.ts` con detect de locale (`expo-localization` solo si ya existe; si no, fallback a `getLocales` o `Intl.DateTimeFormat().resolvedOptions().locale`). Namespaces: `common`, `wallet`, `market`, `coin`, `swap`, `notifications`. Crear `src/i18n/locales/en.json` y `src/i18n/locales/es.json` con claves placeholder por namespace.
- Crear `src/shared/hooks/useToast.ts` que envuelve el `ToastProvider` existente y expone `success`, `error`, `info`.
- Ajustar `App.tsx` para montar `<AppProviders><RootNavigator /></AppProviders>` (ya no `MarketScreen` directo).
- Ajustar `renderWithProviders` para exponer una variante con navegacion mockeada (memory navigation) sin perder la base actual.

## Estados UX cubiertos

- [ ] `loading`: pantallas placeholder por tab (skeleton minimo).
- [ ] `error`: ErrorBoundary global y CTA Retry.
- [ ] `empty`: tabs muestran estado neutro hasta que las fases siguientes los pueblen.
- [ ] `success`: navegacion fluida entre tabs y stack.

## Frontera mockeada y datos

- Mock de `src/shared/http/client.ts` para los tests de retry y timeout. No mockear React Navigation, ThemeProvider ni i18n.
- Fixtures a crear: `/Users/marcmaciasdev/Desktop/belo_test/src/shared/test/fixtures/http.ts` con respuestas controladas (`okJson`, `flaky503Then200`, `timeout`).
- AsyncStorage usa el mock provisto por `jest-expo` (sin mock manual adicional).

## Criterios de cierre (DoD)

- [ ] Suite `npm test -- tests/integration/foundations` verde con escenarios listados.
- [ ] `npm test` completo verde (Market sigue pasando).
- [ ] `npm run lint` sin warnings nuevos.
- [ ] App arranca con `BottomTabs` y stack interno funcional.
- [ ] Toggle de tema persiste tras unmount/remount en test de rehidratacion.
- [ ] `QueryClient` configurado con `retry: 2` y `staleTime: 30_000`.
- [ ] `fetchWithTimeout` cubierto por test que verifica abort.
- [ ] i18n carga locale del device y permite override; namespaces creados.
- [ ] Sin mocks fuera de `src/shared/http/` y `AsyncStorage`.
- [ ] Sin cambios en `src/features/market/` salvo wiring de navegacion si es estrictamente necesario.

## Riesgos y mitigaciones

- Riesgo: instalar `@react-native-async-storage/async-storage` rompe el build de Expo Go. Mitigacion: usar version compatible con `expo ~54` (`expo install`).
- Riesgo: `NavigationContainer` en tests genera warnings de `useFocusEffect`. Mitigacion: variante `renderWithAppShell` con `NavigationContainer` envolviendo solo lo necesario y `act` correcto.
- Riesgo: doble `QueryClient` entre `AppProviders` y test helper. Mitigacion: el helper sigue creando uno aislado; produccion usa el de `AppProviders`.
- Riesgo: i18n cargando async hace tests flakey. Mitigacion: inicializar i18n sincronamente con recursos en bundle (no remote).

## Reporte esperado del subagente

El subagente debe devolver al agente principal:

- Lista de archivos creados con path absoluto.
- Lista de archivos modificados con path absoluto y resumen de cambio.
- Lista de tests agregados, agrupados por escenario `success/empty/error/retry`.
- Comandos ejecutados con resultado: `npm test -- tests/integration/foundations`, `npm test`, `npm run lint`.
- Dependencias agregadas al `package.json` con su version exacta.
- Deuda diferida explicita (por ejemplo, MMKV opcional, expo-localization si no se incluyo).
- Capturas en texto del output de `npm test` final (resumen de pasos verdes).

## Prompt listo para el subagente

```text
Eres un subagente que ejecuta la Fase 0 (Fundamentos compartidos) del proyecto Crypto Wallet Trading Simulator.

Lectura obligatoria antes de actuar (en este orden):
1. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/phases/00-foundations.md
2. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/tdd-integration-vision.md
3. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/ui-work-rules.md
4. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/tdd-integration-playbook/SKILL.md
5. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/ui-feature-playbook/SKILL.md
6. Feature de referencia: /Users/marcmaciasdev/Desktop/belo_test/src/features/market/ (estructura, screens, components, lib, services).

Reglas innegociables:
- TDD de integracion red -> green -> refactor por cada comportamiento.
- Prohibido mockear hooks del feature, providers, stores globales o React Navigation.
- Mock solo en /Users/marcmaciasdev/Desktop/belo_test/src/shared/http/ y el mock estandar de AsyncStorage.
- Respetar dependencias features -> shared, nunca al reves.
- No tocar src/features/market salvo wiring minimo de navegacion si es indispensable.

Entregables:
- Archivos listados en la seccion "Estructura de carpetas" del 00-foundations.md.
- Tests de integracion en tests/integration/foundations/ con los `it("deberia ... cuando ...")` exactos del .md.
- Modificaciones controladas en App.tsx, AppProviders.tsx, renderWithProviders.tsx y tailwind.config.js.

Validacion antes de reportar:
- Ejecutar `npm test -- tests/integration/foundations` y dejar verde.
- Ejecutar `npm test` y dejar verde sin regresiones de Market.
- Ejecutar `npm run lint` sin warnings nuevos.

Reporte final (formato obligatorio):
1. Archivos creados (path absoluto).
2. Archivos modificados (path absoluto + resumen del cambio).
3. Tests agregados (path + nombre del `it` + escenario success/empty/error/retry).
4. Salida resumida de `npm test -- tests/integration/foundations`, `npm test` y `npm run lint`.
5. Dependencias nuevas en package.json con version.
6. Deuda diferida y riesgos residuales.

Si encuentras un bloqueo (dep que no compila, mock que rompe), detente, documenta el bloqueo y devuelvelo al agente principal sin continuar.
```
