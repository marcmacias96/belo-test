# Vision Arquitectonica: TDD de Integracion

## Proposito y alcance ajustado

Este repositorio adopta una estrategia **integration-first** para entregar valor real en:

- **Market**: feature de datos reales (CoinGecko) construido con TDD.
- **Playground**: documentacion viva para construir, revisar y mantener componentes UI.

Esta guia define reglas operativas obligatorias para diseno, implementacion y validacion.

## Principios innegociables

1. **Test-first obligatorio**: no se implementa comportamiento nuevo sin test de integracion en rojo.
2. **Integracion como contrato principal**: los flujos de usuario se validan con providers reales y UI real.
3. **Mocking minimo y en frontera externa**: solo se permite mockear la capa HTTP/sistema externo.
4. **Playground sin logica de negocio**: el Playground documenta componentes; no resuelve casos de uso.
5. **Red-Green-Refactor sin saltos**: cada cambio funcional debe dejar evidencia de ese ciclo.

## Definicion formal de test de integracion (este repo)

Un test de integracion valido en este proyecto debe cumplir TODO:

- Renderiza pantalla/componente de feature con `AppProviders` o equivalente real.
- Ejecuta un flujo observable de usuario (ej.: cargar Market, ver error, reintentar).
- Mantiene reales:
  - composicion de UI,
  - providers (estado, query client, i18n, toast),
  - wiring de feature.
- Simula unicamente la frontera externa (respuesta HTTP de CoinGecko).
- Verifica resultado funcional visible (estado, texto, transicion o accion habilitada).

No califica como integracion:

- test que mockea hooks internos del feature,
- test que assert solo implementacion interna sin efecto visible,
- test smoke sin comportamiento de negocio.

## Estructura y limites arquitectonicos

Estructura objetivo de primera iteracion:

- `src/app/`: bootstrap, navegacion y wiring global.
- `src/features/market/`: UI + casos de uso + acceso a datos del feature Market.
- `src/features/playground/`: documentacion viva de componentes y patrones UI.
- `src/shared/http/`: adaptadores HTTP y normalizacion de errores.
- `src/shared/test/`: `renderWithProviders`, fixtures y helpers reutilizables.
- `tests/integration/`: pruebas por flujo de usuario.

Reglas de dependencia:

- `features/*` puede depender de `shared/*`.
- `shared/*` no depende de `features/*`.
- `playground` no depende de `market` ni de servicios de negocio.
- tests de integracion consumen la app como usuario, no internals privados.

## Convenciones de frontera de test (mocking)

Permitido:

- Mock de cliente HTTP/adaptador de red en `src/shared/http/`.
- Fixtures de respuesta externa (success, empty, error recuperable).

Prohibido:

- Mock de `AppProviders` para simplificar flujo.
- Mock de componentes UI para forzar snapshots verdes.
- Mock de hooks del feature (`useMarket*`) en tests de integracion.
- Mock de stores globales para ocultar regresiones de wiring.

## Escenarios minimos obligatorios para Market

Cada entrega del feature Market debe cubrir por integracion:

- `success`: datos cargados y mostrados correctamente.
- `empty`: estado vacio controlado y comunicacion clara.
- `error`: fallo remoto manejado con feedback visible.
- `retry`: recuperacion desde estado de error con nueva solicitud.

## Anti-patrones (rechazo automatico)

Se rechaza el cambio si ocurre cualquiera de estos casos:

- Implementacion de feature sin test de integracion previo en rojo.
- Test verde que depende de mocks internos en lugar de frontera externa.
- Playground usado para esconder flujo de negocio o side effects de produccion.
- Assertions acopladas a detalles internos en vez de comportamiento visible.
- PR con feature funcional sin evidencias de escenarios `success/error/retry`.

## Definition of Done (DoD) obligatoria

Un cambio de Market o arquitectura TDD se considera terminado solo si:

1. Existe test de integracion en rojo previo a la implementacion.
2. El flujo queda verde cubriendo escenarios obligatorios aplicables.
3. Se ejecuta refactor sin romper contrato observable.
4. No se agregan mocks fuera de frontera externa.
5. Playground se actualiza si el cambio afecta componentes/patrones UI.
6. Documentacion y naming de tests son claros, consistentes y mantenibles.

## Convenciones practicas de naming y cobertura

- Nombre de tests: `deberia <resultado> cuando <condicion>`.
- Agrupacion por feature y flujo: `tests/integration/market/*`.
- Fixtures explicitas por escenario: `market-success.fixture`, etc.
- Cobertura objetivo por feature: todos los estados de UX criticos, no solo happy path.

## Gobernanza operativa

- En code review, la primera pregunta es: **"Donde esta el test de integracion en rojo?"**
- Si el cambio modifica contrato visible, se exige ajuste de tests de integracion.
- Si el cambio modifica API externa, se exige actualizacion de fixtures de frontera.
- Esta guia prevalece sobre preferencias individuales de implementacion.
