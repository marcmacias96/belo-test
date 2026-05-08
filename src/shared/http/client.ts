import { COINGECKO_API_KEY } from '@/src/shared/config/coingecko';
import { HttpClientError } from './errors';

type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

export type FetchWithTimeoutOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  signal?: AbortSignal;
};

function isRetryableStatus(status: number): boolean {
  return status >= 500 && status < 600;
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Abort cuando TanStack Query cancela (`cancelQueries` / desmontaje). */
function createQueryAbortError(): Error {
  const error = new Error('The operation was aborted.');
  error.name = 'AbortError';
  return error;
}

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const {
    timeoutMs = 10_000,
    maxRetries = 2,
    retryDelayMs = 250,
    signal: optionSignal,
  } = options;

  const externalSignal = init?.signal ?? optionSignal;

  let lastError: Error = new HttpClientError('Unknown error');

  const throwIfExternallyAborted = () => {
    if (externalSignal?.aborted) throw createQueryAbortError();
  };

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    throwIfExternallyAborted();

    if (attempt > 0) {
      await delay(retryDelayMs * Math.pow(2, attempt - 1));
      throwIfExternallyAborted();
    }

    const controller = new AbortController();

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    let upstreamAbortListener: (() => void) | undefined;

    if (externalSignal) {
      if (externalSignal.aborted) {
        clearTimeout(timeoutId);
        controller.abort();
      } else {
        // Cancelación desde React Query / `cancelQueries`: limpiar el timer aunque el `fetch`
        // mockeado ignore `signal`, para no dejar `setTimeout(10s)` abierto tras el test.
        upstreamAbortListener = () => {
          clearTimeout(timeoutId);
          controller.abort();
        };
        externalSignal.addEventListener('abort', upstreamAbortListener);
      }
    }

    const { signal: _initSignalIgnored, ...restInit } = init ?? {};

    try {
      const response = await fetch(url, {
        ...restInit,
        signal: controller.signal,
      });

      if (response.ok) return response;

      if (!isRetryableStatus(response.status) || attempt === maxRetries) {
        return response;
      }

      lastError = new HttpClientError('Transient server error', { status: response.status });
    } catch (error) {
      if (isAbortError(error)) {
        if (externalSignal?.aborted) {
          throw createQueryAbortError();
        }
        throw new HttpClientError('Request timeout', { cause: error });
      }

      if (attempt === maxRetries) {
        throw error instanceof Error ? error : new HttpClientError('Network error', { cause: error });
      }

      lastError = error instanceof Error ? error : new HttpClientError('Network error', { cause: error });
    } finally {
      clearTimeout(timeoutId);
      if (upstreamAbortListener !== undefined && externalSignal) {
        externalSignal.removeEventListener('abort', upstreamAbortListener);
      }
    }
  }

  throw lastError;
}

export async function getJson<T extends JsonValue>(
  url: string,
  init?: RequestInit,
  fetchOptions: FetchWithTimeoutOptions = {},
): Promise<T> {
  const mergedOptions: FetchWithTimeoutOptions = {
    ...fetchOptions,
    maxRetries: fetchOptions.maxRetries ?? 0,
    signal: init?.signal ?? fetchOptions.signal,
  };

  const { signal: _drop, ...restInit } = init ?? {};

  const response = await fetchWithTimeout(
    url,
    {
      ...restInit,
      method: 'GET',
      signal: undefined,
    },
    mergedOptions,
  );

  if (!response.ok) {
    throw new HttpClientError('Request failed', { status: response.status });
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new HttpClientError('Invalid JSON payload', { cause });
  }
}

export async function coingeckoFetch(
  path: string,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = COINGECKO_API_KEY;
  }
  return fetchWithTimeout(path, { headers }, options);
}
