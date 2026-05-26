import { Navbar } from '../components/Navbar';
import { InvestorDashboardOverview } from '../components/InvestorDashboardOverview';
import { AddCapitalModal } from '../components/AddCapitalModal';
import { StoriesAvatarBar } from '../components/StoriesAvatarBar';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import { Link } from 'react-router-dom';
import { Gem, TrendingUp, ArrowRight, LayoutDashboard, Clock, FileText } from 'lucide-react';
import { getMyInvestments, downloadInvestmentReceipt, type InvestmentHistoryItem } from '../api/investor.api';
import { getImageUrl } from '../utils/image.utils';
import { useState, useEffect } from 'react';

export function InvestorDashboardPage() {
  const { data, loading, error, refetch } = useInvestorDashboard();
  const [investments, setInvestments] = useState<InvestmentHistoryItem[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showAddCapital, setShowAddCapital] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortType, setSortType] = useState<string>('newest');

  const filteredInvestments = investments
    .filter(inv => filterType === 'all' || inv.campaignType === filterType)
    .sort((a, b) => {
      if (sortType === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortType === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortType === 'alphabetical') return a.campaignTitle.localeCompare(b.campaignTitle);
      if (sortType === 'highest_goal') return (b.campaignGoal || 0) - (a.campaignGoal || 0);
      if (sortType === 'lowest_goal') return (a.campaignGoal || 0) - (b.campaignGoal || 0);
      return 0;
    });

  const handleDownloadReceipt = async (id: string) => {
    try {
      setDownloadingId(id);
      await downloadInvestmentReceipt(id);
    } catch (err) {
      console.error('Error al descargar recibo:', err);
      alert('Hubo un error al generar el recibo. Por favor intenta de nuevo.');
    } finally {
      setDownloadingId(null);
    }
  };

  useEffect(() => {
    if (data) {
      getMyInvestments()
        .then(setInvestments)
        .catch(console.error)
        .finally(() => setLoadingInvestments(false));
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif] pb-24">
      <Navbar />

      {/* HERO SECTION */}
      <div className="bg-[#1c2b1e] pt-16 pb-32 px-6 relative overflow-hidden border-b border-emerald-900/50">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
           <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[150%] bg-[#2e7d32] blur-[120px] rounded-full mix-blend-screen animate-pulse duration-[10000ms]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[120%] bg-[#00897b] blur-[100px] rounded-full mix-blend-screen" />
        </div>
        
        <div className="max-w-[1100px] mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-5 mb-5">
             <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-white/10 shadow-lg">
               <LayoutDashboard size={28} strokeWidth={2.5} />
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
               Panel de Inversor
             </h1>
          </div>
          <p className="text-[16px] font-medium text-emerald-100/70 max-w-xl leading-relaxed">
            Monitorea tu capital, gestiona tus inversiones activas y descubre nuevas oportunidades de alto impacto financiero.
          </p>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-6 -mt-20 relative z-20">
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-6 bg-white/80 backdrop-blur-xl rounded-[32px] border border-white shadow-xl">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2e7d32] rounded-full animate-spin" />
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Sincronizando Métricas...</span>
          </div>
        )}

        {error && (
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-12 text-center shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="text-[#2e7d32] mb-6 flex justify-center relative z-10">
               <Gem size={64} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-[#1c2b1e] tracking-tight mb-4 leading-none relative z-10">Bienvenido a CrowdFunding</h2>
            <p className="text-[16px] text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-10 relative z-10">
              Parece que aún no tienes configurado tu perfil de inversor. Complétalo para empezar a invertir y monitorear tu capital con solidez financiera.
            </p>
            <Link to="/profile" className="inline-flex items-center justify-center bg-gradient-to-r from-[#2e7d32] to-[#1c2b1e] hover:from-[#1c2b1e] hover:to-[#1c2b1e] text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 shadow-[0_8px_20px_rgba(46,125,50,0.3)] no-underline cursor-pointer gap-3 relative z-10">
              Completar Perfil Corporativo 
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-16 animate-in fade-in duration-700">
            {/* ─── Stories bar (Backlog R.2) ───────────────────────────────── */}
            <StoriesAvatarBar />

            <InvestorDashboardOverview
              data={data}
              onAddCapital={() => setShowAddCapital(true)}
            />
            
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-emerald-100 pb-6 gap-4">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-[#2e7d32]">
                     <TrendingUp size={20} strokeWidth={2.5} />
                   </div>
                   <h2 className="text-[22px] font-black text-[#1c2b1e] tracking-tight uppercase">Operaciones Recientes</h2>
                 </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                   <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-emerald-100 overflow-x-auto w-full sm:w-auto">
                      {(['all', 'donation', 'equity', 'reward'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setFilterType(type)}
                          className={`px-5 py-2 rounded-xl text-[13px] font-black tracking-wide transition-all whitespace-nowrap cursor-pointer border-none ${
                            filterType === type 
                              ? 'bg-[#2e7d32] text-white shadow-md shadow-emerald-900/10' 
                              : 'bg-transparent text-slate-500 hover:text-[#1c2b1e] hover:bg-slate-50'
                          }`}
                        >
                          {type === 'all' ? 'Todas' : type === 'donation' ? 'Donación' : type === 'equity' ? 'Equity' : 'Recompensa'}
                        </button>
                      ))}
                   </div>
                   <select 
                     value={sortType} 
                     onChange={(e) => setSortType(e.target.value)}
                     className="px-4 py-2.5 rounded-2xl bg-white border border-emerald-100 text-[#1c2b1e] text-[13px] font-black shadow-sm outline-none cursor-pointer hover:border-[#2e7d32] transition-colors appearance-none w-full sm:w-auto"
                   >
                     <option value="newest">Más recientes</option>
                     <option value="oldest">Más antiguas</option>
                     <option value="alphabetical">Orden alfabético</option>
                     <option value="highest_goal">Mayor meta</option>
                     <option value="lowest_goal">Menor meta</option>
                   </select>
                 </div>
              </div>
              
              {loadingInvestments ? (
                <div className="py-10 text-center text-slate-400 font-bold text-[13px] uppercase tracking-widest flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-slate-100 border-t-[#2e7d32] rounded-full animate-spin" />
                  Cargando operaciones...
                </div>
              ) : filteredInvestments.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-dashed border-emerald-200 p-20 text-center shadow-sm">
                  <div className="text-emerald-100 mb-6 flex justify-center">
                     <TrendingUp size={64} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-black text-[#1c2b1e] tracking-tight mb-3">Sin Actividad Pendiente</h3>
                  <p className="text-[14px] text-slate-400 font-medium max-w-xs mx-auto">No hay operaciones que coincidan con tu búsqueda. Explora nuestras campañas activas.</p>
                  <Link to="/explore" className="inline-block mt-8 bg-emerald-50 hover:bg-[#2e7d32] hover:text-white text-[#2e7d32] font-black px-8 py-3 rounded-xl transition-all border-none active:scale-95 cursor-pointer no-underline shadow-sm">
                    Explorar Campañas
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredInvestments.map((inv) => (
                    <div key={inv.id} className="group bg-white rounded-[28px] p-5 shadow-sm border border-emerald-50 flex flex-col md:flex-row items-center gap-6 hover:shadow-xl hover:border-emerald-200 hover:-translate-y-1 transition-all duration-300">
                      <div className="w-full md:w-36 h-36 rounded-2xl bg-slate-100 overflow-hidden shrink-0 relative">
                        {getImageUrl(inv.campaignCoverImage) ? (
                          <img src={getImageUrl(inv.campaignCoverImage)} alt={inv.campaignTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-[#1c2b1e] to-[#2e7d32]" />
                        )}
                        <div className="absolute top-3 left-3">
                           <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                             {inv.campaignType === 'donation' ? 'Donación' : inv.campaignType === 'equity' ? 'Equity' : 'Recompensa'}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 w-full py-2">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${inv.investmentStatus === 'completed' ? 'bg-emerald-100 text-[#2e7d32]' : 'bg-slate-100 text-slate-500'}`}>
                            {inv.investmentStatus === 'completed' ? 'Completado' : inv.investmentStatus}
                          </span>
                          <span className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-[22px] font-black text-[#1c2b1e] tracking-tight mb-2 truncate group-hover:text-[#2e7d32] transition-colors">
                          {inv.campaignTitle}
                        </h3>
                        {inv.rewardTitle && (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-[13px] font-bold">
                            <Gem size={14} />
                            {inv.rewardTitle}
                          </div>
                        )}
                      </div>
                      
                      <div className="w-full md:w-auto md:text-right shrink-0 flex flex-row md:flex-col items-center md:items-end justify-between h-full bg-slate-50 md:bg-transparent p-4 md:p-0 rounded-2xl md:rounded-none">
                        <div className="text-left md:text-right">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Invertido</p>
                          <p className="text-3xl font-black text-[#1c2b1e] tracking-tighter">${inv.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-row md:flex-col items-center md:items-end gap-2 mt-0 md:mt-4">
                          {inv.investmentStatus === 'completed' && (
                            <button
                              onClick={() => handleDownloadReceipt(inv.id)}
                              disabled={downloadingId === inv.id}
                              className="text-[12px] font-black text-white bg-[#2e7d32] hover:bg-[#1c2b1e] px-4 py-2.5 rounded-xl border-none cursor-pointer inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingId === inv.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <FileText size={16} />
                              )}
                              Descargar Recibo
                            </button>
                          )}
                          <Link to={`/campaign/${inv.campaignId}`} className="text-[13px] font-black text-slate-500 hover:text-[#2e7d32] border-none bg-transparent cursor-pointer inline-flex items-center gap-1 px-2 py-2 transition-colors no-underline">
                            Ver Campaña <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Aumentar Capital */}
      <AddCapitalModal
        isOpen={showAddCapital}
        onClose={() => setShowAddCapital(false)}
        onSuccess={refetch}
        currentAvailable={data?.availableCapital ?? null}
        currentMax={data?.maxInvestmentLimit ?? null}
      />
    </div>
  );
}

