import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type PropsWithChildren, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ToastProvider } from '@/components/ui/toast';
import { GlobalSafeArea } from '@/src/app/layout';

export function AppProviders({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient());

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
