import { CampaignCard } from './CampaignCard';
import type { EntrepreneurCampaign } from '../types/campaign.types';

interface Props {
  campaigns: EntrepreneurCampaign[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenForm: () => void;
}

export function CampaignList({ campaigns, loading, error, onRetry, onOpenForm }: Props) {
  if (loading && campaigns.length === 0) {
    return (
      <div className="campaign-empty-state">
        <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        <p>Cargando tus campañas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert-error" style={{ margin: '2rem 0' }}>
        <p><strong>🚨 Error:</strong> {error}</p>
        <button className="btn btn-ghost" onClick={onRetry} style={{ marginTop: '1rem' }}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!loading && campaigns.length === 0) {
    return (
      <div className="campaign-empty-state">
        <div className="empty-icon">🚀</div>
        <h2>Aún no tienes campañas activas</h2>
        <p className="text-muted">
          Comienza tu viaje de crowdfunding creando tu primera campaña y atrayendo inversiones.
        </p>
        <button className="btn btn-primary" onClick={onOpenForm} style={{ marginTop: '1.5rem' }}>
          ✦ Crear mi primera campaña
        </button>
      </div>
    );
  }

  return (
    <div className="campaign-grid">
      {campaigns.map((c) => (
        <CampaignCard key={c.id} campaign={c} />
      ))}
    </div>
  );
}
