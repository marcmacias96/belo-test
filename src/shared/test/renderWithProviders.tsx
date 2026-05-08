import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
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
import { ThemeProvider } from '@/src/app/providers/ThemeProvider';
import type { RootStackParamList } from '@/src/navigation/types';
import '@/src/i18n';

type WrappedRenderOptions = Omit<RenderOptions, 'wrapper'>;

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
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
          <ThemeProvider>
            <GlobalSafeArea>
              <ToastProvider>{children}</ToastProvider>
            </GlobalSafeArea>
          </ThemeProvider>
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
    void queryClient.cancelQueries({ cancelRefetch: true });
    originalUnmount();
    queryClient.clear();
  };

  return rendered;
}

export type AppShellRenderAPI = RenderAPI & {
  navigationRef: ReturnType<typeof createNavigationContainerRef<RootStackParamList>>;
};

export function renderWithAppShell(
  ui: ReactElement,
  options?: WrappedRenderOptions,
): AppShellRenderAPI {
  const queryClient = createTestQueryClient();
  const navigationRef = createNavigationContainerRef<RootStackParamList>();

  function AppShellProviders({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <ThemeProvider>
            <NavigationContainer ref={navigationRef}>
              <GlobalSafeArea>
                <ToastProvider>{children}</ToastProvider>
              </GlobalSafeArea>
            </NavigationContainer>
          </ThemeProvider>
        </SafeAreaProvider>
      </QueryClientProvider>
    );
  }

  const rendered = render(ui, {
    wrapper: AppShellProviders,
    ...options,
  });

  const originalUnmount = rendered.unmount;
  rendered.unmount = () => {
    void queryClient.cancelQueries({ cancelRefetch: true });
    originalUnmount();
    queryClient.clear();
  };

  return { ...rendered, navigationRef };
}
