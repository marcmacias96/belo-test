import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex flex-row items-center justify-center rounded-md active:opacity-90',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        destructive: 'bg-destructive',
        outline: 'border border-input bg-background active:bg-accent',
        secondary: 'bg-secondary',
        ghost: 'bg-transparent active:bg-accent',
        link: 'bg-transparent',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = PressableProps &
  VariantProps<typeof buttonVariants> & {
    className?: string;
  };

export const Button = React.forwardRef<View, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <Pressable
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
