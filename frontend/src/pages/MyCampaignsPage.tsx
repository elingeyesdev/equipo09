import { useState, useMemo, useCallback } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { CampaignList } from '../components/CampaignList';
import { CampaignForm } from '../components/CampaignForm';
import { CampaignFilters } from '../components/CampaignFilters';
import { CampaignPreviewModal } from '../components/CampaignPreviewModal';
import { Navbar } from '../components/Navbar';
import type { EntrepreneurCampaign } from '../types/campaign.types';

export function MyCampaignsPage() {
  const [showForm, setShowForm] = useState(false);
  const [previewCampaign, setPreviewCampaign] = useState<EntrepreneurCampaign | null>(null);

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
            <button className="btn btn-primary" type="button" onClick={() => setShowForm(true)}>
              Nueva campaña
            </button>
          )}
        </header>

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
