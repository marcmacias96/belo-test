import { HttpClientError } from './errors';

type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject;
type JsonObject = { [key: string]: JsonValue };

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
