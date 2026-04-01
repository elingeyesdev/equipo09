import { formatCampaignCurrency } from '../utils/campaignFunding';

interface Props {
  currentAmount: number;
  goalAmount: number;
  currency: string;
}

export function CampaignStats({ currentAmount, goalAmount, currency }: Props) {
  return (
    <div className="campaign-stats">
      <div className="stat-row">
        <span className="stat-label">Recaudado</span>
        <span className="stat-value">{formatCampaignCurrency(currentAmount, currency)}</span>
      </div>
      <div className="stat-row">
        <span className="stat-label">Meta</span>
        <span className="stat-value">{formatCampaignCurrency(goalAmount, currency)}</span>
      </div>
    </div>
  );
}
