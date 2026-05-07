import { type PropsWithChildren, useMemo } from 'react';
import { View, type ViewStyle } from 'react-native';
import { type Edge, useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/lib/utils';

type GlobalSafeAreaProps = PropsWithChildren<{
  /** Zonas del borde de pantalla que respetan inset (notch, home indicator, etc.). */
  edges?: Edge[];
  /** Clases NativeWind adicionales (evita duplicar flex: el estilo ya usa flex: 1). */
  className?: string;
}>;

const DEFAULT_EDGES: Edge[] = ['top', 'right', 'bottom', 'left'];

export function GlobalSafeArea({
  children,
  edges = DEFAULT_EDGES,
  className,
}: GlobalSafeAreaProps) {
  const insets = useSafeAreaInsets();

  const paddingStyle = useMemo((): ViewStyle => {
    const edgeSet = new Set(edges);
    return {
      flex: 1,
      paddingTop: edgeSet.has('top') ? insets.top : 0,
      paddingRight: edgeSet.has('right') ? insets.right : 0,
      paddingBottom: edgeSet.has('bottom') ? insets.bottom : 0,
      paddingLeft: edgeSet.has('left') ? insets.left : 0,
    };
  }, [edges, insets]);

  return (
    <View style={paddingStyle} className={cn(className)}>
      {children}
    </View>
  );
}
