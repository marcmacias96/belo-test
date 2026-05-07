export class HttpClientError extends Error {
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, options?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = 'HttpClientError';
    this.status = options?.status;
    this.cause = options?.cause;
  }
}
