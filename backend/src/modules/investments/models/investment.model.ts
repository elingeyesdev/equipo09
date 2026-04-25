export type InvestmentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded' | 'cancelled';

export interface Investment {
  id: string;
  campaignId: string;
  investorId: string;
  rewardTierId: string | null;
  amount: number;
  currency: string;
  status: InvestmentStatus;
  paymentMethod: string | null;
  paymentIntentId: string | null;
  isAnonymous: boolean;
  message: string | null;
  refundReason: string | null;
  refundedAmount: number | null;
  refundedAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export function mapRowToInvestment(row: any): Investment {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    investorId: row.investor_id,
    rewardTierId: row.reward_tier_id ?? null,
    amount: Number(row.amount),
    currency: row.currency,
    status: row.status as InvestmentStatus,
    paymentMethod: row.payment_method ?? null,
    paymentIntentId: row.payment_intent_id ?? null,
    isAnonymous: row.is_anonymous ?? false,
    message: row.message ?? null,
    refundReason: row.refund_reason ?? null,
    refundedAmount: row.refunded_amount ? Number(row.refunded_amount) : null,
    refundedAt: row.refunded_at ?? null,
    ipAddress: row.ip_address ?? null,
    userAgent: row.user_agent ?? null,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface InvestmentResult {
  ticket: Investment;
  remainingBalance: number;
}
