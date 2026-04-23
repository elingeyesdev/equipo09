import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { getPendingCampaigns, updateCampaignStatus, getCampaignDetail } from '../../api/admin.api';
import type { PendingCampaign, PendingCampaignDetail } from '../../types/admin.types';
import { CampaignPreviewModal } from '../../components/CampaignPreviewModal';

import { AdminLayout } from '../../components/admin/AdminLayout';

export const CampaignReviewPage: React.FC = () => {
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<PendingCampaignDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCampaigns();
  }, [page, typeFilter]);

  const loadCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPendingCampaigns({
        page,
        limit: pageSize,
        search: searchTerm,
        type: typeFilter
      });
      setCampaigns(response.campaigns);
      setTotal(response.total);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Acceso denegado. Se requieren permisos de administrador.');
      } else {
        console.error('Error loading pending campaigns:', err);
        setError('Error al cargar las campañas pendientes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCampaigns();
  };

  const openReviewModal = async (id: string) => {
    setSelectedCampaignId(id);
    setLoading(true);
    try {
      const detail = await getCampaignDetail(id);
      setSelectedCampaignDetail(detail);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error loading campaign detail:', err);
      alert('Error al cargar el detalle de la campaña.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (status: 'approved' | 'rejected', feedback?: string) => {
    if (!selectedCampaignId) return;
    
    setActionLoading(true);
    try {
      await updateCampaignStatus(selectedCampaignId, status === 'approved' ? 'published' : 'rejected', feedback);
      setIsModalOpen(false);
      setSelectedCampaignDetail(null);
      loadCampaigns();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado de la campaña.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleQuickApprove = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de que deseas aprobar la campaña "${title}"?`)) return;
    
    setLoading(true);
    try {
      await updateCampaignStatus(id, 'published');
      loadCampaigns();
    } catch (err) {
      console.error('Error approving campaign:', err);
      alert('Error al aprobar la campaña.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReject = async (id: string, title: string) => {
    const feedback = window.prompt(`Indica el motivo del rechazo para "${title}":`);
    if (feedback === null) return; // Cancelled
    if (!feedback.trim()) {
      alert('El motivo del rechazo es obligatorio.');
      return;
    }

    setLoading(true);
    try {
      await updateCampaignStatus(id, 'rejected', feedback);
      loadCampaigns();
    } catch (err) {
      console.error('Error rejecting campaign:', err);
      alert('Error al rechazar la campaña.');
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold tracking-widest text-xs uppercase">
              <ShieldCheck size={16} />
              <span>Panel Administrativo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1c2b1e] tracking-tight">
              Revisión de <span className="text-indigo-600">Campañas</span>
            </h1>
            <p className="text-slate-400 font-medium">
              Revisa las nuevas propuestas antes de que salgan al mercado.
            </p>
          </div>

          {/* Info Cards / Stats quick look */}
          <div className="flex gap-4">
            <div className="px-5 py-3 bg-white border border-emerald-50 rounded-2xl flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pendientes</p>
                <p className="text-xl font-black text-[#1c2b1e]">{total}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-50 flex flex-col md:flex-row gap-4 shadow-sm">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por título o emprendedor..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-[#1c2b1e] placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                className="pl-10 pr-8 py-3 bg-slate-50 border-none rounded-xl text-[#1c2b1e] appearance-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium min-w-[160px]"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="all">Todos los tipos</option>
                <option value="donation">Donación</option>
                <option value="reward">Recompensa</option>
              </select>
            </div>
            
            <button 
              onClick={loadCampaigns}
              className="px-6 py-3 bg-[#1c2b1e] hover:bg-[#2e7d32] text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/10 active:scale-95 cursor-pointer border-none"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Campaigns Table */}
        <div className="bg-white border border-emerald-50 rounded-2xl overflow-hidden shadow-sm">
        {error ? (
          <div className="py-24 bg-red-50 border-y border-red-100 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
              <ShieldAlert size={40} />
            </div>
            <h3 className="text-xl font-bold text-[#c62828] mb-2">{error}</h3>
            <p className="text-slate-500 max-w-sm mb-6 font-medium">
              No tienes permisos para ver esta sección o tu sesión ha expirado.
            </p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="px-8 py-3 bg-[#1c2b1e] text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-900/10 active:scale-95 border-none cursor-pointer"
            >
              Ir al Login
            </button>
          </div>
        ) : loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Sincronizando revisión...</p>
          </div>
        ) : campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-white">
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Perfil Corporativo</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Emprendedor</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estructura</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Meta de Capital</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Score</th>
                    <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Acciones de Auditoría</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-slate-50/80 transition-all group">
                      <td className="px-8 py-7">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all font-black text-xs">
                             {campaign.title.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[#1c2b1e] font-black text-[15px] group-hover:text-indigo-600 transition-colors">{campaign.title}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{campaign.category_name}</span>
                              <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                              <span className="text-[10px] text-slate-400 font-bold">Ref: {campaign.id.substring(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                           <span className="text-slate-900 font-black text-[14px]">{campaign.entrepreneur_name}</span>
                           <span className="text-[10px] text-slate-400 font-bold">Verificado el {new Date(campaign.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-8 py-7">
                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          campaign.type === 'reward' 
                            ? 'bg-amber-50 text-amber-600 border-amber-100' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {campaign.type === 'reward' ? 'Recompensa' : 'Donación'}
                        </span>
                      </td>
                      <td className="px-8 py-7">
                        <div className="flex flex-col">
                           <span className="text-[#1c2b1e] font-black text-[16px] tracking-tight">${parseFloat(campaign.goal_amount).toLocaleString()}</span>
                           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">USD Equity</span>
                        </div>
                      </td>
                      <td className="px-8 py-7 text-center">
                         <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 font-black text-xs border border-emerald-100 shadow-sm">
                            {campaign.audit_score || 0}%
                         </div>
                      </td>
                      <td className="px-8 py-7 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => openReviewModal(campaign.id)}
                            className="w-11 h-11 flex items-center justify-center bg-white hover:bg-slate-900 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-200 shadow-sm cursor-pointer active:scale-90"
                            title="Auditar Documentación"
                          >
                            <Eye size={20} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickApprove(campaign.id, campaign.title);
                            }}
                            className="w-11 h-11 flex items-center justify-center bg-white hover:bg-emerald-500 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-200 shadow-sm cursor-pointer active:scale-90"
                            title="Aprobar Inmediatamente"
                          >
                            <CheckCircle2 size={20} strokeWidth={2.5} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickReject(campaign.id, campaign.title);
                            }}
                            className="w-11 h-11 flex items-center justify-center bg-white hover:bg-red-500 text-slate-400 hover:text-white rounded-2xl transition-all border border-slate-200 shadow-sm cursor-pointer active:scale-90"
                            title="Rechazar Perfil Corporativo"
                          >
                            <ShieldAlert size={20} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center px-6">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-[#2e7d32] mb-4">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-xl font-black text-[#1c2b1e] mb-2 uppercase tracking-widest">¡Todo al día!</h3>
              <p className="text-slate-500 max-w-sm font-medium">
                No hay campañas pendientes de revisión en este momento. Vuelve más tarde para revisar nuevas propuestas.
              </p>
            </div>
          )}

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="px-8 py-4 bg-slate-50/30 border-t border-emerald-50 flex items-center justify-between">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Perfiles Corporativos <span className="text-indigo-600">{campaigns.length}</span> de <span className="text-[#1c2b1e]">{total}</span>
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft size={18} strokeWidth={3} />
                </button>
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setPage(i + 1)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all cursor-pointer ${
                        page === i + 1 
                          ? 'bg-[#1c2b1e] text-white shadow-lg shadow-emerald-900/10' 
                          : 'bg-white text-slate-400 border border-slate-100 hover:border-emerald-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronRight size={18} strokeWidth={3} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal de Detalle (Unified Preview) */}
        {selectedCampaignDetail && (
          <CampaignPreviewModal 
            open={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedCampaignDetail(null);
            }}
            isAdmin
            campaign={{
              id: selectedCampaignDetail.id,
              title: selectedCampaignDetail.title,
              slug: selectedCampaignDetail.slug || (selectedCampaignDetail as any).id,
              shortDescription: selectedCampaignDetail.short_description || '',
              description: selectedCampaignDetail.description || '',
              location: selectedCampaignDetail.location || 'Global',
              campaignType: 'reward',
              status: selectedCampaignDetail.status as any,
              goalAmount: parseFloat(selectedCampaignDetail.goal_amount || '0'),
              currentAmount: selectedCampaignDetail.current_amount || 0,
              investorCount: selectedCampaignDetail.investor_count || 0,
              currency: selectedCampaignDetail.currency || 'USD',
              coverImageUrl: selectedCampaignDetail.main_image_url || null,
              categoryName: selectedCampaignDetail.category_name,
              categorySlug: '',
              startDate: selectedCampaignDetail.start_date,
              endDate: selectedCampaignDetail.end_date,
              fundedAt: null,
              isFeatured: false,
              viewCount: 0,
              createdAt: '',
              updatedAt: '',
              publishedAt: null
            }}
            entrepreneur={{
              firstName: selectedCampaignDetail.entrepreneur_first_name || '',
              lastName: selectedCampaignDetail.entrepreneur_last_name || '',
              email: selectedCampaignDetail.entrepreneur_email || '',
              bio: selectedCampaignDetail.entrepreneur_bio,
              avatar: selectedCampaignDetail.entrepreneur_avatar,
              linkedin: selectedCampaignDetail.entrepreneur_linkedin,
              website: selectedCampaignDetail.entrepreneur_website
            }}
            rewardTiers={selectedCampaignDetail.reward_tiers?.map(t => ({
              title: t.title,
              description: t.description,
              amount: t.min_amount || 0
            })) || []}
            onApprove={() => handleReviewAction('approved')}
            onReject={(feedback) => handleReviewAction('rejected', feedback)}
            actionLoading={actionLoading}
            media={selectedCampaignDetail.media}
            minInvestment={selectedCampaignDetail.min_investment}
            maxInvestment={selectedCampaignDetail.max_investment}
            subtitle={selectedCampaignDetail.subtitle}
            risksAndChallenges={selectedCampaignDetail.risks_and_challenges}
            videoUrl={selectedCampaignDetail.video_url}
            tags={selectedCampaignDetail.tags}
            socialLinks={selectedCampaignDetail.social_links}
          />
        )}
      </div>
    </AdminLayout>
  );
};
