import { type PropsWithChildren } from 'react';
import {
  ScrollView,
  type ScrollViewProps,
  View,
  type ViewProps,
} from 'react-native';

import { cn } from '@/lib/utils';

export type ScreenLayoutProps = PropsWithChildren<{
  /** Contenedor exterior: fondo, flex, márgenes exteriores cuando apliquen. */
  className?: string;
  /** Contenido de la pantalla: padding, gap entre secciones, etc. */
  contentClassName?: string;
  /** Si es true (default), el contenido va dentro de un ScrollView vertical. */
  scroll?: boolean;
  scrollViewProps?: Omit<ScrollViewProps, 'children' | 'className'>;
  /** Props extra del View raíz cuando `scroll` es false. */
  viewProps?: Omit<ViewProps, 'children' | 'className'>;
}>;

export function ScreenLayout({
  children,
  className,
  contentClassName,
  scroll = true,
  scrollViewProps,
  viewProps,
}: ScreenLayoutProps) {
  if (scroll) {
    return (
      <ScrollView
        className={cn('flex-1', className)}
        keyboardShouldPersistTaps="handled"
        {...scrollViewProps}
      >
        <View className={contentClassName}>{children}</View>
      </ScrollView>
    );
  }

  return (
    <View className={cn('flex-1', className)} {...viewProps}>
      <View className={cn('flex-1', contentClassName)}>{children}</View>
    </View>
  );
}
