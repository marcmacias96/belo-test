import * as React from 'react';
import { Switch, View, type SwitchProps } from 'react-native';

import { cn } from '@/lib/utils';

export type ToggleProps = Omit<SwitchProps, 'value'> & {
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
  className?: string;
};

/** NativeWind + `Switch` puede fallar en algunos targets; el `className` va en un contenedor. */
export const Toggle = React.forwardRef<View, ToggleProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    const on = checked ?? false;

    return (
      <View ref={ref} className={cn(className)}>
        <Switch
          value={on}
          onValueChange={onCheckedChange}
          trackColor={{ false: '#e2e8f0', true: '#0f172a' }}
          thumbColor={on ? '#f8fafc' : '#f1f5f9'}
          ios_backgroundColor="#e2e8f0"
          {...props}
        />
      </View>
    );
  },
);

Toggle.displayName = 'Toggle';
