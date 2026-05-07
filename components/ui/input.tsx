import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full rounded-md border bg-background px-3 py-2 text-base text-foreground placeholder:text-muted-foreground',
  {
    variants: {
      variant: {
        default: 'border-input',
        destructive: 'border-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type InputProps = TextInputProps &
  VariantProps<typeof inputVariants> & {
    className?: string;
  };

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, variant, ...props }, ref) => (
    <TextInput
      ref={ref}
      className={cn(inputVariants({ variant }), 'h-10', className)}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
