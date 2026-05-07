import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import {
  render,
  type RenderAPI,
  type RenderOptions,
} from '@testing-library/react-native';
import { type PropsWithChildren, type ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui/toast';
import { GlobalSafeArea } from '@/src/app/layout';
import '@/src/i18n';

type WrappedRenderOptions = Omit<RenderOptions, 'wrapper'>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function renderWithProviders(
  ui: ReactElement,
  options?: WrappedRenderOptions,
): RenderAPI {
  const queryClient = createTestQueryClient();

  function TestProviders({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <GlobalSafeArea>
            <ToastProvider>{children}</ToastProvider>
          </GlobalSafeArea>
        </SafeAreaProvider>
      </QueryClientProvider>
    );
  }

  const rendered = render(ui, {
    wrapper: TestProviders,
    ...options,
  });

  const originalUnmount = rendered.unmount;
  rendered.unmount = () => {
    originalUnmount();
    queryClient.clear();
  };

  return rendered;
}
