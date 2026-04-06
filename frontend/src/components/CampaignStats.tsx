import { formatCampaignCurrency } from '../utils/campaignFunding';

interface Props {
  currentAmount: number;
  goalAmount: number;
  currency: string;
}

export function CampaignStats({ currentAmount, goalAmount, currency }: Props) {
  const rowClass = "flex justify-between items-center py-1 font-['Sora',sans-serif]";
  const labelClass = "text-[11px] font-black text-slate-400 uppercase tracking-widest";
  const valueClass = "text-[13px] font-bold text-slate-900";

  return (
    <div className="flex flex-col gap-1">
      <div className={rowClass}>
        <span className={labelClass}>Recaudado</span>
        <span className={`${valueClass} text-[#2e7d32]`}>{formatCampaignCurrency(currentAmount, currency)}</span>
      </div>
      <div className={rowClass}>
        <span className={labelClass}>Meta Objetivo</span>
        <span className={valueClass}>{formatCampaignCurrency(goalAmount, currency)}</span>
      </div>
    </div>
  );
}
