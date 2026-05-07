import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

export type SeparatorProps = ViewProps & {
  orientation?: 'horizontal' | 'vertical';
  decorative?: boolean;
};

export function Separator({
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: SeparatorProps) {
  return (
    <View
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'auto'}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal'
          ? 'h-px w-full'
          : 'h-full w-px self-stretch',
        className,
      )}
      {...props}
    />
  );
}
