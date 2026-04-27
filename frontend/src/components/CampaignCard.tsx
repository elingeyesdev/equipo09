import type { EntrepreneurCampaign } from '../types/campaign.types';
import { CampaignStats } from './CampaignStats';
import { CampaignProgress } from './CampaignProgress';

interface Props {
  campaign: EntrepreneurCampaign;
  onPreview?: (campaign: EntrepreneurCampaign) => void;
  onSubmitForReview?: (campaignId: string) => void;
  onPublish?: (campaignId: string) => void;
  actionCampaignId?: string | null;
}

export function CampaignCard({
  campaign,
  onPreview,
  onSubmitForReview,
  onPublish,
  actionCampaignId,
}: Props) {
  const busy = actionCampaignId === campaign.id;

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'published':
      case 'approved':
        return 'bg-emerald-50 text-[#2e7d32] border-emerald-100';
      case 'draft':
        return 'bg-slate-50 text-slate-500 border-slate-200';
      case 'pending_review':
      case 'in_review':
        return 'bg-amber-50 text-[#f9a825] border-amber-200';
      case 'rejected':
        return 'bg-red-50 text-[#c62828] border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: 'Borrador',
      published: 'Publicada',
      in_review: 'En revisión',
      pending_review: 'En revisión',
      approved: 'Aprobado',
      rejected: 'Rechazado',
    };
    return map[status] || status;
  };

  const canSubmit = campaign.status === 'draft';
  const canPublish = campaign.status === 'draft' || campaign.status === 'approved';

  return (
    <div className="bg-white border border-emerald-50 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-6 font-['Sora',sans-serif] group">
      <div className="flex justify-between items-start gap-4">
        <h3 className="text-[17px] font-black text-[#1c2b1e] tracking-tight leading-tight group-hover:text-[#2e7d32] transition-colors">{campaign.title}</h3>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors shrink-0 ${getStatusBadgeStyles(campaign.status)}`}>
          {getStatusLabel(campaign.status)}
        </span>
      </div>

      <p className="text-[14px] text-slate-500 font-medium leading-relaxed line-clamp-2 min-h-[2.8em]">
        {campaign.shortDescription || 'Embárcate en esta increíble oportunidad de inversión con alto potencial de retorno.'}
      </p>

      <div className="flex flex-col gap-4 bg-emerald-50/20 p-4 rounded-2xl border border-emerald-50/50">
        <CampaignStats
          currentAmount={campaign.currentAmount}
          goalAmount={campaign.goalAmount}
          currency={campaign.currency || 'USD'}
          endDate={campaign.endDate}
          investorCount={campaign.investorCount}
        />

        <CampaignProgress
          currentAmount={campaign.currentAmount}
          goalAmount={campaign.goalAmount}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-auto">
        {onPreview && (
          <button
            type="button"
            className="bg-white hover:bg-emerald-50 text-slate-600 font-bold border border-emerald-100 rounded-xl py-2.5 text-[13px] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            disabled={busy}
            onClick={() => onPreview(campaign)}
          >
            Vista Previa
          </button>
        )}
        {canSubmit && onSubmitForReview && (
          <button
            type="button"
            className="bg-[#f9a825] hover:bg-amber-600 text-white font-bold border-none rounded-xl py-2.5 text-[13px] active:scale-95 transition-all disabled:opacity-50 shadow-sm cursor-pointer"
            disabled={busy}
            onClick={() => onSubmitForReview(campaign.id)}
          >
            {busy ? 'Enviando…' : 'Enviar Revisión'}
          </button>
        )}
        {canPublish && onPublish && !canSubmit && (
          <button
            type="button"
            className="col-span-1 bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-bold border-none rounded-xl py-2.5 text-[13px] active:scale-95 transition-all disabled:opacity-50 shadow-emerald-200 shadow-md cursor-pointer"
            disabled={busy}
            onClick={() => onPublish(campaign.id)}
          >
            {busy ? 'Publicando…' : 'Publicar Ahora'}
          </button>
        )}
      </div>
    </div>
  );
}
