import { CampaignCard } from './CampaignCard';
import type { EntrepreneurCampaign } from '../types/campaign.types';

interface Meta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}

interface Props {
  campaigns: EntrepreneurCampaign[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenForm: () => void;
  meta: Meta | null;
  onPageChange: (page: number) => void;
  hasFilterApplied: boolean;
  onPreview?: (campaign: EntrepreneurCampaign) => void;
  onSubmitForReview?: (campaignId: string) => void;
  onPublish?: (campaignId: string) => void;
  actionCampaignId?: string | null;
}

export function CampaignList({
  campaigns,
  loading,
  error,
  onRetry,
  onOpenForm,
  meta,
  onPageChange,
  hasFilterApplied,
  onPreview,
  onSubmitForReview,
  onPublish,
  actionCampaignId,
}: Props) {
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
        <p>
          <strong>Error:</strong> {error}
        </p>
        <button className="btn btn-ghost" onClick={onRetry} style={{ marginTop: '1rem' }}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!loading && campaigns.length === 0) {
    return (
      <div className="campaign-empty-state">
        <div className="empty-icon empty-icon--neutral" aria-hidden />
        <h2>{hasFilterApplied ? 'Sin resultados' : 'Aún no tienes campañas'}</h2>
        <p className="text-muted">
          {hasFilterApplied
            ? 'Prueba ajustar filtros, fechas o la búsqueda por título.'
            : 'Comienza creando tu primera campaña y atrayendo inversiones.'}
        </p>
        {!hasFilterApplied && (
          <button className="btn btn-primary" onClick={onOpenForm} style={{ marginTop: '1.5rem' }}>
            Crear mi primera campaña
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="campaign-grid">
        {campaigns.map((c) => (
          <CampaignCard
            key={c.id}
            campaign={c}
            onPreview={onPreview}
            onSubmitForReview={onSubmitForReview}
            onPublish={onPublish}
            actionCampaignId={actionCampaignId}
          />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <nav className="campaign-pagination" aria-label="Paginación">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={meta.currentPage <= 1 || loading}
            onClick={() => onPageChange(meta.currentPage - 1)}
          >
            Anterior
          </button>
          <span className="campaign-pagination-info">
            Página {meta.currentPage} de {meta.totalPages}
            <span className="campaign-pagination-total">({meta.totalItems} campañas)</span>
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={meta.currentPage >= meta.totalPages || loading}
            onClick={() => onPageChange(meta.currentPage + 1)}
          >
            Siguiente
          </button>
        </nav>
      )}
    </>
  );
}
