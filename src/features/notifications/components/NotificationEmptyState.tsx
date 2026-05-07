import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, Text } from '@/components/ui';

export function NotificationEmptyState() {
  const { t } = useTranslation('notifications');

  return (
    <Card testID="notifications-empty-state" className="border-primary/20 bg-secondary/40">
      <CardContent className="p-6">
        <View className="items-center gap-2">
          <Text variant="muted" className="text-center text-foreground/80">
            {t('empty')}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
}
