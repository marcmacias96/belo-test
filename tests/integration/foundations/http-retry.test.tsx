/// <reference types="jest" />

import { fetchWithTimeout } from '@/src/shared/http/client';
import {
  flaky503Then200,
  neverResolves,
  okJson,
  errorResponse,
} from '@/src/shared/test/fixtures/http';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  jest.clearAllMocks();
});

describe('http-retry foundations', () => {
  it('deberia reintentar dos veces y mostrar exito cuando la primera respuesta falla con 503', async () => {
    globalThis.fetch = flaky503Then200({ result: 'ok' }, 1) as unknown as typeof fetch;

    const response = await fetchWithTimeout('http://test.example.com/api', undefined, {
      retryDelayMs: 1,
    });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('deberia mostrar error final cuando se exceden los reintentos', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue(errorResponse(503)) as unknown as typeof fetch;

    const response = await fetchWithTimeout('http://test.example.com/api', undefined, {
      maxRetries: 2,
      retryDelayMs: 1,
    });

    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    expect(globalThis.fetch).toHaveBeenCalledTimes(3);
  });

  it('deberia abortar la peticion cuando se supera el timeout configurado', async () => {
    globalThis.fetch = neverResolves() as unknown as typeof fetch;

    await expect(
      fetchWithTimeout('http://test.example.com/api', undefined, {
        timeoutMs: 50,
        maxRetries: 0,
      }),
    ).rejects.toThrow('Request timeout');
  });
});
