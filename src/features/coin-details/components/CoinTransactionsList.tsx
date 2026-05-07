import { memo, useCallback } from 'react';
import { FlatList, View } from 'react-native';

import { Badge, Card, CardContent, CardHeader, CardTitle, Separator, Text } from '@/components/ui';
import { ASSET_METADATA } from '@/src/features/wallet/types';

import type { Transaction } from '@/src/features/swap/types';

type CoinTransactionsListProps = {
  coinId: string;
  transactions: Transaction[];
};

type TransactionRowProps = {
  coinId: string;
  transaction: Transaction;
  showSeparator: boolean;
};

function formatExecutedAt(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatCoinImpact(coinId: string, transaction: Transaction): string {
  if (transaction.toId === coinId) {
    return `+${transaction.toAmount.toFixed(4)} ${ASSET_METADATA[transaction.toId].symbol}`;
  }

  if (transaction.fromId === coinId) {
    return `-${transaction.fromAmount.toFixed(4)} ${ASSET_METADATA[transaction.fromId].symbol}`;
  }

  return `${transaction.fromAmount.toFixed(4)} ${ASSET_METADATA[transaction.fromId].symbol}`;
}

const TransactionRow = memo(function TransactionRow({
  coinId,
  transaction,
  showSeparator,
}: TransactionRowProps) {
  const fromSymbol = ASSET_METADATA[transaction.fromId].symbol;
  const toSymbol = ASSET_METADATA[transaction.toId].symbol;
  const impactLabel = formatCoinImpact(coinId, transaction);

  return (
    <View className="gap-2 py-1">
      <View className="flex-row items-start justify-between gap-2">
        <Text className="flex-1 text-base font-semibold">
          {transaction.fromAmount.toFixed(4)} {fromSymbol} -> {transaction.toAmount.toFixed(4)} {toSymbol}
        </Text>
        <Badge variant="outline">{formatExecutedAt(transaction.executedAt)}</Badge>
      </View>
      <View className="flex-row items-center justify-between">
        <Text variant="muted" className="text-xs">
          {fromSymbol}/{toSymbol}
        </Text>
        <Text className="text-xs font-medium text-muted-foreground">{impactLabel}</Text>
      </View>
      {showSeparator ? <Separator className="mt-1" /> : null}
    </View>
  );
});

export function CoinTransactionsList({ coinId, transactions }: CoinTransactionsListProps) {
  const keyExtractor = useCallback((item: Transaction) => item.id, []);
  const renderItem = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => (
      <TransactionRow coinId={coinId} transaction={item} showSeparator={index < transactions.length - 1} />
    ),
    [coinId, transactions.length],
  );

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <Text testID="coin-transactions-empty" variant="muted">
            No swap transactions yet for this coin.
          </Text>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="gap-2">
        <CardTitle className="text-base">Swap Transactions</CardTitle>
        <Text variant="muted" className="text-xs">
          {transactions.length} transaction{transactions.length === 1 ? '' : 's'}
        </Text>
      </CardHeader>
      <CardContent className="gap-2 pb-4" testID="coin-transactions-list">
        <FlatList
          data={transactions}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
          removeClippedSubviews={false}
          initialNumToRender={10}
          accessibilityLabel="Swap transactions list"
        />
      </CardContent>
    </Card>
  );
}
