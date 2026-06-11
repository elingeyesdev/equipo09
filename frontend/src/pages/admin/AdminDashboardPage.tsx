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
  ChevronRight,
  Search,
  Eye,
  Mail
} from 'lucide-react';
import { CampaignPreviewModal } from '../../components/CampaignPreviewModal';
import { KYCReviewModal } from '../../components/admin/KYCReviewModal';
import { getPendingKyc, reviewKyc } from '../../api/admin.api';

export function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [campaigns, setCampaigns] = useState<PendingCampaign[]>([]);
  const [selectedCampaignDetail, setSelectedCampaignDetail] = useState<PendingCampaignDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'reward' | 'donation'>('all');
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [statusFilter, setStatusFilter] = useState<'pending_review' | 'published' | 'kyc'>('pending_review');

  const [pendingKyc, setPendingKyc] = useState<any[]>([]);
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [filterType, statusFilter]);

  const loadData = async () => {
    try {
      if (statusFilter === 'kyc') {
        const [statsData, kycData] = await Promise.all([
          getDashboardStats(),
          getPendingKyc()
        ]);
        setStats(statsData);
        setPendingKyc(kycData);
      } else {
        const [statsData, campaignsData] = await Promise.all([
          getDashboardStats(),
          getPendingCampaigns({ page: 1, limit: 5, search: searchTerm, type: filterType, status: statusFilter })
        ]);
        setStats(statsData);
        setCampaigns(campaignsData.campaigns);
        setTotalCampaigns(campaignsData.total);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
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
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Panel de Control</h1>
            <p className="text-gray-500 text-[14px] mt-1">Supervisión global de la plataforma y revisión de capital.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-white p-1 rounded-lg border border-gray-200 flex shadow-sm">
               <button 
                 onClick={() => setStatusFilter('pending_review')}
                 className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer border-none bg-transparent ${statusFilter === 'pending_review' ? 'text-indigo-600 bg-indigo-50 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
               >En Revisión</button>
               <button 
                 onClick={() => setStatusFilter('published')}
                 className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer border-none bg-transparent ${statusFilter === 'published' ? 'text-emerald-600 bg-emerald-50 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
               >Campañas Activas</button>
               <button 
                 onClick={() => setStatusFilter('kyc')}
                 className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer border-none bg-transparent ${statusFilter === 'kyc' ? 'text-amber-600 bg-amber-50 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
               >Verificaciones KYC</button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-lg border border-gray-200 border-t-4 border-t-indigo-600 shadow-sm transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users size={20} />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuarios Totales</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</span>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                 <ChevronRight size={10} className="-rotate-90" /> +12%
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 border-t-4 border-t-emerald-500 shadow-sm transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Rocket size={20} />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Campañas Activas</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">{stats?.totalCampaigns || 0}</span>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                 <ChevronRight size={10} className="-rotate-90" /> +5%
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 border-t-4 border-t-amber-500 shadow-sm transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <BarChart3 size={20} />
              </div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Inversión Total</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">
                ${(stats?.totalFunded || 0).toLocaleString()}
              </span>
              <div className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                 <ChevronRight size={10} className="-rotate-90" /> +24%
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Management Section */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
            <div className="flex items-center gap-2.5">
              {statusFilter === 'pending_review' ? <Clock size={18} className="text-indigo-600" /> : statusFilter === 'kyc' ? <Users size={18} className="text-amber-600" /> : <Rocket size={18} className="text-emerald-600" />}
              <h2 className="text-[14px] font-bold text-gray-800 uppercase tracking-wide">
                {statusFilter === 'pending_review' ? 'Revisión de Propuestas Técnicas' : statusFilter === 'kyc' ? 'Verificaciones KYC Pendientes' : 'Monitoreo de Capital Activo'}
              </h2>
              <span className={`${statusFilter === 'pending_review' ? 'bg-indigo-100 text-indigo-700' : statusFilter === 'kyc' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'} text-[11px] px-2 py-0.5 rounded font-bold`}>
                {statusFilter === 'kyc' ? pendingKyc.length : totalCampaigns}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
               <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Buscar por título o emprendedor..."
                    className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-[13px] font-medium w-full md:w-64 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && loadData()}
                  />
               </div>
               {statusFilter !== 'kyc' && (
                 <div className="flex items-center gap-1.5 bg-white border border-gray-200 p-1 rounded-lg">
                    <button 
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer border-none ${filterType === 'all' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-50 bg-transparent'}`}
                    >Todas</button>
                    <button 
                      onClick={() => setFilterType('reward')}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer border-none ${filterType === 'reward' ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50 bg-transparent'}`}
                    >Reward</button>
                    <button 
                      onClick={() => setFilterType('donation')}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all cursor-pointer border-none ${filterType === 'donation' ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:bg-gray-50 bg-transparent'}`}
                    >Donation</button>
                 </div>
               )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/70">
                  {statusFilter === 'kyc' ? (
                    <>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Emprendedor</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Empresa</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha Envío</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                    </>
                  ) : (
                    <>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Propuesta / Emprendedor</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Meta de Capital</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha Envío</th>
                      <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Acciones</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statusFilter === 'kyc' ? (
                  pendingKyc.map((kyc) => (
                    <tr key={kyc.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">{kyc.first_name} {kyc.last_name}</span>
                          <div className="flex items-center gap-1.5">
                             <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <Mail size={10} className="text-gray-400" />
                             </div>
                             <span className="text-[11px] text-gray-400 font-medium">{kyc.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-medium text-gray-600">{kyc.company_name || 'Sin especificar'}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-[13px]">
                        {new Date(kyc.updated_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => {
                            setSelectedKyc(kyc);
                            setIsKycModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-lg transition-all active:scale-95 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Eye size={15} />
                          <span className="text-[11px] font-bold uppercase tracking-wider hidden md:inline">Revisar</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[14px] font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{campaign.title}</span>
                          <div className="flex items-center gap-1.5">
                             <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <Mail size={10} className="text-gray-400" />
                             </div>
                             <span className="text-[11px] text-gray-400 font-medium">{campaign.entrepreneur_name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[14px] font-bold text-gray-900">
                          ${parseFloat(campaign.goal_amount).toLocaleString()}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide ml-1">USD</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-0.5 bg-white border border-gray-200 rounded text-[11px] font-semibold text-gray-600 shadow-sm">
                          {campaign.category_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium text-[13px]">
                        {new Date(campaign.created_at).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleViewDetails(campaign.id)}
                          className="px-3 py-1.5 bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 rounded-lg transition-all active:scale-95 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                          title="Ver Perfil Corporativo"
                        >
                          <Eye size={15} />
                          <span className="text-[11px] font-bold uppercase tracking-wider hidden md:inline">
                            {statusFilter === 'pending_review' ? 'Revisar' : 'Detalle'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
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
            amount: t.min_percentage || 0,
            minPercentage: t.min_percentage || 0,
            maxPercentage: t.max_percentage || 100
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

      <KYCReviewModal 
        isOpen={isKycModalOpen}
        onClose={() => {
          setIsKycModalOpen(false);
          setSelectedKyc(null);
        }}
        kycData={selectedKyc}
        onApprove={async (id) => {
          await reviewKyc(id, 'approve');
          loadData();
        }}
        onReject={async (id, reason) => {
          await reviewKyc(id, 'reject', reason);
          loadData();
        }}
      />
    </AdminLayout>
  );
}
