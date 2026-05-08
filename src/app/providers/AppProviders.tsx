import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui/toast';
import { GlobalSafeArea } from '@/src/app/layout';
import { usePriceAlertWatcher } from '@/src/features/notifications/services/priceAlertWatcher';
import { useSwapNotificationBridge } from '@/src/features/notifications/services/useSwapNotificationBridge';

import { ErrorBoundary } from './ErrorBoundary';
import { ThemeProvider } from './ThemeProvider';

function NotificationsBootstrap() {
  useSwapNotificationBridge();
  usePriceAlertWatcher();
  return null;
}

const isJest = process.env.NODE_ENV === 'test';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: isJest ? false : 2,
            staleTime: isJest ? 0 : 30_000,
            gcTime: isJest ? 0 : undefined,
            refetchOnWindowFocus: !isJest,
          },
          mutations: {
            retry: isJest ? false : undefined,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <NavigationContainer>
            <ThemeProvider>
              <GlobalSafeArea>
                <ToastProvider>
                  <NotificationsBootstrap />
                  {children}
                </ToastProvider>
              </GlobalSafeArea>
            </ThemeProvider>
          </NavigationContainer>
        </ErrorBoundary>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
