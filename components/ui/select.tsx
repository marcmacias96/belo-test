import * as React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  type PressableProps,
  View,
} from 'react-native';

import { cn } from '@/lib/utils';

import { Text } from './text';

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type SelectContextValue = {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  open: boolean;
  setOpen: (open: boolean) => void;
  placeholder: string;
};

const SelectContext = React.createContext<SelectContextValue | undefined>(
  undefined,
);

function useSelectContext(component: string) {
  const ctx = React.useContext(SelectContext);
  if (!ctx) {
    throw new Error(`${component} must be used within <Select>`);
  }
  return ctx;
}

export type SelectProps = {
  children: React.ReactNode;
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
};

export function Select({
  children,
  value,
  onValueChange,
  options,
  placeholder = 'Selecciona…',
}: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const ctx = React.useMemo(
    () => ({
      value,
      onValueChange,
      options,
      open,
      setOpen,
      placeholder,
    }),
    [value, onValueChange, options, open, placeholder],
  );

  return (
    <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>
  );
}

export type SelectTriggerProps = Omit<
  PressableProps,
  'onPress' | 'children'
> & {
  className?: string;
};

export function SelectTrigger({ className, ...props }: SelectTriggerProps) {
  const { open, setOpen, value, options, placeholder } =
    useSelectContext('SelectTrigger');
  const label = options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      className={cn(
        'flex h-10 w-full flex-row items-center justify-between rounded-md border border-input bg-background px-3',
        className,
      )}
      onPress={() => setOpen(true)}
      {...props}
    >
      <Text className="text-base text-foreground">{label}</Text>
      <Text className="text-muted-foreground">⌄</Text>
    </Pressable>
  );
}

export type SelectContentProps = {
  title?: string;
  className?: string;
};

export function SelectContent({ title, className }: SelectContentProps) {
  const { open, setOpen, value, onValueChange, options } =
    useSelectContext('SelectContent');

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
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
            'max-h-[70%] rounded-t-2xl border-t border-border bg-card px-2 pb-6 pt-2',
            className,
          )}
        >
          {title ? (
            <Text
              variant="cardTitle"
              className="px-3 pb-3 pt-1 text-card-foreground"
            >
              {title}
            </Text>
          ) : null}
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const selected = item.value === value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected,
                    disabled: Boolean(item.disabled),
                  }}
                  disabled={item.disabled}
                  className={cn(
                    'flex flex-row items-center justify-between rounded-md px-3 py-3',
                    selected && 'bg-accent',
                    item.disabled && 'opacity-50',
                  )}
                  onPress={() => {
                    if (item.disabled) {
                      return;
                    }
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text className="text-base text-foreground">
                    {item.label}
                  </Text>
                  {selected ? <Text className="text-primary">✓</Text> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
