import { useState, useMemo } from 'react';
import type { EntrepreneurCampaign } from '../../types/campaign.types';
import { 
  Lightbulb, 
  X, 
  SlidersHorizontal, 
  Clock, 
  FolderOpen, 
  PlusCircle, 
  ChevronRight,
  TrendingUp,
  Users,
  Loader2,
  AlertCircle
} from 'lucide-react';

type ModalType = 'profile' | 'personal' | 'company' | 'address' | 'banking' | 'avatar' | 'new-campaign' | null;

interface Props {
  openModal: (type: ModalType) => void;
  hasBanking: boolean;
  campaigns: EntrepreneurCampaign[];
  loading: boolean;
  onCampaignClick: (campaign: EntrepreneurCampaign) => void;
}

type CampaignFilter = 'all' | 'active' | 'drafts' | 'completed';

export function CampaignsFeed({ openModal, hasBanking, campaigns, loading, onCampaignClick }: Props) {
  const [showTip, setShowTip] = useState(true);
  const [filter, setFilter] = useState<CampaignFilter>('all');

  const calculatePercentage = (current: number, goal: number) => {
    if (!goal) return 0;
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-[#2e7d32] border-emerald-300';
      case 'draft': return 'bg-slate-500 border-slate-400';
      case 'pending_review': return 'bg-[#f9a825] border-amber-300';
      case 'completed': return 'bg-[#1c2b1e] border-[#2e7d32]';
      default: return 'bg-slate-400 border-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'ACTIVA';
      case 'draft': return 'BORRADOR';
      case 'pending_review': return 'REVISIÓN';
      case 'completed': return 'FINALIZADA';
      default: return status.toUpperCase();
    }
  };

  const filteredCampaigns = useMemo(() => {
    if (filter === 'all') return campaigns;
    if (filter === 'active') return campaigns.filter(c => c.status === 'published');
    if (filter === 'drafts') return campaigns.filter(c => c.status === 'draft' || c.status === 'pending_review');
    if (filter === 'completed') return campaigns.filter(c => c.status === 'completed');
    return campaigns;
  }, [campaigns, filter]);

  const filterTabs = [
    { id: 'all', label: 'Todas' },
    { id: 'active', label: 'Activas' },
    { id: 'drafts', label: 'Borradores' },
    { id: 'completed', label: 'Finalizadas' }
  ];

  return (
    <div className="flex-1 min-w-[280px] flex flex-col gap-8 font-['Sora',sans-serif]">
      
      {/* Tip card */}
      {!hasBanking && showTip && (
        <div className="bg-white rounded-[32px] shadow-sm p-8 flex justify-between items-start animate-in fade-in slide-in-from-bottom-4 duration-500 border border-emerald-50 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50 group-hover:scale-110 transition-transform"></div>
          
          <div className="flex gap-6 items-start relative z-10">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#2e7d32] shrink-0 shadow-inner">
               <Lightbulb size={28} strokeWidth={2.5} />
            </div>
            <div className="pr-4">
              <div className="font-black text-[18px] text-[#1c2b1e] mb-2 tracking-tight">Optimiza tu Flujo de Capital</div>
              <div className="text-[14px] text-slate-500 font-medium leading-[1.6] max-w-md">Vincular tus credenciales bancarias es un requisito de cumplimiento para habilitar la dispersión de fondos.</div>
              <button 
                onClick={() => openModal('banking')}
                className="mt-5 bg-[#1c2b1e] hover:bg-[#2e7d32] text-white border-none rounded-xl px-6 py-3 text-[14px] font-black cursor-pointer transition-all active:scale-95 shadow-lg shadow-emerald-900/10 flex items-center gap-2 group/btn"
               >
                 Vincular Cuenta Bancaria
                 <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
            </div>
          </div>
          <button 
            onClick={() => setShowTip(false)} 
            className="p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer text-slate-300 hover:text-red-500 shrink-0 border-none bg-transparent"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Internal Tabs for Filtering */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-emerald-50 shadow-sm w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as CampaignFilter)}
            className={`
              px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all cursor-pointer border-none
              ${filter === tab.id 
                ? 'bg-[#1c2b1e] text-white shadow-lg shadow-emerald-900/10' 
                : 'bg-transparent text-slate-500 hover:bg-emerald-50 hover:text-[#2e7d32]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Campaigns list */}
      <div className="bg-white rounded-[40px] shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 border border-emerald-50">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#1c2b1e] text-white rounded-xl flex items-center justify-center">
                <SlidersHorizontal size={18} strokeWidth={2.5} />
             </div>
             <span className="text-[20px] font-black text-[#1c2b1e] tracking-tight uppercase tracking-widest leading-none">
               Portafolio de Inversión
             </span>
          </div>
          <button 
            onClick={() => openModal('new-campaign')}
            className="bg-[#2e7d32] hover:bg-[#1c2b1e] text-white border-none rounded-xl px-4 py-3 text-[12px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-900/10"
          >
            <PlusCircle size={16} strokeWidth={3} />
             Nueva Campaña
          </button>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-12 h-12 text-[#2e7d32] animate-spin" strokeWidth={2.5} />
            <p className="text-slate-400 text-[11px] font-black tracking-[0.2em] uppercase">Recuperando proyecciones...</p>
          </div>
        ) : filteredCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 gap-10">
            {filteredCampaigns.map((campaign) => (
              <div 
                key={campaign.id} 
                onClick={() => onCampaignClick(campaign)}
                className="border border-emerald-50 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all group cursor-pointer bg-white relative ring-1 ring-emerald-50/50"
              >
                <div className="h-[240px] bg-slate-100 relative overflow-hidden">
                  {campaign.coverImageUrl ? (
                    <img 
                      src={campaign.coverImageUrl} 
                      alt={campaign.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#1c2b1e] to-[#2e7d32] group-hover:scale-110 transition-transform duration-1000 flex items-center justify-center">
                       <TrendingUp size={64} className="text-white/10" strokeWidth={1} />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c2b1e] via-transparent to-transparent opacity-80"></div>
                  
                  {/* Vista Previa Badge */}
                  <div className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                     <AlertCircle size={12} className="text-white" strokeWidth={3} />
                     <span className="text-[10px] font-black text-white uppercase tracking-widest">Vista Previa</span>
                  </div>

                  <span className={`${getStatusColor(campaign.status)} text-white text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full z-10 shadow-lg absolute top-6 right-6 border`}>
                    {getStatusLabel(campaign.status)}
                  </span>
                </div>
                
                <div className="p-8">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div className="font-black text-[22px] text-[#1c2b1e] leading-tight group-hover:text-[#2e7d32] transition-colors line-clamp-1 tracking-tight">{campaign.title}</div>
                    <div className="bg-emerald-50 text-[#2e7d32] px-3 py-1 rounded-lg text-[16px] font-black tracking-tighter">
                       {calculatePercentage(campaign.currentAmount, campaign.goalAmount)}%
                    </div>
                  </div>
                  
                  <div className="text-[14px] text-slate-500 font-medium mb-8 line-clamp-2 leading-relaxed min-h-[42px]">
                    {campaign.shortDescription || 'Sin resumen ejecutivo disponible para esta proyección financiera en este momento.'}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Impacto Logrado</span>
                      <span className="text-[20px] font-black text-[#1c2b1e] block tracking-tighter leading-none">
                        {campaign.currency} {campaign.currentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                       <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">Meta Estratégica</span>
                       <span className="text-[20px] font-black text-[#2e7d32] block tracking-tighter leading-none">
                          {campaign.currency} {campaign.goalAmount.toLocaleString()}
                       </span>
                    </div>
                  </div>
                  
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-8 shadow-inner relative">
                    <div 
                      className="h-full bg-gradient-to-r from-[#aed581] via-[#2e7d32] to-[#00897b] rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(46,125,50,0.3)]" 
                      style={{ width: `${calculatePercentage(campaign.currentAmount, campaign.goalAmount)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex flex-wrap justify-between items-center gap-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#2e7d32]">
                         <Users size={16} strokeWidth={2.5} />
                      </div>
                      <span className="text-slate-700">{campaign.investorCount} inversionistas activos</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#1c2b1e] text-white px-4 py-2 rounded-xl shadow-lg shadow-emerald-900/10">
                      <Clock size={12} strokeWidth={3} />
                      {campaign.status === 'published' ? 'Inversión Abierta' : getStatusLabel(campaign.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-24 text-center bg-slate-50/20 border-[2px] border-dashed border-emerald-100 rounded-[40px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm flex items-center justify-center text-emerald-200 mb-6 group hover:scale-110 transition-transform">
               <FolderOpen size={40} strokeWidth={1} />
            </div>
            <p className="text-[#1c2b1e] font-black text-[20px] mb-2 uppercase tracking-tight">Sin Campañas en esta categoría</p>
            <p className="text-slate-400 font-medium text-[15px] max-w-[320px] leading-relaxed mb-10">Actualiza tus filtros o inicia una nueva campaña estratégica para movilizar capital hoy mismo.</p>
            {filter !== 'all' && (
              <button 
                onClick={() => setFilter('all')}
                className="text-[#2e7d32] font-black text-[13px] uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent"
              >
                Ver todas las campañas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
