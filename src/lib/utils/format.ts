const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBnDigits(value: number | string) {
  return String(value).replace(/\d/g, (digit) => BN_DIGITS[Number(digit)]);
}

export function formatCurrencyBn(value: number) {
  return `৳${new Intl.NumberFormat('bn-BD').format(value)}`;
}

export function formatCompactBn(value: number) {
  return new Intl.NumberFormat('bn-BD', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value);
}
