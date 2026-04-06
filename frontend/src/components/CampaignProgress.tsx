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
    <div className="flex flex-col gap-3 font-['Sora',sans-serif]">
      <ProgressBar value={barWidth} />
      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest leading-none">
        <span className="text-[#2e7d32]">{labelPercent}% Recaudado</span>
        <span className="text-slate-400">
          {investorCount} {investorCount === 1 ? 'inversor' : 'inversores'}
        </span>
      </div>
    </div>
  );
}
