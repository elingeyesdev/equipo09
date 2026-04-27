import { Navbar } from '../components/Navbar';
import { InvestorDashboardOverview } from '../components/InvestorDashboardOverview';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import { Link } from 'react-router-dom';
import { Gem, TrendingUp, ArrowRight, LayoutDashboard, Clock, FileText } from 'lucide-react';
import { getMyInvestments, downloadInvestmentReceipt, type InvestmentHistoryItem } from '../api/investor.api';
import { getImageUrl } from '../utils/image.utils';
import { useState, useEffect } from 'react';

export function InvestorDashboardPage() {
  const { data, loading, error } = useInvestorDashboard();
  const [investments, setInvestments] = useState<InvestmentHistoryItem[]>([]);
  const [loadingInvestments, setLoadingInvestments] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-6 py-12">
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-3">
             <LayoutDashboard className="text-[#2e7d32]" size={32} strokeWidth={2.5} />
             <h1 className="text-3xl font-black text-[#1c2b1e] tracking-tight leading-none">Dashboard de Inversor</h1>
          </div>
          <p className="text-[15px] font-medium text-slate-500 italic">
            Monitorea tu capital, inversiones activas y oportunidades detectadas por el sistema.
          </p>
        </header>

        {loading && (
          <div className="py-40 flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2e7d32] rounded-full animate-spin" />
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Sincronizando Métricas...</span>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-xl shadow-emerald-900/5 border border-emerald-50 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-[#2e7d32] mb-6 flex justify-center">
               <Gem size={64} strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-black text-[#1c2b1e] tracking-tight mb-4 leading-none">Bienvenido a CrowdFunding</h2>
            <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-md mx-auto mb-10">
              Parece que aún no tienes configurado tu perfil de inversor. Complétalo para empezar a invertir y monitorear tu capital con solidez financiera.
            </p>
            <Link to="/profile" className="inline-flex items-center justify-center bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 no-underline cursor-pointer gap-3">
              Completar Perfil Corporativo 
              <ArrowRight size={20} strokeWidth={2.5} />
            </Link>
          </div>
        )}

        {data && (
          <div className="flex flex-col gap-16 animate-in fade-in duration-700">
            <InvestorDashboardOverview data={data} />
            
            <div className="flex flex-col gap-8">
              <div className="flex items-center justify-between border-b border-emerald-50 pb-4">
                 <h2 className="text-[18px] font-black text-[#1c2b1e] tracking-tight uppercase tracking-widest leading-none">Operaciones Recientes</h2>
              </div>
              
              {loadingInvestments ? (
                <div className="py-10 text-center text-slate-400 font-bold text-[13px] uppercase tracking-widest">
                  Cargando operaciones...
                </div>
              ) : investments.length === 0 ? (
                <div className="bg-white rounded-[32px] border border-dashed border-emerald-200 p-20 text-center">
                  <div className="text-emerald-100 mb-6 flex justify-center">
                     <TrendingUp size={64} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-black text-[#1c2b1e] tracking-tight mb-3">Sin Actividad Pendiente</h3>
                  <p className="text-[14px] text-slate-400 font-medium max-w-xs mx-auto">Explora nuestras campañas activas y encuentra tu próxima oportunidad de alto impacto financiero.</p>
                  <Link to="/explore" className="inline-block mt-8 bg-emerald-50 hover:bg-emerald-100 text-[#2e7d32] font-black px-8 py-3 rounded-xl transition-all border-none active:scale-95 cursor-pointer no-underline">
                    Explorar Campañas
                  </Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {investments.map((inv) => (
                    <div key={inv.id} className="bg-white rounded-[24px] p-6 shadow-sm border border-emerald-50 flex flex-col md:flex-row items-center gap-6 hover:shadow-md transition-shadow">
                      <div className="w-full md:w-32 h-32 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                        {getImageUrl(inv.campaignCoverImage) ? (
                          <img src={getImageUrl(inv.campaignCoverImage)} alt={inv.campaignTitle} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-[#1c2b1e] to-[#2e7d32]" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${inv.investmentStatus === 'completed' ? 'bg-emerald-100 text-[#2e7d32]' : 'bg-slate-100 text-slate-500'}`}>
                            {inv.investmentStatus === 'completed' ? 'Completado' : inv.investmentStatus}
                          </span>
                          <span className="text-[12px] font-bold text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-[#1c2b1e] tracking-tight mb-1 truncate">
                          {inv.campaignTitle}
                        </h3>
                        {inv.rewardTitle && (
                          <p className="text-[13px] text-[#2e7d32] font-bold mb-3 flex items-center gap-1">
                            <Gem size={14} />
                            Recompensa: {inv.rewardTitle}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 flex flex-col items-end justify-between h-full">
                        <div>
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Monto Invertido</p>
                          <p className="text-2xl font-black text-[#1c2b1e] tracking-tighter">${inv.amount.toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 mt-3">
                          <Link to={`/campaigns/${inv.campaignId}`} className="text-[13px] font-black text-[#2e7d32] hover:underline decoration-2 border-none bg-transparent cursor-pointer inline-flex items-center gap-1">
                            Ver Campaña <ArrowRight size={14} />
                          </Link>
                          {inv.investmentStatus === 'completed' && (
                            <button
                              onClick={() => handleDownloadReceipt(inv.id)}
                              disabled={downloadingId === inv.id}
                              className="text-[12px] font-black text-slate-600 hover:text-[#2e7d32] bg-slate-100 hover:bg-emerald-50 px-3 py-1.5 rounded-lg border-none cursor-pointer inline-flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {downloadingId === inv.id ? (
                                <div className="w-3 h-3 border-2 border-slate-300 border-t-[#2e7d32] rounded-full animate-spin" />
                              ) : (
                                <FileText size={14} />
                              )}
                              Descargar Recibo
                            </button>
                          )}
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
    </div>
  );
}
