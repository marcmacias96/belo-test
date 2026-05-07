import * as React from 'react';
import { Modal, Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

import { Text, type TextProps } from './text';

type DialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DialogContext = React.createContext<DialogContextValue | undefined>(
  undefined,
);

function useDialogContext(component: string) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Dialog>`);
  }
  return ctx;
}

export type DialogProps = {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Dialog({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (!isControlled) {
        setUncontrolledOpen(next);
      }
    },
    [isControlled, onOpenChange],
  );

  const value = React.useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
}

export type DialogTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogTrigger({ children, className }: DialogTriggerProps) {
  const { setOpen } = useDialogContext('DialogTrigger');

  return (
    <Pressable
      accessibilityRole="button"
      className={className}
      onPress={() => setOpen(true)}
    >
      {children}
    </Pressable>
  );
}

export type DialogContentProps = ViewProps & {
  className?: string;
};

export function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  const { open, setOpen } = useDialogContext('DialogContent');

  return (
    <Modal
      animationType="fade"
      transparent
      visible={open}
      onRequestClose={() => setOpen(false)}
    >
      <View className="flex-1 justify-center bg-black/50 px-4">
        <Pressable
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={() => setOpen(false)}
        />
        <View
          className={cn(
            'rounded-lg border border-border bg-card p-6 shadow-lg',
            className,
          )}
          {...props}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function DialogHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1.5', className)} {...props} />;
}

export function DialogFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        'mt-6 flex flex-row flex-wrap justify-end gap-2',
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: TextProps) {
  return (
    <Text
      variant="cardTitle"
      className={cn('text-card-foreground', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }: TextProps) {
  return <Text variant="subtitle" className={cn(className)} {...props} />;
}

export type DialogCloseProps = {
  children: React.ReactNode;
  className?: string;
};

export function DialogClose({ children, className }: DialogCloseProps) {
  const { setOpen } = useDialogContext('DialogClose');

  return (
    <Pressable
      accessibilityRole="button"
      className={className}
      onPress={() => setOpen(false)}
    >
      {children}
    </Pressable>
  );
}
