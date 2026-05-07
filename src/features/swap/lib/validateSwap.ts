import type { AssetId } from '@/src/features/wallet/types';
import type { ValidationResult } from '../types';

type ValidateSwapParams = {
  fromId: AssetId;
  toId: AssetId;
  fromAmount: number;
  balance: number;
  priceIn: number;
};

export function validateSwap({
  fromId,
  toId,
  fromAmount,
  balance,
  priceIn,
}: ValidateSwapParams): ValidationResult {
  if (fromId === toId) {
    return { valid: false, error: 'SAME_ASSET' };
  }

  if (isNaN(fromAmount) || fromAmount <= 0) {
    return { valid: false, error: 'INVALID_AMOUNT' };
  }

  if (fromAmount > balance) {
    return { valid: false, error: 'INSUFFICIENT_BALANCE' };
  }

  if (priceIn > 0 && fromAmount * priceIn < 1) {
    return { valid: false, error: 'BELOW_MIN_USD' };
  }

  return { valid: true };
}
