import { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { 
  getDashboardStats, 
  getPendingCampaigns, 
  getCampaignDetail,
  updateCampaignStatus 
} from '../../api/admin.api';
import type { DashboardStats, PendingCampaign, PendingCampaignDetail } from '../../types/admin.types';
import { 
  Users, 
  Rocket, 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Search,
  Filter,
  Eye,
  Mail,
  MoreVertical
} from 'lucide-react';
import { CampaignPreviewModal } from '../../components/CampaignPreviewModal';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<PendingCampaignDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'reward' | 'donation'>('all');
  const [page, setPage] = useState(1);
  const [totalCampaigns, setTotalCampaigns] = useState(0);

  useEffect(() => {
    loadData();
  }, [page, filterType]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsData, campaignsData] = await Promise.all([
        getDashboardStats(),
        getPendingCampaigns({ page, limit: 5, search: searchTerm, type: filterType })
      ]);
      setStats(statsData);
      setCampaigns(campaignsData.campaigns);
      setTotalCampaigns(campaignsData.total);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (id: string) => {
    try {
      const detail = await getCampaignDetail(id);
      setSelectedCampaignDetail(detail);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error loading campaign detail:', error);
    }
  };

  const handleStatusUpdate = async (id: string, status: string, feedback?: string) => {
    try {
      setActionLoading(true);
      await updateCampaignStatus(id, status, feedback);
      setIsModalOpen(false);
      setSelectedCampaignDetail(null);
      loadData();
    } catch (error) {
      console.error('Error updating campaign status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-in fade-in duration-500 font-['Sora',sans-serif]">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Panel de Control</h1>
            <p className="text-slate-500 font-medium mt-1">Supervisión global de la plataforma y auditoría de capital.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-slate-100 flex">
               <button className="px-4 py-2 text-[12px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 rounded-xl transition-all">Vista General</button>
               <button className="px-4 py-2 text-[12px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Reportes</button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                <Users size={24} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Usuarios Totales</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.totalUsers || 0}</span>
              <div className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                 <ChevronRight size={12} className="-rotate-90" /> +12%
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <Rocket size={24} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Campañas Activas</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{stats?.totalCampaigns || 0}</span>
              <div className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                 <ChevronRight size={12} className="-rotate-90" /> +5%
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} strokeWidth={2.5} />
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Inversión Total</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">
                ${(stats?.totalFunded || 0).toLocaleString()}
              </span>
              <div className="text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                 <ChevronRight size={12} className="-rotate-90" /> +24%
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Management Section */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-indigo-600" />
              <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">Auditoría de Propuestas Técnicas</h2>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-lg font-black">{totalCampaigns}</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
               <div className="relative">
                  <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por título o emprendedor..."
                    className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadData()}
                  />
               </div>
               <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-2xl">
                  <button 
                    onClick={() => setFilterType('all')}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                  >Todas</button>
                  <button 
                    onClick={() => setFilterType('reward')}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filterType === 'reward' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                  >Reward</button>
                  <button 
                    onClick={() => setFilterType('donation')}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${filterType === 'donation' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
                  >Donation</button>
               </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Propuesta / Emprendedor</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta de Capital</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoría</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Envío</th>
                  <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaigns.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[14px] font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{campaign.title}</span>
                        <div className="flex items-center gap-2">
                           <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center">
                              <Mail size={10} className="text-slate-400" />
                           </div>
                           <span className="text-[11px] font-bold text-slate-400">{campaign.entrepreneur_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-[14px] font-black text-slate-900">
                        ${parseFloat(campaign.goal_amount).toLocaleString()}
                      </span>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">USD</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm">
                        {campaign.category_name}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-slate-500 font-medium text-[13px]">
                      {new Date(campaign.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleViewDetails(campaign.id)}
                        className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50 rounded-2xl transition-all active:scale-95 shadow-sm inline-flex items-center gap-2 group/btn"
                        title="Ver Perfil Corporativo"
                      >
                        <Eye size={18} />
                        <span className="text-[11px] font-black uppercase tracking-widest hidden md:inline">Auditar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
            campaignType: selectedCampaignDetail.type as any,
            status: selectedCampaignDetail.status as any,
            goalAmount: parseFloat(selectedCampaignDetail.goal_amount || '0'),
            currentAmount: selectedCampaignDetail.current_amount || 0,
            investorCount: selectedCampaignDetail.investor_count || 0,
            currency: selectedCampaignDetail.currency || 'USD',
            coverImageUrl: selectedCampaignDetail.main_image_url || selectedCampaignDetail.cover_image_url || null,
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
          auditScore={selectedCampaignDetail.audit_score}
          entrepreneur={{
            firstName: selectedCampaignDetail.entrepreneur_first_name || '',
            lastName: selectedCampaignDetail.entrepreneur_last_name || '',
            email: selectedCampaignDetail.entrepreneur_email || '',
            bio: selectedCampaignDetail.entrepreneur_bio,
            avatar: selectedCampaignDetail.entrepreneur_avatar,
            linkedin: selectedCampaignDetail.entrepreneur_linkedin,
            website: selectedCampaignDetail.entrepreneur_website,
          }}
          rewardTiers={selectedCampaignDetail.reward_tiers?.map(t => ({
            title: t.title,
            description: t.description,
            amount: t.min_amount || 0
          })) || []}
          onApprove={() => handleStatusUpdate(selectedCampaignDetail.id, 'published')}
          onReject={(feedback) => handleStatusUpdate(selectedCampaignDetail.id, 'rejected', feedback)}
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
    </AdminLayout>
  );
}
