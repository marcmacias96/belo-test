import { View } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PortfolioAssetSkeletonList() {
  return (
    <View testID="portfolio-skeleton-list" className="gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={`wallet-skeleton-${index}`}>
          <CardContent className="p-4">
            <View className="flex-row items-center gap-3">
              <Skeleton shape="circle" className="h-9 w-9" />
              <View className="flex-1 gap-2">
                <Skeleton className="h-4 w-[60%]" />
                <Skeleton className="h-3 w-[40%]" />
              </View>
              <View className="items-end gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-10" />
              </View>
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
