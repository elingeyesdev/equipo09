import type { EntrepreneurCampaign } from '../types/campaign.types';

interface Props {
  campaign: EntrepreneurCampaign;
}

export function CampaignCard({ campaign }: Props) {
  // Calculamos porcentaje de financiación real
  const percentage = campaign.goalAmount > 0
    ? Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100)
    : 0;
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: campaign.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Mapeo básico de badge según status
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
      case 'in_progress':
      case 'approved':
        return 'badge-primary';
      case 'funded':
      case 'completed':
        return 'badge-success';
      case 'draft':
      case 'pending_review':
        return 'badge-warning';
      case 'failed':
      case 'rejected':
      case 'cancelled':
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
      pending_review: 'Pendiente',
      approved: 'Aprobada',
      funded: 'Financiada',
      completed: 'Completada',
      failed: 'Fallida',
      rejected: 'Rechazada',
      cancelled: 'Cancelada'
    };
    return map[status] || status;
  };

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

      <div className="campaign-stats">
        <div className="stat-row">
          <span className="stat-label">Recaudado</span>
          <span className="stat-value">{formatCurrency(campaign.currentAmount)}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Meta</span>
          <span className="stat-value">{formatCurrency(campaign.goalAmount)}</span>
        </div>
      </div>

      <div className="campaign-progress-container">
        <div className="progress-bar-bg">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="progress-labels">
          <span className="progress-percentage">{percentage}%</span>
          <span className="progress-investors">{campaign.investorCount} inversores</span>
        </div>
      </div>
    </div>
  );
}
