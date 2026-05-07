import { Ionicons } from '@expo/vector-icons';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui';

type ScreenBackHeaderProps = {
  title: string;
  onBackPress: () => void;
  canGoBack?: boolean;
};

export function ScreenBackHeader({ title, onBackPress, canGoBack = true }: ScreenBackHeaderProps) {
  return (
    <View className="gap-3 pb-2">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver a la pantalla anterior"
        accessibilityHint="Regresa a la pantalla previa"
        accessibilityState={{ disabled: !canGoBack }}
        hitSlop={8}
        disabled={!canGoBack}
        onPress={onBackPress}
        className="h-11 w-11 items-start justify-center"
      >
        <Ionicons name="chevron-back" size={34} color="#111827" />
      </Pressable>
      <Text className="text-[36px] font-bold leading-[40px] tracking-tight text-foreground">{title}</Text>
    </View>
  );
}
