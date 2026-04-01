import { ProgressBar } from './ProgressBar';
import {
  clampPercentForBar,
  computeFundingPercent,
  formatFundingPercent,
} from '../utils/campaignFunding';

interface Props {
  currentAmount: number;
  goalAmount: number;
  investorCount: number;
}

export function CampaignProgress({ currentAmount, goalAmount, investorCount }: Props) {
  const rawPercent = computeFundingPercent(currentAmount, goalAmount);
  const barWidth = clampPercentForBar(rawPercent);
  const labelPercent = formatFundingPercent(currentAmount, goalAmount);

  return (
    <div className="campaign-progress-container">
      <ProgressBar value={barWidth} />
      <div className="progress-labels">
        <span className="progress-percentage">{labelPercent}%</span>
        <span className="progress-investors">
          {investorCount} {investorCount === 1 ? 'inversor' : 'inversores'}
        </span>
      </div>
    </div>
  );
}
