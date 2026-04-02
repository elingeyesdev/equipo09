import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignList } from '../components/CampaignList';
import { CampaignForm } from '../components/CampaignForm';
import { CampaignFilters } from '../components/CampaignFilters';
import { CampaignPreviewModal } from '../components/CampaignPreviewModal';
import { Navbar } from '../components/Navbar';
import { getCampaignCreationReadiness } from '../api/entrepreneur.api';
import type { EntrepreneurCampaign } from '../types/campaign.types';
import type { CampaignCreationReadiness } from '../types/entrepreneur.types';
import { getApiErrorMessage } from '../utils/apiError';

export function MyCampaignsPage() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<EntrepreneurCampaign | null>(null);
  const [readiness, setReadiness] = useState<CampaignCreationReadiness | null>(null);
  const [readinessLoading, setReadinessLoading] = useState(true);

  const {
    campaigns,
    meta,
    query,
    updateQuery,
    loading,
    error,
    setError,
    adding,
    addError,
    fetchCampaigns,
    addCampaign,
    submitForReview,
    publishCampaign,
    actionCampaignId,
  } = useCampaigns();

  const loadReadiness = useCallback(async () => {
    setReadinessLoading(true);
    try {
      const r = await getCampaignCreationReadiness();
      setReadiness(r);
    } catch (e: unknown) {
      setReadiness({
        canCreateCampaigns: false,
        missingRequirements: [
          getApiErrorMessage(e, 'No se pudo comprobar si tu perfil permite crear campañas'),
        ],
      });
    } finally {
      setReadinessLoading(false);
    }
  }, []);

  useEffect(() => {
    if (showForm) return;
    loadReadiness();
  }, [showForm, loadReadiness]);

  const canCreateCampaigns = readiness?.canCreateCampaigns ?? false;
  const showProfileGate =
    !readinessLoading && readiness !== null && !canCreateCampaigns;

  const hasFilterApplied = useMemo(() => {
    const preset = query.filterPreset ?? 'all';
    return (
      preset !== 'all' ||
      !!query.search?.trim() ||
      !!query.createdFrom ||
      !!query.createdTo ||
      !!query.endDateFrom ||
      !!query.endDateTo
    );
  }, [query]);

  const openPreview = useCallback((c: EntrepreneurCampaign) => {
    setError(null);
    setPreviewCampaign(c);
  }, [setError]);

  const closePreview = useCallback(() => setPreviewCampaign(null), []);

  const handleModalSubmit = useCallback(async () => {
    if (!previewCampaign) return;
    const ok = await submitForReview(previewCampaign.id);
    if (ok) closePreview();
  }, [previewCampaign, submitForReview, closePreview]);

  const handleModalPublish = useCallback(async () => {
    if (!previewCampaign) return;
    const ok = await publishCampaign(previewCampaign.id);
    if (ok) closePreview();
  }, [previewCampaign, publishCampaign, closePreview]);

  return (
    <div className="app-container">
      <Navbar />

      <main className="page-content page-content--wide">
        <header className="campaigns-page-header">
          <div>
            <h1 className="page-title">Mis campañas</h1>
            <p className="page-subtitle">
              Filtra por estado, fechas y publica cuando estés listo.
            </p>
          </div>
          {!showForm && (
            <button
              className="btn btn-primary"
              type="button"
              disabled={readinessLoading || !canCreateCampaigns}
              onClick={() => {
                if (!readinessLoading && canCreateCampaigns) setShowForm(true);
              }}
            >
              {readinessLoading ? 'Comprobando perfil…' : 'Nueva campaña'}
            </button>
          )}
        </header>

        {showProfileGate && (
          <div
            className="alert"
            role="alert"
            style={{
              marginBottom: '1.25rem',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 12,
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.35)',
              color: 'var(--text-primary, #e5e7eb)',
            }}
          >
            <p style={{ margin: 0 }}>
              <strong>Perfil incompleto.</strong> Para crear campañas necesitas completar tu perfil de
              emprendedor. Falta: {readiness!.missingRequirements.join('; ')}.
            </p>
            <Link className="btn btn-primary" to="/entrepreneur-profile" style={{ alignSelf: 'flex-start' }}>
              Ir a mi perfil
            </Link>
          </div>
        )}

        {showForm ? (
          <div className="fade-in">
            <CampaignForm
              onSuccess={addCampaign}
              onCancel={() => setShowForm(false)}
              saving={adding}
              saveError={addError}
            />
          </div>
        ) : (
          <div className="fade-in">
            <CampaignFilters query={query} onChange={updateQuery} />

            <CampaignList
              campaigns={campaigns}
              loading={loading}
              error={error}
              onRetry={fetchCampaigns}
              onOpenForm={() => setShowForm(true)}
              canCreateCampaign={!readinessLoading && canCreateCampaigns}
              onGoToProfile={() => navigate('/entrepreneur-profile')}
              meta={meta}
              onPageChange={(page) => updateQuery({ page })}
              hasFilterApplied={hasFilterApplied}
              onPreview={openPreview}
              onSubmitForReview={submitForReview}
              onPublish={publishCampaign}
              actionCampaignId={actionCampaignId}
            />
          </div>
        )}

        <CampaignPreviewModal
          campaign={previewCampaign}
          open={previewCampaign !== null}
          onClose={closePreview}
          onSubmitForReview={previewCampaign && previewCampaign.status === 'draft' ? handleModalSubmit : undefined}
          onPublish={
            previewCampaign &&
            (previewCampaign.status === 'draft' || previewCampaign.status === 'approved')
              ? handleModalPublish
              : undefined
          }
          actionLoading={!!actionCampaignId}
        />
      </main>
    </div>
  );
}
