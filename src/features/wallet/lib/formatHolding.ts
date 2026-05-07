import type { AssetId } from '../types';

const MAX_DECIMALS: Record<AssetId, number> = {
  bitcoin: 8,
  ethereum: 6,
  usdt: 2,
  usdc: 2,
  dai: 2,
};

export function formatHolding(id: AssetId, amount: number): string {
  const maximumFractionDigits = MAX_DECIMALS[id] ?? 2;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits,
  }).format(amount);
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
