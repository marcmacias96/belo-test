function sanitizeNumericInput(raw: string): string {
  const normalized = raw.replace(',', '.').replace(/[^0-9.]/g, '');
  const [integerPart = '', ...decimalParts] = normalized.split('.');

  if (decimalParts.length === 0) {
    return integerPart;
  }

  return `${integerPart}.${decimalParts.join('')}`;
}

function trimTrailingZeros(value: string): string {
  if (!value.includes('.')) {
    return value;
  }

  return value.replace(/\.?0+$/, '');
}

export function formatBalanceForInput(balance: number): string {
  if (!Number.isFinite(balance) || balance <= 0) {
    return '0';
  }

  return trimTrailingZeros(balance.toFixed(8));
}

export function normalizeSwapAmountInput(raw: string): string {
  const sanitized = sanitizeNumericInput(raw);

  if (!sanitized) {
    return '';
  }

  if (sanitized === '.') {
    return '0.';
  }

  if (sanitized.endsWith('.')) {
    return sanitized;
  }

  const parsed = Number(sanitized);
  if (!Number.isFinite(parsed)) {
    return '';
  }

  return sanitized;
}
