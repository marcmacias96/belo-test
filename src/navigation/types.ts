export type RootStackParamList = {
  Home: undefined;
  Notifications: undefined;
  CoinDetails: { coinId: string; name?: string; symbol?: string };
  Swap: { fromId?: string; toId?: string } | undefined;
};

declare global {
  namespace ReactNavigation {
    // Merges RootStackParamList into React Navigation's type system for useNavigation() inference
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
