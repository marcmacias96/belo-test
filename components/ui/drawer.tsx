import * as React from 'react';
import { Modal, Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

import { Text, type TextProps } from './text';

type DrawerContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const DrawerContext = React.createContext<DrawerContextValue | undefined>(
  undefined,
);

function useDrawerContext(component: string) {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Drawer>`);
  }
  return ctx;
}

export type DrawerProps = {
  children: React.ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Drawer({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
}: DrawerProps) {
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
    <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>
  );
}

export type DrawerTriggerProps = {
  children: React.ReactNode;
  className?: string;
};

export function DrawerTrigger({ children, className }: DrawerTriggerProps) {
  const { setOpen } = useDrawerContext('DrawerTrigger');

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

export type DrawerContentProps = ViewProps & {
  className?: string;
};

export function DrawerContent({
  className,
  children,
  ...props
}: DrawerContentProps) {
  const { open, setOpen } = useDrawerContext('DrawerContent');

  return (
    <Modal
      animationType="fade"
      transparent
      visible={open}
      onRequestClose={() => setOpen(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <Pressable
          accessibilityRole="button"
          className="absolute inset-0"
          onPress={() => setOpen(false)}
        />
        <View
          className={cn(
            'max-h-[88%] rounded-t-2xl border-t border-border bg-card px-4 pb-8 pt-3 shadow-lg',
            className,
          )}
          {...props}
        >
          <View className="mb-3 items-center">
            <View className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}

export function DrawerHeader({ className, ...props }: ViewProps) {
  return <View className={cn('gap-1.5 pb-4', className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        'mt-4 flex flex-row flex-wrap justify-end gap-2',
        className,
      )}
      {...props}
    />
  );
}

export function DrawerTitle({ className, ...props }: TextProps) {
  return (
    <Text
      variant="cardTitle"
      className={cn('text-card-foreground', className)}
      {...props}
    />
  );
}

export function DrawerDescription({ className, ...props }: TextProps) {
  return <Text variant="subtitle" className={cn(className)} {...props} />;
}

export type DrawerCloseProps = {
  children: React.ReactNode;
  className?: string;
};

export function DrawerClose({ children, className }: DrawerCloseProps) {
  const { setOpen } = useDrawerContext('DrawerClose');

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
