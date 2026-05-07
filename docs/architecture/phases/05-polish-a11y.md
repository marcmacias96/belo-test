# Fase 5 — Polish, performance y a11y

## Objetivo

Endurecer la app con listas virtualizadas, animaciones consistentes con Reanimated, feedback haptico, accesibilidad completa (labels, roles, font scaling, contraste) y QA exhaustivo de dark mode. Sin agregar features nuevos, dejar la app lista para demo y review.

## Dependencias

- Fase 1 (Wallet/Portfolio), Fase 2 (Coin Details), Fase 3 (Swap) y Fase 4 (Notifications) cerradas con DoD verde.

## Contrato visible

- El usuario hace scroll en Market, Portfolio y Notifications con listas grandes sin caidas de FPS perceptibles.
- El usuario ve animaciones de entrada en cards y un count-up del balance total al actualizarse.
- El usuario siente vibracion suave al confirmar swap, descartar notificacion y togglear favoritos.
- Todos los controles interactivos exponen `accessibilityLabel`, `accessibilityRole` y `accessibilityState` adecuados.
- Los textos respetan el font scaling del sistema (sin `allowFontScaling={false}`).
- En dark mode, todas las pantallas mantienen contraste y legibilidad.

## Estructura de carpetas

No se crean features nuevos. Cambios concentrados en:

```txt
src/features/market/components/MarketAssetRow.tsx
src/features/wallet/components/PortfolioAssetRow.tsx
src/features/wallet/components/PortfolioBalanceCard.tsx
src/features/notifications/components/NotificationRow.tsx
src/features/swap/components/SwapConfirmButton.tsx
src/features/coin-details/components/CoinPriceHeader.tsx

src/shared/animations/
  useEnterAnimation.ts
  useCountUp.ts
src/shared/haptics/
  haptics.ts
tests/integration/polish/
  a11y.test.tsx
  performance.md
```

## Tests de integracion a escribir primero

Frontera mockeada: ya cubierta por fases previas; reusar fixtures existentes.

`tests/integration/polish/a11y.test.tsx`:

- `it("deberia exponer accessibilityRole button en el confirm de Swap cuando se renderiza")`
- `it("deberia exponer accessibilityState selected cuando el toggle de favoritos esta activo")`
- `it("deberia respetar fontScale alto sin truncar el balance total cuando se aumenta el escalado")`
- `it("deberia mantener foco accesible al elemento Retry cuando se muestra estado de error")`
- `it("deberia rendir lista virtualizada cuando Market recibe muchos items")` — verifica uso de `FlatList` con `data` y `keyExtractor` (assert sobre presencia de testID o estructura).
- `it("deberia conservar accesibilidad en NotificationsScreen cuando se cambia a dark mode")`

`tests/integration/polish/performance.md`: documento de checks manuales (no tests automaticos): FPS, cold start, scroll de listas con 100+ items.

## Implementacion esperada

- Migrar listas a `FlatList` con `keyExtractor`, `getItemLayout` cuando aplica, `removeClippedSubviews`, `initialNumToRender`, `windowSize`. `React.memo` en filas y `useCallback` en handlers.
- `src/shared/animations/useEnterAnimation.ts`: hook con Reanimated 4 (`useAnimatedStyle` + `withTiming`) para fade + translateY de cards.
- `src/shared/animations/useCountUp.ts`: hook que anima un numero entre dos valores con Reanimated y publica via `runOnJS`.
- `src/shared/haptics/haptics.ts`: agrega dependencia `expo-haptics`. Wrappers `light()`, `medium()`, `success()`, `warning()`, `selection()`. No-op en web/test.
- Integrar haptics en: `SwapConfirmButton`, dismiss de notificacion, toggle de favoritos en Market.
- Recorrer cada pantalla y agregar/auditar `accessibilityLabel`, `accessibilityRole` (`button`, `header`, `image`, `text`), `accessibilityState` (`selected`, `disabled`, `checked`).
- Auditar contraste en `tailwind.config.js` para tokens dark; ajustar `muted-foreground` y `card.DEFAULT` si fallan WCAG AA.
- Eliminar cualquier `allowFontScaling={false}` introducido por error.
- QA dark mode: revisar Portfolio, Market, CoinDetails, Swap, Notifications y ajustar clases `dark:`.

## Estados UX cubiertos

- [ ] `loading`: skeletons mantienen contraste en dark.
- [ ] `error`: focus accesible en CTA Retry.
- [ ] `empty`: copy legible y con escala de fuente.
- [ ] `success`: animaciones suaves sin bloquear scroll.

## Frontera mockeada y datos

- Reusar fixtures de Market, Wallet, Coin Details, Swap, Notifications.
- Fixture extra opcional `/Users/marcmaciasdev/Desktop/belo_test/src/shared/test/fixtures/market-large.ts` con 200 items para validar virtualizacion.

## Criterios de cierre (DoD)

- [ ] Suite `npm test -- tests/integration/polish` verde con los `it` listados.
- [ ] `npm test` completo verde sin regresiones de fases anteriores.
- [ ] `npm run lint` limpio.
- [ ] Todas las listas usan `FlatList` con `keyExtractor` y `React.memo` en filas.
- [ ] `expo-haptics` instalado y disparado en swap, dismiss, toggle.
- [ ] Auditoria a11y revisada en cada pantalla, sin warnings de `react-native` en consola por roles invalidos.
- [ ] Dark mode QA documentado en `tests/integration/polish/performance.md`.
- [ ] Sin mocks nuevos fuera de frontera HTTP.
- [ ] Playground actualizado si se documentan animaciones o variants.

## Riesgos y mitigaciones

- Riesgo: Reanimated 4 con worklets puede romper en tests. Mitigacion: mock estandar de Reanimated en `jest.setup.js` (ya provisto por jest-expo).
- Riesgo: `expo-haptics` no disponible en web. Mitigacion: wrapper con guard `Platform.OS`.
- Riesgo: cambios cosmeticos rompen contratos visibles. Mitigacion: tests existentes deben seguir pasando sin ajuste.

## Reporte esperado del subagente

- Archivos creados/modificados con path absoluto.
- Tests agregados (it + escenario).
- Salidas de `npm test -- tests/integration/polish`, `npm test`, `npm run lint`.
- Resumen de auditoria a11y por pantalla.
- Notas de QA dark mode.
- Deuda diferida (ej: animaciones avanzadas, snapshots visuales).

## Prompt listo para el subagente

```text
Eres un subagente que ejecuta la Fase 5 (Polish, performance y a11y) del proyecto Crypto Wallet Trading Simulator.

Lectura obligatoria:
1. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/phases/05-polish-a11y.md
2. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/tdd-integration-vision.md
3. /Users/marcmaciasdev/Desktop/belo_test/docs/architecture/ui-work-rules.md
4. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/tdd-integration-playbook/SKILL.md
5. /Users/marcmaciasdev/Desktop/belo_test/.cursor/skills/ui-feature-playbook/SKILL.md
6. Feature de referencia: /Users/marcmaciasdev/Desktop/belo_test/src/features/market/

Pre-condiciones: Fases 1, 2, 3 y 4 cerradas (F0 implicita).

Reglas:
- TDD red -> green -> refactor (los tests de a11y se escriben primero).
- Prohibido mockear hooks, providers, stores o React Navigation.
- Mock solo en /Users/marcmaciasdev/Desktop/belo_test/src/shared/http/.
- No introducir features nuevos; solo polish.
- No degradar suites previas: todos los tests anteriores deben seguir verdes.

Entregables:
- Migracion a FlatList virtualizado en Market, Portfolio y Notifications.
- Hooks src/shared/animations/useEnterAnimation.ts y useCountUp.ts.
- Wrapper src/shared/haptics/haptics.ts con expo-haptics.
- Auditoria a11y aplicada en pantallas existentes.
- tests/integration/polish/a11y.test.tsx con los `it` exactos del .md.
- tests/integration/polish/performance.md con notas de QA manual.

Validacion:
- `npm test -- tests/integration/polish` verde.
- `npm test` completo verde sin regresiones.
- `npm run lint` limpio.

Reporte final:
1. Archivos creados/modificados (path absoluto).
2. Tests agregados (it + escenario).
3. Salidas de comandos.
4. Resumen de auditoria a11y por pantalla.
5. Notas de QA dark mode.
6. Deuda diferida.
```
