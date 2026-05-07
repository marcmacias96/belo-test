import * as React from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

import { Text, type TextProps } from './text';

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn(
        'rounded-lg border border-border bg-card shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ViewProps) {
  return (
    <View className={cn('flex flex-col gap-y-1.5 p-6', className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: TextProps) {
  return (
    <Text
      variant="cardTitle"
      className={cn('text-card-foreground', className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: TextProps) {
  return <Text variant="subtitle" className={cn(className)} {...props} />;
}

export function CardContent({ className, ...props }: ViewProps) {
  return <View className={cn('p-6 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex flex-row items-center p-6 pt-0', className)}
      {...props}
    />
  );
}
