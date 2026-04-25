import { Navbar } from '../components/Navbar';
import { InvestorDashboardOverview } from '../components/InvestorDashboardOverview';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gem,
  TrendingUp,
  ArrowRight,
  LayoutDashboard,
  Heart,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Gift,
} from 'lucide-react';

const CAMPAIGN_TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  donation: { icon: Heart, label: 'Donación', color: '#e91e63' },
  reward: { icon: Gem, label: 'Recompensa', color: '#f9a825' },
  equity: { icon: TrendingUp, label: 'Equity', color: '#2e7d32' },
};

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  completed: { icon: CheckCircle2, color: '#2e7d32', bg: '#e8f5e9', label: 'Completada' },
  pending: { icon: Clock, color: '#f9a825', bg: '#fff8e1', label: 'Pendiente' },
  processing: { icon: Clock, color: '#1976d2', bg: '#e3f2fd', label: 'Procesando' },
  failed: { icon: XCircle, color: '#c62828', bg: '#ffebee', label: 'Fallida' },
  cancelled: { icon: XCircle, color: '#64748b', bg: '#f1f5f9', label: 'Cancelada' },
  refunded: { icon: DollarSign, color: '#7b1fa2', bg: '#f3e5f5', label: 'Reembolsada' },
};

export function InvestorDashboardPage() {
  const { data, investments, loading, error } = useInvestorDashboard();
  const navigate = useNavigate();

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
                 <button
                   onClick={() => navigate('/profile')}
                   className="text-[13px] font-black text-[#2e7d32] hover:underline decoration-2 border-none bg-transparent cursor-pointer"
                 >
                   Ver Historial Completo
                 </button>
              </div>

              {investments.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {investments.map((inv) => {
                    const typeConfig = CAMPAIGN_TYPE_CONFIG[inv.campaignType] || CAMPAIGN_TYPE_CONFIG.donation;
                    const TypeIcon = typeConfig.icon;
                    const statusConfig = STATUS_CONFIG[inv.status] || STATUS_CONFIG.completed;
                    const StatusIcon = statusConfig.icon;

                    return (
                      <div
                        key={inv.id}
                        onClick={() => navigate(`/campaign/${inv.campaignId}`)}
                        className="bg-white rounded-[20px] border border-emerald-50 p-5 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          {/* Campaign thumbnail */}
                          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 bg-slate-100 shadow-sm">
                            {inv.campaignCover ? (
                              <img src={inv.campaignCover} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, #1c2b1e, ${typeConfig.color})` }}
                              >
                                <TypeIcon size={20} strokeWidth={1.5} className="text-white/40" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-black text-[#1c2b1e] tracking-tight leading-snug mb-1 truncate group-hover:text-[#2e7d32] transition-colors">
                              {inv.campaignTitle}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                                style={{ backgroundColor: typeConfig.color + '15', color: typeConfig.color }}
                              >
                                <TypeIcon size={9} strokeWidth={3} />
                                {typeConfig.label}
                              </span>
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest"
                                style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                              >
                                <StatusIcon size={9} strokeWidth={3} />
                                {statusConfig.label}
                              </span>
                              {inv.rewardTitle && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700">
                                  <Gift size={9} strokeWidth={3} />
                                  {inv.rewardTitle}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Amount & Date */}
                          <div className="text-right shrink-0">
                            <p className="text-[16px] font-black text-[#1c2b1e] tracking-tighter">
                              ${inv.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {new Date(inv.createdAt).toLocaleDateString('es-BO', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white rounded-[32px] border border-dashed border-emerald-200 p-20 text-center">
                  <div className="text-emerald-100 mb-6 flex justify-center">
                     <TrendingUp size={64} strokeWidth={1} />
                  </div>
                  <h3 className="text-xl font-black text-[#1c2b1e] tracking-tight mb-3">Sin Actividad Pendiente</h3>
                  <p className="text-[14px] text-slate-400 font-medium max-w-xs mx-auto">Explora nuestras campañas activas y encuentra tu próxima oportunidad de alto impacto financiero.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
