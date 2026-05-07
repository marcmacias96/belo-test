# Skill: TDD Integration Playbook

## Objetivo

Operacionalizar la arquitectura del repo para construir features con enfoque **integration-first**, priorizando:

- **Market** como feature real con TDD.
- **Playground** como documentacion viva de componentes.

Esta skill aplica reglas de ejecucion obligatorias para evitar implementaciones sin contrato de calidad.

## Criterios de activacion

Activar esta skill cuando ocurra cualquiera de estos casos:

1. Nuevo feature en `src/features/*`.
2. Cambios funcionales en `src/features/market/*`.
3. Refactor que pueda alterar estados visibles de UI.
4. Cambio de providers, wiring global o frontera HTTP.
5. Creacion/ajuste de componentes que deban documentarse en Playground.

No activar para:

- cambios puramente cosmeticos sin impacto funcional,
- tareas de infraestructura sin comportamiento de usuario.

## Reglas obligatorias

1. **Primero test de integracion en rojo** por cada comportamiento nuevo.
2. **Mock solo en frontera externa** (HTTP/API); no mockear hooks internos ni providers.
3. **UI y providers reales** en tests de integracion.
4. **Playground sin logica de negocio**; solo ejemplos y patrones de uso.
5. **Refactor solo con suite verde** y sin debilitar asserts funcionales.

## Flujo paso a paso (obligatorio)

### Paso 1: Delimitar comportamiento

- Definir flujo de usuario y estado esperado.
- Clasificar escenario: `success`, `empty`, `error`, `retry`.
- Identificar frontera externa a simular.

### Paso 2: Escribir test en rojo

- Crear/actualizar test en `tests/integration/<feature>/`.
- Renderizar con `renderWithProviders` real.
- Simular solo respuesta externa.
- Confirmar falla inicial por motivo correcto.

### Paso 3: Implementar minimo para verde

- Implementar lo justo para cumplir contrato observable.
- Evitar optimizaciones prematuras.
- Mantener limites de capa (`features -> shared`, nunca al reves).

### Paso 4: Refactor controlado

- Simplificar nombres, duplicaciones y composicion.
- Mantener misma semantica de usuario.
- Re-ejecutar tests y asegurar estabilidad.

### Paso 5: Documentar en Playground

- Si hay cambios en componentes/patrones UI, agregar ejemplo en Playground.
- Incluir estados relevantes (default, loading, empty/error si aplica).
- No incluir llamadas reales de negocio.

### Paso 6: Cerrar con DoD

- Validar checklist de Definition of Done.
- Preparar evidencia para revision (tests y cobertura de estados).

## Limites de pruebas (test boundary conventions)

Permitido:

- Fixtures y dobles de red en capa HTTP.
- Datos controlados por escenario de flujo.

Prohibido:

- Mock de `AppProviders` para simplificar arbol.
- Mock de hooks/casos de uso internos del feature.
- Assertions sobre detalles internos no visibles al usuario.

## Outputs requeridos por ejecucion

Cada ejecucion de esta skill debe producir:

1. **Archivo(s) de test de integracion** nuevos o actualizados por flujo.
2. **Implementacion minima** en feature/capas necesarias para pasar tests.
3. **Actualizacion de Playground** cuando haya cambio de componentes/patrones.
4. **Nota breve de evidencia** con:
   - escenarios cubiertos (`success/empty/error/retry`),
   - frontera mockeada,
   - riesgo residual (si existe).

## Criterios de rechazo (fail-fast)

Rechazar la tarea o PR cuando:

- no existe test de integracion en rojo antes del cambio funcional,
- se mockea algo fuera de frontera externa,
- falta al menos un escenario obligatorio aplicable,
- Playground queda desactualizado frente a nuevos patrones UI,
- el cambio solo pasa con asserts internos fragiles.

## Plantillas cortas recomendadas

### Naming de test

`deberia <resultado visible> cuando <condicion>`

### Estructura base de caso

1. Arrange: providers reales + fixture externa.
2. Act: accion del usuario o trigger del flujo.
3. Assert: estado visible y recuperacion (si aplica).

### Checklist final rapido

- [ ] Rojo inicial comprobado.
- [ ] Verde con implementacion minima.
- [ ] Refactor sin romper contrato.
- [ ] Playground actualizado (si aplica).
- [ ] Evidencia de escenarios y frontera incluida.
