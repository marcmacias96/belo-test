import { useQuery } from '@tanstack/react-query';
import { NavigationContext } from '@react-navigation/native';
import { useContext, useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Separator,
  Text,
} from '@/components/ui';
import { toast } from '@/components/ui/toast';
import { ScreenBackHeader, ScreenLayout } from '@/src/app';
import { ASSET_METADATA, type AssetId } from '@/src/features/wallet/types';
import { useWalletStore } from '@/src/features/wallet/state/useWalletStore';
import { swapEventEmitter } from '@/src/shared/events/swapEvents';

import { SwapAssetPicker, SwapConfirmButton, SwapPreviewCard } from '../components';
import { computeSwap } from '../lib/computeSwap';
import {
  formatBalanceForInput,
  normalizeSwapAmountInput,
} from '../lib/normalizeSwapAmountInput';
import { validateSwap } from '../lib/validateSwap';
import { fetchSwapPrices } from '../services/fetchSwapPrices';
import { useTransactionsStore } from '../state/useTransactionsStore';
import type { Transaction, ValidationError } from '../types';

type SwapScreenProps = {
  fromId?: string;
  toId?: string;
};

const SWAP_PERCENT_OPTIONS = [25, 50, 75, 100] as const;

function getValidationMessage(error: ValidationError): string {
  switch (error) {
    case 'INSUFFICIENT_BALANCE':
      return 'Insufficient balance';
    case 'BELOW_MIN_USD':
      return 'Minimum swap is $1 USD';
    case 'SAME_ASSET':
      return 'From and To assets must be different';
    case 'INVALID_AMOUNT':
      return 'Enter a valid amount';
    default: {
      const _exhaustive: never = error;
      return `Unknown error: ${_exhaustive}`;
    }
  }
}

export function SwapScreen({ fromId: initFromId, toId: initToId }: SwapScreenProps) {
  const navigation = useContext(NavigationContext);
  const [fromId, setFromId] = useState<AssetId>((initFromId as AssetId) ?? 'bitcoin');
  const [toId, setToId] = useState<AssetId>((initToId as AssetId) ?? 'ethereum');
  const [fromAmountText, setFromAmountText] = useState('');

  const balance = useWalletStore((state) => state.getBalance(fromId));
  const applySwap = useWalletStore((state) => state.applySwap);
  const addTransaction = useTransactionsStore((state) => state.addTransaction);

  const pricesQuery = useQuery({
    queryKey: ['swap', 'prices', fromId, toId],
    queryFn: () => fetchSwapPrices(fromId, toId),
    staleTime: 5_000,
    retry: false,
  });

  const parsedAmount = parseFloat(fromAmountText);
  const priceIn = pricesQuery.data?.priceIn ?? 0;
  const priceOut = pricesQuery.data?.priceOut ?? 0;

  const toAmount =
    pricesQuery.data && !isNaN(parsedAmount) && parsedAmount > 0
      ? computeSwap({ fromAmount: parsedAmount, priceIn, priceOut })
      : null;

  const validation = validateSwap({
    fromId,
    toId,
    fromAmount: parsedAmount,
    balance,
    priceIn,
  });

  const hasTyped = fromAmountText.length > 0;
  const showValidationError =
    !validation.valid && (validation.error === 'SAME_ASSET' || hasTyped);
  const showInlineInsufficientBalanceError =
    !validation.valid && validation.error === 'INSUFFICIENT_BALANCE' && hasTyped;
  const showCardValidationError = showValidationError && !showInlineInsufficientBalanceError;

  const canConfirm =
    !pricesQuery.isPending &&
    !pricesQuery.isError &&
    pricesQuery.data !== undefined &&
    hasTyped &&
    validation.valid;

  function handleAmountChange(value: string) {
    const nextValue = normalizeSwapAmountInput(value);
    setFromAmountText(nextValue);
  }

  function handleUseMaxAmount() {
    setFromAmountText(formatBalanceForInput(balance));
  }

  function handleUsePercentageAmount(percent: (typeof SWAP_PERCENT_OPTIONS)[number]) {
    const amount = (balance * percent) / 100;
    setFromAmountText(formatBalanceForInput(amount));
  }

  function isPercentActive(percent: (typeof SWAP_PERCENT_OPTIONS)[number]): boolean {
    if (balance <= 0 || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return false;
    }

    const targetAmount = (balance * percent) / 100;
    const epsilon = Math.max(1e-8, balance * 1e-6);
    return Math.abs(parsedAmount - targetAmount) <= epsilon;
  }

  function handleConfirm() {
    if (!canConfirm || !pricesQuery.data || toAmount === null) return;

    try {
      const tx: Transaction = {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        fromId,
        toId,
        fromAmount: parsedAmount,
        toAmount,
        priceIn,
        priceOut,
        executedAt: new Date().toISOString(),
      };

      applySwap({ fromId, toId, fromAmount: parsedAmount, toAmount });
      addTransaction(tx);
      swapEventEmitter.emit(tx);

      toast({
        title: 'Swap executed!',
        description: `${parsedAmount} ${ASSET_METADATA[fromId].symbol} → ${toAmount.toFixed(6)} ${ASSET_METADATA[toId].symbol}`,
      });

      setFromAmountText('');
    } catch {
      toast({
        title: 'Swap failed',
        description: 'Could not complete the swap.',
        variant: 'destructive',
      });
    }
  }

  function handleBackPress() {
    if (!navigation) {
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('Home' as never);
  }

  return (
    <ScreenLayout
      className="bg-background"
      contentClassName="gap-4 px-4 pb-16 pt-4"
      scrollViewProps={{ testID: 'swap-screen' }}
    >
      <ScreenBackHeader title="Swap" onBackPress={handleBackPress} canGoBack={navigation !== null} />
      <Card>
        <CardHeader>
          <CardTitle>Swap</CardTitle>
          <CardDescription>Exchange between your portfolio assets.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="gap-3 pt-4">
          <View className="gap-1">
            <Text className="text-sm font-medium text-muted-foreground">From</Text>
            <SwapAssetPicker
              label="From"
              value={fromId}
              onChange={(v) => {
                setFromId(v);
                setFromAmountText('');
              }}
              exclude={toId}
            />
          </View>

          <Input
            accessibilityLabel="Swap amount input"
            keyboardType="decimal-pad"
            variant={showInlineInsufficientBalanceError ? 'destructive' : 'default'}
            value={fromAmountText}
            onChangeText={handleAmountChange}
            placeholder="0.00"
          />
          {showInlineInsufficientBalanceError ? (
            <Text testID="swap-validation-error" className="text-xs text-destructive">
              {getValidationMessage(validation.error)}
            </Text>
          ) : null}
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">
              Available: {formatBalanceForInput(balance)} {ASSET_METADATA[fromId].symbol}
            </Text>
            <Button
              size="sm"
              variant="secondary"
              accessibilityRole="button"
              accessibilityLabel="Use max swap amount"
              disabled={balance <= 0}
              onPress={handleUseMaxAmount}
            >
              <Text className="font-medium">MAX</Text>
            </Button>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {SWAP_PERCENT_OPTIONS.map((percent) => (
              <Button
                key={percent}
                size="sm"
                variant={isPercentActive(percent) ? 'secondary' : 'outline'}
                accessibilityRole="button"
                accessibilityLabel={`Use ${percent}% swap amount`}
                accessibilityState={{ selected: isPercentActive(percent), disabled: balance <= 0 }}
                disabled={balance <= 0}
                onPress={() => handleUsePercentageAmount(percent)}
              >
                <Text className="font-medium">{percent}%</Text>
              </Button>
            ))}
          </View>

          <View className="gap-1">
            <Text className="text-sm font-medium text-muted-foreground">To</Text>
            <SwapAssetPicker label="To" value={toId} onChange={setToId} exclude={fromId} />
          </View>
        </CardContent>
      </Card>

      {showCardValidationError && !validation.valid ? (
        <Card>
          <CardContent className="p-4">
            <Text testID="swap-validation-error" className="text-destructive">
              {getValidationMessage(validation.error)}
            </Text>
          </CardContent>
        </Card>
      ) : null}

      {pricesQuery.isPending && fromId !== toId ? (
        <Card>
          <CardContent className="p-4">
            <Text>Loading swap prices...</Text>
          </CardContent>
        </Card>
      ) : null}

      {pricesQuery.isError ? (
        <Card>
          <CardContent className="gap-3 p-4">
            <Text testID="swap-prices-error">Could not load swap prices.</Text>
            <Button
              accessibilityRole="button"
              accessibilityLabel="Retry loading swap prices"
              onPress={() => void pricesQuery.refetch()}
            >
              <Text className="font-medium text-primary-foreground">Retry</Text>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {pricesQuery.data && toAmount !== null ? (
        <SwapPreviewCard
          fromId={fromId}
          toId={toId}
          fromAmount={parsedAmount}
          toAmount={toAmount}
          priceIn={priceIn}
          priceOut={priceOut}
        />
      ) : null}

      <Separator />

      <SwapConfirmButton disabled={!canConfirm} onPress={handleConfirm} />
    </ScreenLayout>
  );
}
