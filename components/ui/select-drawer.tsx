import * as React from 'react';
import { FlatList, Pressable, View } from 'react-native';

import { cn } from '@/lib/utils';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from './drawer';
import type { SelectOption } from './select';
import { Text } from './text';

export type SelectDrawerProps = {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  title?: string;
  description?: string;
  triggerClassName?: string;
};

export function SelectDrawer({
  value,
  onValueChange,
  options,
  placeholder = 'Selecciona…',
  title = 'Seleccionar',
  description,
  triggerClassName,
}: SelectDrawerProps) {
  const [open, setOpen] = React.useState(false);
  const label = options.find((o) => o.value === value)?.label ?? placeholder;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger>
        <View
          className={cn(
            'flex h-10 w-full flex-row items-center justify-between rounded-md border border-input bg-background px-3',
            triggerClassName,
          )}
        >
          <Text className="text-base text-foreground">{label}</Text>
          <Text className="text-muted-foreground">⌄</Text>
        </View>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          {description ? (
            <DrawerDescription>{description}</DrawerDescription>
          ) : null}
        </DrawerHeader>
        <FlatList
          className="max-h-80"
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
                <Text className="text-base text-foreground">{item.label}</Text>
                {selected ? <Text className="text-primary">✓</Text> : null}
              </Pressable>
            );
          }}
        />
        <DrawerFooter>
          <DrawerClose>
            <View className="w-full rounded-md border border-input bg-secondary px-4 py-3">
              <Text className="text-center font-medium text-secondary-foreground">
                Cerrar
              </Text>
            </View>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
