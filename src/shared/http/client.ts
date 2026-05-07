import { COINGECKO_API_KEY } from '@/src/shared/config/coingecko';
import { HttpClientError } from './errors';

type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

export type FetchWithTimeoutOptions = {
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
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

export async function fetchWithTimeout(
  url: string,
  init?: RequestInit,
  options: FetchWithTimeoutOptions = {},
): Promise<Response> {
  const { timeoutMs = 10_000, maxRetries = 2, retryDelayMs = 250 } = options;

  let lastError: Error = new HttpClientError('Unknown error');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await delay(retryDelayMs * Math.pow(2, attempt - 1));
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);

    try {
      const response = await fetch(url, {
        ...init,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) return response;

      if (!isRetryableStatus(response.status) || attempt === maxRetries) {
        return response;
      }

      lastError = new HttpClientError('Transient server error', { status: response.status });
    } catch (error) {
      clearTimeout(timeoutId);

      if (isAbortError(error)) {
        throw new HttpClientError('Request timeout', { cause: error });
      }

      if (attempt === maxRetries) {
        throw error instanceof Error ? error : new HttpClientError('Network error', { cause: error });
      }

      lastError = error instanceof Error ? error : new HttpClientError('Network error', { cause: error });
    }
  }

  throw lastError;
}

export async function getJson<T extends JsonValue>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, { ...init, method: 'GET' });

  if (!response.ok) {
    throw new HttpClientError('Request failed', { status: response.status });
  }

  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new HttpClientError('Invalid JSON payload', { cause });
  }
}

/**
 * Wrapper around fetchWithTimeout that automatically injects the
 * CoinGecko Demo API key header (x-cg-demo-api-key) into every request.
 */
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
