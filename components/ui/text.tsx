import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/utils';

const textVariants = cva('text-foreground', {
  variants: {
    variant: {
      default: 'text-base',
      title: 'text-3xl font-semibold tracking-tight',
      cardTitle: 'text-2xl font-semibold leading-none tracking-tight',
      subtitle: 'text-sm text-muted-foreground',
      muted: 'text-sm text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export type TextProps = RNTextProps & VariantProps<typeof textVariants>;

export const Text = React.forwardRef<RNText, TextProps>(
  ({ className, variant, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  ),
);

Text.displayName = 'Text';
