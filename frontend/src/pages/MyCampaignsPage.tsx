// v2026-05-24: Full social-feed redesign for MyCampaignsPage
import { useState, useCallback } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useEntrepreneurProfile } from '../hooks/useEntrepreneurProfile';
import { Navbar } from '../components/Navbar';
import { CampaignCard } from '../components/CampaignCard';
import { CampaignPreviewModal } from '../components/CampaignPreviewModal';
import { CampaignForm } from '../components/CampaignForm';
import { PublishUpdateModal } from '../components/PublishUpdateModal';
import type { EntrepreneurCampaign } from '../types/campaign.types';
import {
  Rocket, Plus, Search, AlertCircle, Loader2,
  LayoutGrid, List, TrendingUp, Users, Star,
  Zap
} from 'lucide-react';

/* ─── Small Summary Card ─── */
function SummaryStat({
  icon, label, value, accent,
}: { icon: React.ReactNode; label: string; value: string | number; accent: string }) {
  return (
    <div className="flex-1 min-w-[130px] bg-white rounded-2xl px-5 py-4 flex items-center gap-3"
      style={{ boxShadow: '0 1px 8px rgba(28,43,30,0.06)' }}>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: accent + '20' }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-[18px] font-black text-[#1c2b1e] leading-none">{value}</p>
      </div>
    </div>
  );
}

const STATUS_TABS = [
  { value: 'all',            label: 'Todas' },
  { value: 'active',         label: 'Activas' },
  { value: 'draft',          label: 'Borradores' },
  { value: 'pending_review', label: 'En Revisión' },
  { value: 'completed',      label: 'Finalizadas' },
];

export function MyCampaignsPage() {
  const {
    campaigns,
    loading,
    error,
    addCampaign,
    updateCampaign,
    submitForReview,
    publishCampaign,
    deleteCampaign: handleDelete,
    finalizeCampaign: handleFinalize,
    actionCampaignId,
  } = useCampaigns();

  const { profile } = useEntrepreneurProfile();

  const [previewCampaign, setPreviewCampaign] = useState<EntrepreneurCampaign | null>(null);
  const [editingCampaign, setEditingCampaign] = useState<EntrepreneurCampaign | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updateModalCampaign, setUpdateModalCampaign] = useState<{ id: string; title: string } | null>(null);

  const handleModalPreview = useCallback((c: EntrepreneurCampaign) => setPreviewCampaign(c), []);

  const handleModalEdit = useCallback(async (c: EntrepreneurCampaign) => {
    setPreviewCampaign(null);
    try {
      const { getMyCampaignById } = await import('../api/campaign.api');
      const fullCampaign = await getMyCampaignById(c.id);
      setEditingCampaign(fullCampaign);
    } catch {
      setEditingCampaign(c);
    }
  }, []);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && (c.status === 'published' || c.status === 'funded' || c.status === 'partially_funded')) ||
      (statusFilter === 'pending_review' && (c.status === 'pending_review' || c.status === 'in_review')) ||
      (statusFilter === 'completed' && c.status === 'completed') ||
      c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  /* Calculated summary stats */
  const totalRaised  = campaigns.reduce((s, c) => s + (c.currentAmount ?? 0), 0);
  const totalInvestors = campaigns.reduce((s, c) => s + (c.investorCount ?? 0), 0);
  const activeCount = campaigns.filter(c => c.status === 'published' || c.status === 'funded' || c.status === 'partially_funded').length;

  const formatMoney = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000   ? `$${(n / 1_000).toFixed(1)}K`
    : `$${n}`;

  return (
    <div className="min-h-screen font-['Sora',sans-serif]" style={{ background: '#f0f2f5' }}>
      <Navbar />

      {/* ── Hero / Cover Section (estilo portada de perfil FB) ── */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #1c2b1e 0%, #2e7d32 55%, #00897b 100%)',
          minHeight: '200px',
        }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #aed581, transparent 70%)' }} />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #00897b, transparent 70%)' }} />

        <div className="max-w-[1200px] mx-auto px-6 pt-10 pb-16 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              {/* Eyebrow */}
              <div className="flex items-center gap-2 mb-3">
                <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-white/80 text-[11px] font-black uppercase tracking-widest">
                  <Zap size={11} className="text-[#aed581]" />
                  Centro de Operaciones
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-3">
                Mis Campañas
              </h1>
              <p className="text-white/60 font-medium text-[15px] max-w-lg">
                Gestiona tus proyectos, monitorea el crecimiento y lanza nuevas iniciativas.
              </p>
            </div>

            {/* CTA principal */}
            <button
              id="btn-launch-campaign"
              onClick={() => setEditingCampaign({} as any)}
              className="flex items-center gap-2.5 px-7 py-4 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all active:scale-95 hover:scale-105 shadow-xl bg-white text-[#1c2b1e] hover:bg-emerald-50 cursor-pointer"
              style={{
                boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
              }}
            >
              <Plus size={18} strokeWidth={3} className="text-[#2e7d32]" />
              Lanzar Campaña
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats strip (sale de la portada) ── */}
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-wrap gap-3 -mt-6 relative z-20 mb-6">
          <SummaryStat icon={<Rocket size={18} />}    label="Campañas" value={campaigns.length}   accent="#2e7d32" />
          <SummaryStat icon={<TrendingUp size={18} />} label="Recaudado" value={formatMoney(totalRaised)} accent="#00897b" />
          <SummaryStat icon={<Users size={18} />}     label="Inversores" value={totalInvestors}    accent="#f59e0b" />
          <SummaryStat icon={<Star size={18} />}      label="Activas" value={activeCount}    accent="#aed581" />
        </div>

        {/* ── Toolbar: tabs de estado + buscador + view toggle ── */}
        <div className="bg-white rounded-2xl mb-6 overflow-hidden"
          style={{ boxShadow: '0 1px 8px rgba(28,43,30,0.06)' }}>

          {/* Status tabs */}
          <div className="flex overflow-x-auto border-b border-slate-100 px-4 gap-0 scrollbar-hide">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className="relative px-5 py-3.5 text-[13px] font-black transition-colors whitespace-nowrap flex-shrink-0"
                style={{
                  color: statusFilter === tab.value ? '#2e7d32' : '#94a3b8',
                  borderBottom: statusFilter === tab.value ? '2.5px solid #2e7d32' : '2.5px solid transparent',
                }}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-1.5 text-[10px] font-black opacity-60">
                    ({
                      campaigns.filter(c =>
                        (tab.value === 'active' && (c.status === 'published' || c.status === 'funded' || c.status === 'partially_funded')) ||
                        (tab.value === 'pending_review' && (c.status === 'pending_review' || c.status === 'in_review')) ||
                        (tab.value === 'completed' && c.status === 'completed') ||
                        c.status === tab.value
                      ).length
                    })
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search row */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="input-search-campaigns"
                type="text"
                placeholder="Buscar campaña por título..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-[13px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-200 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* View toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl flex-shrink-0">
              <button
                id="btn-view-grid"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#2e7d32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                id="btn-view-list"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#2e7d32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
              <Loader2 className="text-[#2e7d32] animate-spin" size={28} strokeWidth={2.5} />
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">Cargando campañas…</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center mb-8">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={36} />
            <p className="text-red-700 font-bold mb-4 text-[15px]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#c62828] font-black uppercase text-[12px] tracking-widest hover:underline"
            >
              Reintentar conexión
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200 mb-8">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Rocket size={32} className="text-[#2e7d32]" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-black text-[#1c2b1e] tracking-tight mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Sin resultados' : 'Empieza tu primera campaña'}
            </h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto mb-6 text-[14px]">
              {searchTerm || statusFilter !== 'all'
                ? 'No encontramos campañas con ese filtro. Prueba con otros criterios.'
                : 'Todavía no tienes campañas. ¡Lanza tu primer proyecto y comienza a recaudar!'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setEditingCampaign({} as any)}
                className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl font-black text-[13px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-100"
                style={{ background: 'linear-gradient(135deg, #2e7d32, #00897b)', color: '#fff' }}
              >
                <Plus size={16} strokeWidth={3} /> Crear campaña
              </button>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10'
                : 'flex flex-col gap-4 mb-10'
            }
          >
            {filteredCampaigns.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onPreview={handleModalPreview}
                onSubmitForReview={submitForReview}
                onPublish={publishCampaign}
                onDelete={handleDelete}
                onFinalize={handleFinalize}
                onPublishUpdate={(id, title) => setUpdateModalCampaign({ id, title })}
                actionCampaignId={actionCampaignId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {editingCampaign && (
        <div className="fixed inset-0 bg-[#1c2b1e]/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <CampaignForm
              initialData={editingCampaign.id ? editingCampaign : null}
              onSuccess={async (dto, file, documents) => {
                const success = editingCampaign.id
                  ? await updateCampaign(editingCampaign.id, dto, file, documents)
                  : await addCampaign(dto, file, documents);
                if (success) setEditingCampaign(null);
                return success;
              }}
              onCancel={() => setEditingCampaign(null)}
              saving={loading}
              saveError={null}
            />
          </div>
        </div>
      )}

      {previewCampaign && (
        <CampaignPreviewModal
          open={!!previewCampaign}
          campaign={previewCampaign}
          onClose={() => setPreviewCampaign(null)}
          onSubmitForReview={async () => {
            if (previewCampaign) {
              const ok = await submitForReview(previewCampaign.id);
              if (ok) setPreviewCampaign(null);
            }
          }}
          onPublish={async () => {
            if (previewCampaign) {
              const ok = await publishCampaign(previewCampaign.id);
              if (ok) setPreviewCampaign(null);
            }
          }}
          onEdit={handleModalEdit}
          entrepreneur={profile ? {
            firstName: profile.firstName,
            lastName:  profile.lastName,
            email:     profile.displayName || '',
            avatar:    profile.avatarUrl ?? undefined,
            bio:       profile.bio ?? undefined,
            website:   profile.website ?? undefined,
            linkedin:  profile.linkedinUrl ?? undefined,
          } : undefined}
        />
      )}

      {updateModalCampaign && (
        <PublishUpdateModal
          campaignId={updateModalCampaign.id}
          campaignTitle={updateModalCampaign.title}
          open={!!updateModalCampaign}
          onClose={() => setUpdateModalCampaign(null)}
          onSuccess={() => {
            // Can reload campaigns if needed, but stories are loaded on investor feed
          }}
        />
      )}

      {/* Keyframe inline para animación del confirm */}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
