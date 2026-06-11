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
    <div className="flex-1 min-w-[130px] bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent + '15' }}>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-gray-400 mb-0.5">{label}</p>
        <p className="text-[18px] font-bold text-gray-900 leading-none">{value}</p>
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
    <div className="min-h-screen bg-gray-50 pb-16" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      {/* Hero / Cover Section */}
      <div className="bg-white border-b border-gray-200 py-10 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[12px] font-semibold bg-[#E6F9F0] text-[#017A42] mb-3">
                Centro de Operaciones
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
                Mis Campañas
              </h1>
              <p className="text-[15px] text-gray-500 max-w-lg leading-relaxed">
                Gestiona tus proyectos, monitorea el crecimiento y lanza nuevas iniciativas.
              </p>
            </div>

            {/* CTA principal */}
            <button
              id="btn-launch-campaign"
              onClick={() => setEditingCampaign({} as any)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[14px] text-white border-none cursor-pointer transition-all active:scale-95"
              style={{
                background: '#02A95C',
                fontFamily: "'Plus Jakarta Sans', sans-serif"
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#017A42')}
              onMouseLeave={e => (e.currentTarget.style.background = '#02A95C')}
            >
              <Plus size={18} strokeWidth={2.5} />
              Lanzar Campaña
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-[1200px] mx-auto px-6 pt-8">
        <div className="flex flex-wrap gap-4 mb-8">
          <SummaryStat icon={<Rocket size={18} />}    label="Campañas" value={campaigns.length}   accent="#2e7d32" />
          <SummaryStat icon={<TrendingUp size={18} />} label="Recaudado" value={formatMoney(totalRaised)} accent="#00897b" />
          <SummaryStat icon={<Users size={18} />}     label="Inversores" value={totalInvestors}    accent="#f59e0b" />
          <SummaryStat icon={<Star size={18} />}      label="Activas" value={activeCount}    accent="#aed581" />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden shadow-sm">
          {/* Status tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 px-4 gap-0 scrollbar-hide">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className="relative px-5 py-3.5 text-[13px] font-semibold transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer border-none bg-transparent"
                style={{
                  color: statusFilter === tab.value ? '#02A95C' : '#6b7280',
                  borderBottom: statusFilter === tab.value ? '2px solid #02A95C' : '2px solid transparent',
                  fontFamily: "'Plus Jakarta Sans', sans-serif"
                }}
              >
                {tab.label}
                {tab.value !== 'all' && (
                  <span className="ml-1.5 text-[11px] font-medium text-gray-400">
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
          <div className="flex items-center gap-3 px-4 py-3 bg-white">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                id="input-search-campaigns"
                type="text"
                placeholder="Buscar campaña por título..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 text-[13px] font-medium outline-none focus:border-[#02A95C] focus:ring-3 focus:ring-[#02A95C]/10 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              />
            </div>

            {/* View toggle */}
            <div className="flex bg-gray-100 p-1 rounded-lg flex-shrink-0">
              <button
                id="btn-view-grid"
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all cursor-pointer border-none ${viewMode === 'grid' ? 'bg-white text-[#02A95C] shadow-sm' : 'text-gray-400 hover:text-gray-600 bg-transparent'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                id="btn-view-list"
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all cursor-pointer border-none ${viewMode === 'list' ? 'bg-white text-[#02A95C] shadow-sm' : 'text-gray-400 hover:text-gray-600 bg-transparent'}`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        {loading ? (
          <div className="py-28 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm border border-gray-200">
              <Loader2 className="text-[#02A95C] animate-spin" size={24} strokeWidth={2} />
            </div>
            <p className="text-gray-400 text-xs font-semibold">Cargando campañas…</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-10 text-center mb-8">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={36} />
            <p className="text-red-700 font-bold mb-4 text-[15px]">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#c62828] font-bold text-[12px] tracking-wide hover:underline cursor-pointer border-none bg-transparent"
            >
              Reintentar conexión
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          /* Empty state */
          <div className="bg-white rounded-xl p-16 text-center border-2 border-dashed border-gray-300 mb-8">
            <div className="w-16 h-16 bg-[#E6F9F0] rounded-xl flex items-center justify-center mx-auto mb-5">
              <Rocket size={32} className="text-[#02A95C]" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">
              {searchTerm || statusFilter !== 'all' ? 'Sin resultados' : 'Empieza tu primera campaña'}
            </h3>
            <p className="text-gray-400 font-medium max-w-sm mx-auto mb-6 text-[14px]">
              {searchTerm || statusFilter !== 'all'
                ? 'No encontramos campañas con ese filtro. Prueba con otros criterios.'
                : 'Todavía no tienes campañas. ¡Lanza tu primer proyecto y comienza a recaudar!'}
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setEditingCampaign({} as any)}
                className="flex items-center gap-2 mx-auto px-5 py-3 rounded-xl font-semibold text-[13px] text-white border-none cursor-pointer transition-all hover:bg-[#017A42]"
                style={{ background: '#02A95C', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <Plus size={16} strokeWidth={2.5} /> Crear campaña
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
