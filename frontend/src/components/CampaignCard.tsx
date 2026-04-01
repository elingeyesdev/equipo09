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

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
      case 'in_progress':
      case 'approved':
        return 'badge-primary';
      case 'funded':
      case 'completed':
      case 'partially_funded':
        return 'badge-success';
      case 'draft':
      case 'pending_review':
      case 'in_review':
        return 'badge-warning';
      case 'failed':
      case 'rejected':
      case 'cancelled':
      case 'suspended':
        return 'badge-error';
      default:
        return 'badge-default';
    }
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      draft: 'Borrador',
      published: 'Publicada',
      in_review: 'En revisión',
      pending_review: 'En aprobación',
      approved: 'Aprobada',
      funded: 'Financiada',
      partially_funded: 'Parcialmente financiada',
      completed: 'Completada',
      failed: 'Fallida',
      rejected: 'Rechazada',
      cancelled: 'Cancelada',
      suspended: 'Suspendida',
    };
    return map[status] || status;
  };

  const canSubmit = campaign.status === 'draft';
  const canPublish = campaign.status === 'draft' || campaign.status === 'approved';

  return (
    <div className="card campaign-card">
      <div className="campaign-card-header">
        <h3 className="campaign-title">{campaign.title}</h3>
        <span className={`badge ${getStatusBadgeClass(campaign.status)}`}>
          {getStatusLabel(campaign.status)}
        </span>
      </div>

      <p className="campaign-description">
        {campaign.shortDescription || 'Sin descripción corta.'}
      </p>

      <CampaignStats
        currentAmount={campaign.currentAmount}
        goalAmount={campaign.goalAmount}
        currency={campaign.currency || 'USD'}
      />

      <CampaignProgress
        currentAmount={campaign.currentAmount}
        goalAmount={campaign.goalAmount}
        investorCount={campaign.investorCount}
      />

      <div className="campaign-card-actions">
        {onPreview && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={busy}
            onClick={() => onPreview(campaign)}
          >
            Vista previa
          </button>
        )}
        {canSubmit && onSubmitForReview && (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={busy}
            onClick={() => onSubmitForReview(campaign.id)}
          >
            {busy ? 'Enviando…' : 'Enviar a aprobación'}
          </button>
        )}
        {canPublish && onPublish && (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={busy}
            onClick={() => onPublish(campaign.id)}
          >
            {busy ? 'Publicando…' : 'Publicar'}
          </button>
        )}
      </div>
    </div>
  );
}
