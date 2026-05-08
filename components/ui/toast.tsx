import * as React from 'react';
import { type PropsWithChildren } from 'react';
import { View } from 'react-native';

import { cn } from '@/lib/utils';

import { Text } from './text';

export type ToastVariant = 'default' | 'destructive';

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & { id: string };

const toastListeners = new Set<(toast: ToastRecord) => void>();

export function toast(payload: ToastInput) {
  const record: ToastRecord = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    variant: payload.variant ?? 'default',
    title: payload.title,
    description: payload.description,
  };
  toastListeners.forEach((listener) => {
    listener(record);
  });
}

export function useToast() {
  return React.useMemo(() => ({ toast }), []);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

  React.useEffect(() => {
    const dismissTimeouts = new Set<ReturnType<typeof setTimeout>>();

    const listener = (entry: ToastRecord) => {
      setToasts((prev) => [...prev, entry]);
      const tid = setTimeout(() => {
        dismissTimeouts.delete(tid);
        setToasts((prev) => prev.filter((t) => t.id !== entry.id));
      }, 3800);
      dismissTimeouts.add(tid);
    };
    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
      dismissTimeouts.forEach((tid) => clearTimeout(tid));
      dismissTimeouts.clear();
    };
  }, []);

  return (
    <View
      className="pointer-events-none absolute inset-x-0 top-12 z-50 px-4"
      pointerEvents="box-none"
    >
      {toasts.map((t) => (
        <View
          key={t.id}
          className={cn(
            'pointer-events-auto mb-2 rounded-lg border px-4 py-3 shadow-md',
            t.variant === 'default' && 'border-primary/40 bg-primary',
            t.variant === 'destructive' && 'border-destructive bg-destructive',
          )}
        >
          <Text
            className={cn(
              'font-semibold',
              t.variant === 'default' && 'text-primary-foreground',
              t.variant === 'destructive' && 'text-destructive-foreground',
            )}
          >
            {t.title}
          </Text>
          {t.description ? (
            <Text
              variant="subtitle"
              className={cn(
                'mt-1',
                t.variant === 'default' && 'text-primary-foreground/90',
                t.variant === 'destructive' && 'text-destructive-foreground/90',
              )}
            >
              {t.description}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export function ToastProvider({ children }: PropsWithChildren) {
  return (
    <View className="relative flex-1">
      {children}
      <Toaster />
    </View>
  );
}
