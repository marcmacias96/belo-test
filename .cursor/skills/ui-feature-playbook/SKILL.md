---
name: ui-feature-playbook
description: Estandariza implementaciones UI por feature con organizacion por dominio, pantallas escalables y linea visual consistente basada en Market + Playground. Usar cuando se creen o refactoricen pantallas en src/features, se definan reglas de UI, o se necesite alinear componentes con el sistema visual del proyecto.
---

# UI Feature Playbook

## Objetivo

Aplicar una forma unica de trabajo para UI:

- features anidados por dominio,
- pantallas limpias y mantenibles,
- consistencia visual con primitives de `components/ui`,
- referencia practica en `market` y soporte visual en `playground`.

## Cuando activar esta skill

Activar cuando:

1. Se crea un feature nuevo en `src/features/*`.
2. Se refactoriza una pantalla existente.
3. Se agregan componentes visuales reutilizables.
4. Se define o actualiza estructura de carpetas UI.

No activar para:

- cambios de infraestructura sin impacto visual,
- tareas de backend sin pantalla asociada.

## Estructura obligatoria por feature

```txt
src/features/<feature-name>/
  index.ts
  screens/
    <Feature>Screen.tsx
  components/
    <Feature><Piece>.tsx
    index.ts
  services/
    <feature-service>.ts
  lib/
    <feature-helpers>.ts
  types.ts
```

## Reglas de implementacion UI

1. **Screen delgada**: en `screens/` solo composicion, estado visible y wiring.
2. **UI interna desacoplada**: tarjetas, filas y bloques complejos van en `components/`.
3. **Helpers puros**: formateos y funciones auxiliares en `lib/`.
4. **Primitives oficiales primero**: usar `Card`, `Text`, `Button`, `Badge`, `Input`, `SelectDrawer`, `Skeleton`, `Separator`, etc.
5. **Estados UX completos**: para datos remotos cubrir `loading`, `error`, `empty`, `success`.
6. **Playground como referencia visual**: reutilizar patrones existentes antes de crear variaciones nuevas.

## Flujo recomendado

1. Delimitar contrato visual de la pantalla (header, controles, contenido principal).
2. Dibujar estados visibles obligatorios (`loading/error/empty/success`).
3. Resolver estructura por dominio dentro del feature.
4. Implementar componentes internos y helpers.
5. Integrar primitives del sistema UI.
6. Validar consistencia con `playground`.

## Ejemplo de referencia: Market

`src/features/market/` define el patron esperado:

- `screens/MarketScreen.tsx`: composicion principal y estados.
- `components/MarketAssetRow.tsx`: item visual reutilizable del feature.
- `components/MarketAssetSkeletonList.tsx`: estado de carga consistente.
- `lib/formatUsd.ts`: helper puro de formato.

Si un feature nuevo replica esta estructura, se considera alineado al estandar.

## Checklist de salida

- [ ] Feature organizado por dominio.
- [ ] Pantalla con layout y estados UX completos.
- [ ] Componentes reutilizables extraidos en `components/`.
- [ ] Helpers aislados en `lib/`.
- [ ] Uso prioritario de primitives de `components/ui`.
- [ ] Consistencia visual verificada contra `playground`.
