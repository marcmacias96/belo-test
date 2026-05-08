import { act } from '@testing-library/react-native';

/**
 * Ejecuta trabajo async (p.ej. resets de stores persistidos) dentro de `act` para
 * evitar avisos de React 19 cuando aún hay componentes montados que suscriben Zustand/React Query.
 */
export async function actAsync(operation: () => void | Promise<void>): Promise<void> {
  await act(async () => {
    await operation();
  });
}
