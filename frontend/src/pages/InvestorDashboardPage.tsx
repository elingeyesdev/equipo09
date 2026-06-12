import { Navbar } from '../components/Navbar';
import { InvestorDashboardOverview } from '../components/InvestorDashboardOverview';
import { AddCapitalModal } from '../components/AddCapitalModal';

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
    <div className="min-h-screen bg-gray-50 pb-24" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      {/* HERO SECTION */}
      <div className="bg-white border-b border-gray-200 pt-10 pb-28 px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: '#f5fce8' }}>
              <LayoutDashboard size={22} strokeWidth={2} style={{ color: '#72B626' }} />
            </div>
            <h1 className="text-[32px] font-bold text-gray-900 tracking-tight">
              Panel de Inversor
            </h1>
          </div>
          <p className="text-[15px] text-gray-500 max-w-xl leading-relaxed">
            Monitorea tu capital, gestiona tus inversiones activas y descubre nuevas oportunidades.
          </p>
        </div>
      </div>

      <main className="max-w-[1100px] mx-auto px-6 -mt-20 relative z-20" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-10 h-10 border-3 border-gray-200 border-t-[#72B626] rounded-full animate-spin" />
            <span className="text-[13px] text-gray-400">Cargando tu panel...</span>
          </div>
        )}

        {error && (
          <div className="bg-white/90 backdrop-blur-xl rounded-[32px] p-12 text-center shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-white animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            <div className="text-[#72B626] mb-6 flex justify-center relative z-10">
               <Gem size={64} strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-black text-[#1c2b1e] tracking-tight mb-4 leading-none relative z-10">Bienvenido a CrowdFunding</h2>
            <p className="text-[16px] text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-10 relative z-10">
              Parece que aún no tienes configurado tu perfil de inversor. Complétalo para empezar a invertir y monitorear tu capital con solidez financiera.
            </p>
            <Link to="/profile" className="inline-flex items-center justify-center bg-gradient-to-r from-[#72B626] to-[#1c2b1e] hover:from-[#1c2b1e] hover:to-[#1c2b1e] text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 shadow-[0_8px_20px_rgba(46,125,50,0.3)] no-underline cursor-pointer gap-3 relative z-10">
              Completar Perfil Corporativo 
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-16 animate-in fade-in duration-700">
            <InvestorDashboardOverview
              data={data}
              onAddCapital={() => setShowAddCapital(true)}
            />
            
            <div className="flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-5 gap-4">
                 <div className="flex items-center gap-3">
                   <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: '#f5fce8' }}>
                     <TrendingUp size={18} strokeWidth={2} style={{ color: '#72B626' }} />
                   </div>
                   <h2 className="text-[18px] font-bold text-gray-900">Operaciones Recientes</h2>
                 </div>
                 <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                   <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto w-full sm:w-auto">
                       {(['all', 'donation', 'equity', 'reward'] as const).map(type => (
                         <button
                           key={type}
                           onClick={() => setFilterType(type)}
                           className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer border-none ${
                             filterType === type 
                               ? 'bg-white text-gray-900 shadow-sm' 
                               : 'bg-transparent text-gray-500 hover:text-gray-700'
                           }`}
                           style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                         >
                           {type === 'all' ? 'Todas' : type === 'donation' ? 'Donación' : type === 'equity' ? 'Equity' : 'Recompensa'}
                         </button>
                       ))}
                   </div>
                   <select 
                     value={sortType} 
                     onChange={(e) => setSortType(e.target.value)}
                     className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 text-[13px] font-medium shadow-sm outline-none cursor-pointer hover:border-[#72B626] transition-colors appearance-none w-full sm:w-auto"
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
                  <div className="w-8 h-8 border-4 border-slate-100 border-t-[#72B626] rounded-full animate-spin" />
                  Cargando operaciones...
                </div>
              ) : filteredInvestments.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-dashed border-emerald-200 p-20 text-center shadow-sm">
                  <div className="text-green-100 mb-6 flex justify-center">
                     <TrendingUp size={64} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-black text-[#1c2b1e] tracking-tight mb-3">Sin Actividad Pendiente</h3>
                  <p className="text-[14px] text-slate-400 font-medium max-w-xs mx-auto">No hay operaciones que coincidan con tu búsqueda. Explora nuestras campañas activas.</p>
                  <Link to="/explore" className="inline-block mt-8 bg-green-50 hover:bg-[#72B626] hover:text-white text-[#72B626] font-black px-8 py-3 rounded-xl transition-all border-none active:scale-95 cursor-pointer no-underline shadow-sm">
                    Explorar Campañas
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {filteredInvestments.map((inv) => (
                    <div key={inv.id} className="group bg-white rounded-xl p-5 border border-gray-200 flex flex-col md:flex-row items-center gap-6 hover:shadow-md hover:border-gray-300 transition-all duration-200">
                      <div className="w-full md:w-36 h-36 rounded-2xl bg-slate-100 overflow-hidden shrink-0 relative">
                        {getImageUrl(inv.campaignCoverImage) ? (
                          <img src={getImageUrl(inv.campaignCoverImage)} alt={inv.campaignTitle} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-[#1c2b1e] to-[#72B626]" />
                        )}
                        <div className="absolute top-3 left-3">
                           <span className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest">
                             {inv.campaignType === 'donation' ? 'Donación' : inv.campaignType === 'equity' ? 'Equity' : 'Recompensa'}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 w-full py-2">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                            inv.investmentStatus === 'completed' ? 'bg-green-100 text-[#72B626]' :
                            inv.investmentStatus === 'refunded' ? 'bg-red-100 text-red-600' :
                            inv.investmentStatus === 'partially_refunded' ? 'bg-orange-100 text-orange-600' :
                            'bg-slate-100 text-slate-500'
                          }`}>
                            {inv.investmentStatus === 'completed' ? 'Completado' :
                             inv.investmentStatus === 'refunded' ? 'Reembolsado' :
                             inv.investmentStatus === 'partially_refunded' ? 'Reemb. Parcial' :
                             inv.investmentStatus}
                          </span>
                          <span className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5">
                            <Clock size={12} />
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-[22px] font-black text-[#1c2b1e] tracking-tight mb-2 truncate group-hover:text-[#72B626] transition-colors">
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
                              className="text-[12px] font-black text-white bg-[#72B626] hover:bg-[#1c2b1e] px-4 py-2.5 rounded-xl border-none cursor-pointer inline-flex items-center gap-2 transition-all shadow-md shadow-gray-900/10 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingId === inv.id ? (
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : (
                                <FileText size={16} />
                              )}
                              Descargar Recibo
                            </button>
                          )}
                          <Link to={`/campaign/${inv.campaignId}`} className="text-[13px] font-black text-slate-500 hover:text-[#72B626] border-none bg-transparent cursor-pointer inline-flex items-center gap-1 px-2 py-2 transition-colors no-underline">
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

