# Performance QA — Fase 5 Manual Checks

## Listas virtualizadas

| Pantalla       | Componente     | Cambio               | Estado |
|----------------|----------------|----------------------|--------|
| MarketScreen   | MarketAssetRow | View+map → FlatList  | ✅ done |
| PortfolioScreen| PortfolioAssetRow | View+map → FlatList | ✅ done |
| NotificationsScreen | NotificationRow | map → FlatList | ✅ done |
| CoinHistoryList| HistoryRow     | map → FlatList       | ✅ done |

Nota: FlatLists dentro de ScreenLayout (ScrollView) usan `scrollEnabled={false}`.
Para listas muy largas (200+ items), migrar MarketScreen a FlatList como root scroll.

## Checks manuales de FPS (ejecutar en dispositivo físico)

- [ ] Market con 100+ items: scroll a 60 FPS sin dropped frames (Flipper > Perf).
- [ ] Portfolio con 5 items: sin re-renders innecesarios (React DevTools Profiler).
- [ ] Notifications con 50+ notificaciones: scroll fluido.

## Cold start

- [ ] App abre en < 2 segundos en dispositivo físico (iOS/Android).
- [ ] Screens cargan skeleton inmediatamente en < 100ms mientras fetch está pendiente.

## Dark mode QA

### Estado actual
El `tailwind.config.js` define tokens de dark mode bajo el namespace `dark.*` (ej: `dark.background`).
El `ThemeProvider` aplica la clase `dark` al View raíz correctamente.

### Tokens definidos
| Token                  | Light               | Dark (dark.*)       |
|------------------------|---------------------|---------------------|
| background             | #ffffff             | #0f172a             |
| foreground             | #0f172a             | #f8fafc             |
| card.DEFAULT           | #ffffff             | #1e293b             |
| card.foreground        | #0f172a             | #f8fafc             |
| primary.DEFAULT        | #0f172a             | #f8fafc             |
| primary.foreground     | #f8fafc             | #0f172a             |
| muted.DEFAULT          | #f1f5f9             | #1e293b             |
| muted.foreground       | #64748b             | #94a3b8             |
| border                 | #e2e8f0             | #334155             |

### Deuda técnica — CSS variables
Para que `dark:bg-background` cambie automáticamente en modo oscuro, la config de Tailwind
debería usar variables CSS:
```js
background: 'hsl(var(--background))'
// y en CSS: .dark { --background: 15 23 42; }
```
Esta migración está diferida a una fase posterior.

### Resultado visual observado
- Skeletons: mantienen contraste en modo oscuro con `bg-muted`.
- Cards: fondo claro en light mode; para dark mode correcto, agregar `dark:bg-dark-card` en componentes Card.
- Textos: `text-foreground` funciona en light; para dark usar `dark:text-dark-foreground`.

## Animaciones

- [ ] PortfolioBalanceCard: fade-in visible al cargar balance (opacity 0→1, 300ms).
- [ ] NotificationRow: fade-in visible al agregar notificación (250ms).
- [ ] SwapConfirmButton: scale spring al presionar (0.95→1).

## Haptics (solo dispositivos físicos)

- [ ] SwapConfirmButton: vibración media al presionar.
- [ ] Mark all read: vibración suave.
- [ ] Toggle favorite en MarketAssetRow: vibración suave.
