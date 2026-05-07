import { View } from 'react-native';

import { Card, CardContent, Skeleton } from '@/components/ui';

export function MarketAssetSkeletonList() {
  return (
    <View className="gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={`market-skeleton-${index}`}>
          <CardContent className="p-4">
            <View className="flex-row items-center gap-3">
              <Skeleton shape="circle" className="h-9 w-9" />
              <View className="flex-1 gap-2">
                <Skeleton className="h-4 w-[68%]" />
                <Skeleton className="h-3 w-[42%]" />
              </View>
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
