import type { AssetId } from '@/src/features/wallet/types';
import type { SwapExecutedPayload } from '@/src/shared/events/swapEvents';

export type Transaction = SwapExecutedPayload & {
  fromId: AssetId;
  toId: AssetId;
};

export type SwapPrices = {
  priceIn: number;
  priceOut: number;
};

export type SwapFormState = {
  fromId: AssetId;
  toId: AssetId;
  fromAmountText: string;
};

export type SwapResult = {
  toAmount: number;
  priceIn: number;
  priceOut: number;
  valueUsd: number;
};

export type ValidationError =
  | 'INSUFFICIENT_BALANCE'
  | 'BELOW_MIN_USD'
  | 'SAME_ASSET'
  | 'INVALID_AMOUNT';

export type ValidationResult =
  | { valid: true }
  | { valid: false; error: ValidationError };
