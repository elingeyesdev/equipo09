export function computeFundingPercent(currentAmount: number, goalAmount: number): number {
  if (!Number.isFinite(currentAmount) || !Number.isFinite(goalAmount) || goalAmount <= 0) {
    return 0;
  }
  return (currentAmount / goalAmount) * 100;
}

export function clampPercentForBar(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.min(Math.max(percent, 0), 100);
}

export function formatFundingPercent(currentAmount: number, goalAmount: number): number {
  return Math.round(Math.min(computeFundingPercent(currentAmount, goalAmount), 100));
}

export function formatCampaignCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
