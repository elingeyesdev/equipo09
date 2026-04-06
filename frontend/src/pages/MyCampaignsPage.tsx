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
import { PlusCircle, AlertTriangle, ArrowRight, ChevronLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div>
            <h1 className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-none mb-3">Catálogo de Campañas</h1>
            <p className="text-[15px] font-medium text-slate-500 italic">
               Gestiona tus rondas de capital con solidez y transparencia financiera.
            </p>
          </div>
          {!showForm && (
            <button
              className="bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-black px-8 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 border-none cursor-pointer text-[14px] disabled:opacity-50 flex items-center gap-3"
              type="button"
              disabled={readinessLoading || !canCreateCampaigns}
              onClick={() => {
                if (!readinessLoading && canCreateCampaigns) setShowForm(true);
              }}
            >
              {readinessLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Auditan Perfil…
                </>
              ) : (
                <>
                  <PlusCircle size={20} strokeWidth={2.5} />
                  Nueva Campaña
                </>
              )}
            </button>
          )}
        </header>

        {showProfileGate && (
          <div
            className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8 md:p-10 mb-12 flex flex-col items-center md:items-start gap-6 animate-in slide-in-from-top-4 duration-500 shadow-xl shadow-emerald-500/5 relative overflow-hidden"
            role="alert"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-[60px] -mr-16 -mt-16"></div>
            
            <div className="flex items-center gap-4 text-[#2e7d32]">
               <AlertTriangle size={32} strokeWidth={2.5} />
               <h3 className="text-xl font-black tracking-tight leading-none">Restricción de Perfil Detectada</h3>
            </div>
            
            <p className="text-[15px] text-emerald-800/80 font-medium leading-relaxed max-w-2xl text-center md:text-left">
              Tu perfil de emprendedor aún no cumple con todos los requisitos técnicos para lanzar una oferta pública de inversión. 
              <br className="hidden md:block" />
              <strong className="text-[#2e7d32]">Pendiente:</strong> {readiness!.missingRequirements.join('; ')}.
            </p>
            
            <Link className="bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-black px-12 py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 border-none text-center no-underline text-[14px] flex items-center justify-center gap-2" to="/entrepreneur-profile">
              Completar mi Perfil 
              <ArrowRight size={18} strokeWidth={2.5} />
            </Link>
          </div>
        )}

        {showForm ? (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-8">
               <button onClick={() => setShowForm(false)} className="bg-white hover:bg-emerald-50 text-slate-500 font-bold px-4 py-2 rounded-lg border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer text-[13px] flex items-center gap-2">
                 <ChevronLeft size={16} strokeWidth={2.5} />
                 Volver
               </button>
               <span className="text-slate-300">/</span>
               <span className="text-[13px] font-black uppercase tracking-widest text-slate-400">Constructor de Campaña</span>
            </div>
            <CampaignForm
              onSuccess={addCampaign}
              onCancel={() => setShowForm(false)}
              saving={adding}
              saveError={addError}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-8 animate-in fade-in duration-500">
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
