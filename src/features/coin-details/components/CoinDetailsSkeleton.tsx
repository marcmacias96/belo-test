import { View } from 'react-native';

import { Card, CardContent, CardHeader, Skeleton } from '@/components/ui';

export function CoinDetailsSkeleton() {
  return (
    <View testID="coin-details-skeleton" className="gap-4">
      {/* Price header skeleton */}
      <Card>
        <CardHeader className="gap-3">
          <View className="flex-row items-center justify-between">
            <Skeleton className="h-6 w-[40%]" />
            <Skeleton className="h-5 w-12 rounded-full" />
          </View>
          <Skeleton className="h-4 w-[25%]" />
        </CardHeader>
        <CardContent className="gap-3 pb-4">
          <View className="gap-1">
            <Skeleton className="h-3 w-[30%]" />
            <Skeleton className="h-7 w-[55%]" />
          </View>
          <View className="flex-row gap-4">
            <View className="flex-1 gap-1">
              <Skeleton className="h-3 w-[40%]" />
              <Skeleton className="h-5 w-[60%]" />
            </View>
            <View className="flex-1 gap-1">
              <Skeleton className="h-3 w-[40%]" />
              <Skeleton className="h-5 w-[60%]" />
            </View>
          </View>
        </CardContent>
      </Card>

      {/* Chart skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[45%]" />
        </CardHeader>
        <CardContent className="pb-4">
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>

      {/* History list skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-[50%]" />
        </CardHeader>
        <CardContent className="gap-3 pb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={`history-skeleton-${i}`} className="flex-row justify-between">
              <Skeleton className="h-4 w-[30%]" />
              <Skeleton className="h-4 w-[35%]" />
            </View>
          ))}
        </CardContent>
      </Card>
    </View>
  );
}
