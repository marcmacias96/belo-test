import { cva, type VariantProps } from 'class-variance-authority';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

const skeletonVariants = cva('animate-pulse bg-muted', {
  variants: {
    shape: {
      default: 'rounded-md',
      circle: 'rounded-full',
      pill: 'rounded-full',
    },
  },
  defaultVariants: {
    shape: 'default',
  },
});

export type SkeletonProps = ViewProps &
  VariantProps<typeof skeletonVariants> & {
    className?: string;
  };

export function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <View className={cn(skeletonVariants({ shape }), className)} {...props} />
  );
}
