import { View } from 'react-native';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function PortfolioAssetSkeletonList() {
  return (
    <View testID="portfolio-skeleton-list" className="gap-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={`wallet-skeleton-${index}`} className="rounded-2xl">
          <CardContent className="p-4">
            <View className="flex-row items-center gap-3">
              <Skeleton shape="circle" className="h-10 w-10" />
              <View className="flex-1 gap-2">
                <View className="flex-row items-center gap-2">
                  <Skeleton className="h-4 w-[40%]" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </View>
                <Skeleton className="h-3 w-[65%]" />
                <Skeleton className="h-3 w-[45%]" />
              </View>
              <View className="items-end gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </View>
            </View>
          </CardContent>
        </Card>
      ))}
    </View>
  );
}
