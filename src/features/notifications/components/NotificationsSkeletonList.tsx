import { View } from 'react-native';

import { Card, CardContent, Skeleton } from '@/components/ui';

export function NotificationsSkeletonList() {
  return (
    <View className="gap-3" testID="notifications-skeleton-list">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={`notifications-skeleton-${index}`}>
          <CardContent className="p-4">
            <View className="flex-row items-center gap-3">
              <Skeleton className="h-6 w-12 rounded-full" />
              <View className="flex-1 gap-2">
                <Skeleton className="h-4 w-[70%]" />
                <Skeleton className="h-3 w-[50%]" />
              </View>
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
