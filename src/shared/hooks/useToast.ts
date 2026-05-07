import { useCallback } from 'react';

import { toast, type ToastInput } from '@/components/ui/toast';

export type UseToastReturn = {
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  show: (input: ToastInput) => void;
};

export function useToast(): UseToastReturn {
  const success = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'default' });
  }, []);

  const error = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'destructive' });
  }, []);

  const info = useCallback((title: string, description?: string) => {
    toast({ title, description, variant: 'default' });
  }, []);

  const show = useCallback((input: ToastInput) => {
    toast(input);
  }, []);

  return { success, error, info, show };
}
