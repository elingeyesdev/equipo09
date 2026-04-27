// v2026-04-27-02: Fix for deleteCampaign ReferenceError and cache invalidation
import { useState, useCallback, useEffect } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useEntrepreneurProfile } from '../hooks/useEntrepreneurProfile';
import { Navbar } from '../components/Navbar';
import { CampaignCard } from '../components/CampaignCard';
import { CampaignPreviewModal } from '../components/CampaignPreviewModal';
import { CampaignForm } from '../components/CampaignForm';
import type { EntrepreneurCampaign, CreateCampaignDto } from '../types/campaign.types';
import {
  Rocket,
  Plus,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
  ChevronRight,
  ArrowRight
} from 'lucide-react';

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

  const handleModalPreview = useCallback((c: EntrepreneurCampaign) => {
    setPreviewCampaign(c);
  }, []);

  const handleModalEdit = useCallback(async (c: EntrepreneurCampaign) => {
    setPreviewCampaign(null);
    try {
      // Importante: Al editar, necesitamos el detalle completo (incluyendo recompensas)
      const { getMyCampaignById } = await import('../api/campaign.api');
      const fullCampaign = await getMyCampaignById(c.id);
      setEditingCampaign(fullCampaign);
    } catch (err) {
      console.error('Error fetching campaign detail for edit:', err);
      // Fallback a los datos básicos si falla el detalle
      setEditingCampaign(c);
    }
  }, []);

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-4">
          <div>
            <div className="flex items-center gap-3 text-[#2e7d32] mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <Rocket size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-[12px] font-black uppercase tracking-[0.2em]">Centro de Operaciones</h2>
            </div>
            <h1 className="text-4xl font-black text-[#1c2b1e] tracking-tighter leading-none mb-4">
              Mis Campañas
            </h1>
            <p className="text-slate-500 font-medium text-[15px] max-w-xl">
              Gestiona tus proyectos activos, revisa el estatus de tus borradores y monitorea el crecimiento de tu comunidad.
            </p>
          </div>

          <button
            onClick={() => setEditingCampaign({} as any)}
            className="bg-[#1c2b1e] hover:bg-[#2e7d32] text-white px-8 py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-emerald-900/10"
          >
            <Plus size={20} strokeWidth={3} />
            Lanzar Campaña
          </button>
        </div>

        {/* Filters & View Toggle */}
        <div className="bg-white rounded-3xl p-4 mb-5 shadow-sm border border-emerald-50 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por título..."
              className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-[14px] font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="text-slate-400 mr-1" size={18} />
            <select
              className="bg-slate-50 border-none rounded-2xl py-3 px-4 text-[13px] font-black uppercase tracking-wider outline-none cursor-pointer focus:ring-2 focus:ring-emerald-500/20"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="draft">Borrador</option>
              <option value="pending_review">En Revisión</option>
              <option value="published">Publicadas</option>
              <option value="rejected">Rechazadas</option>
            </select>
          </div>

          <div className="h-10 w-[1px] bg-slate-100 hidden md:block"></div>

          <div className="flex bg-slate-50 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-[#2e7d32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-[#2e7d32] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 text-[#2e7d32] animate-spin" strokeWidth={2.5} />
            <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">Sincronizando con la red...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-10 text-center">
            <AlertCircle className="text-red-400 mx-auto mb-4" size={40} />
            <p className="text-red-700 font-bold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-[#c62828] font-black uppercase text-[12px] tracking-widest hover:underline"
            >
              Reintentar Conexión
            </button>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="bg-white rounded-[40px] border-2 border-dashed border-slate-200 p-20 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
              <Rocket size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1c2b1e] tracking-tight mb-3">No se encontraron campañas</h3>
            <p className="text-slate-400 font-medium max-w-sm mx-auto mb-8">
              Parece que no tienes campañas que coincidan con tu búsqueda actual. ¡Anímate a crear una nueva!
            </p>
            <button
              onClick={() => setEditingCampaign({} as any)}
              className="text-[#2e7d32] font-black uppercase text-[13px] tracking-[0.2em] flex items-center gap-2 mx-auto hover:gap-4 transition-all"
            >
              Crear mi primer proyecto <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "flex flex-col gap-4"}>
            {filteredCampaigns.map((c) => (
              <CampaignCard
                key={c.id}
                campaign={c}
                onPreview={handleModalPreview}
                onSubmitForReview={submitForReview}
                onPublish={publishCampaign}
                onDelete={handleDelete}
                onFinalize={handleFinalize}
                actionCampaignId={actionCampaignId}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {editingCampaign && (
          <div className="fixed inset-0 bg-[#1c2b1e]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto">
              <CampaignForm
                initialData={editingCampaign.id ? editingCampaign : null}
                onSuccess={async (dto, file) => {
                  const success = editingCampaign.id
                    ? await updateCampaign(editingCampaign.id, dto, file)
                    : await addCampaign(dto, file);
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
              lastName: profile.lastName,
              email: profile.email || '',
              avatar: profile.avatarUrl,
              bio: profile.bio,
              website: profile.website,
              linkedin: profile.linkedinUrl
            } : undefined}
          />
        )}
      </main>
    </div>
  );
}
