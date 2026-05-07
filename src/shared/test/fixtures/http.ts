type MockFetchResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

export function okJson(payload: unknown = { data: 'ok' }): MockFetchResponse {
  return {
    ok: true,
    status: 200,
    json: async () => payload,
  };
}

export function errorResponse(status = 500): MockFetchResponse {
  return {
    ok: false,
    status,
    json: async () => ({}),
  };
}

export function flaky503Then200(
  payload: unknown = { data: 'ok' },
  failCount = 1,
): jest.Mock {
  const mock = jest.fn();
  for (let i = 0; i < failCount; i++) {
    mock.mockResolvedValueOnce(errorResponse(503));
  }
  mock.mockResolvedValue(okJson(payload));
  return mock;
}

export function neverResolves(): jest.Mock {
  return jest.fn().mockImplementation(
    (_url: string, init?: RequestInit) =>
      new Promise<never>((_resolve, reject) => {
        const signal = init?.signal;
        if (signal) {
          const onAbort = () => {
            const err = new Error('AbortError');
            err.name = 'AbortError';
            reject(err);
            signal.removeEventListener('abort', onAbort);
          };
          signal.addEventListener('abort', onAbort);
        }
      }),
  );
}
