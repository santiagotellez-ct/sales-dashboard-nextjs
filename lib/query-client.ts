import { QueryClient } from '@tanstack/react-query';

let _client: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (_client) return _client;
  _client = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        staleTime: 60_000,
        retry: false,
      },
      mutations: { retry: false },
    },
  });
  return _client;
}
