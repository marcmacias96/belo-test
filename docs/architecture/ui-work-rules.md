# Reglas de trabajo UI y organizacion de features

## Objetivo

Definir un estandar unico para construir UI consistente, escalable y orientada a dominio.
El feature `market` queda como referencia visual y estructural para nuevas pantallas.

## Principios base

1. **Feature-first y dominio primero**: toda pantalla vive dentro de su feature.
2. **UI reutilizable desde `components/ui`**: evitar reinventar primitives por pantalla.
3. **Pantallas delgadas**: `screens` orquestan estado visible; la presentacion detallada vive en `components`.
4. **Estados UX explicitos**: toda pantalla con datos remotos debe cubrir `loading`, `error`, `empty` y `success`.
5. **Playground como contrato visual**: cada patron nuevo de UI debe tener equivalente o referencia en playground.

## Estructura de carpetas obligatoria por feature

Estructura recomendada (ajustable por complejidad):

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

Reglas de uso:

- `screens/`: composicion de layout, estados de pantalla y wiring de interaccion.
- `components/`: bloques presentacionales reutilizables solo dentro del feature.
- `services/`: acceso a datos externo o integraciones del dominio.
- `lib/`: helpers puros y formatters del feature.
- `types.ts`: contratos de datos del dominio del feature.
- `index.ts`: superficie publica minima del feature.

## Reglas de organizacion de pantallas

1. Cada pantalla debe usar `ScreenLayout` como contenedor base.
2. Cabecera de pantalla dentro de `Card` con `CardTitle` + `CardDescription`.
3. Controles (filtros, orden, acciones secundarias) en bloque separado.
4. Listados o contenido principal en componentes hijos (`components/*`).
5. No mezclar logica de transporte HTTP dentro de componentes presentacionales.

## Reglas de componentes UI

1. Priorizar componentes existentes en `components/ui`:
  - `Card`, `Text`, `Button`, `Badge`, `Input`, `SelectDrawer`, `Skeleton`, `Separator`, `Toggle`, etc.
2. Si un componente nuevo no existe:
  - primero validar si el patron ya vive en `playground`,
  - luego agregar primitive reutilizable en `components/ui`,
  - finalmente documentarlo en `playground`.
3. Prohibido crear estilos ad hoc repetidos en multiples pantallas si existe un primitive equivalente.

## Estandar visual minimo por pantalla de datos

Checklist obligatorio:

- Header informativo y consistente.
- Controles de filtro/orden con componentes del sistema.
- Estado `loading` con `Skeleton`.
- Estado `error` con CTA de recuperacion (`Retry` o equivalente).
- Estado `empty` legible.
- Estado `success` con celdas/tarjetas reutilizables.

## Convenciones de dependencia

- `src/features/*` puede depender de `src/shared/*` y `components/ui/*`.
- `src/shared/*` no puede depender de `src/features/*`.
- `playground` no debe importar logica de negocio de otros features.

## Ejemplo de referencia (Market)

`src/features/market/` implementa:

- pantalla principal en `screens/MarketScreen.tsx`,
- piezas de presentacion en `components/`,
- formatter aislado en `lib/formatUsd.ts`,
- estado visual completo (`loading`, `error`, `empty`, `success`) usando primitives de UI documentados en playground.

Esta estructura es la base para nuevos features anidados por dominio.