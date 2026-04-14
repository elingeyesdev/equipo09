import type { CapitalOverview } from '../../types/investor.types';
import { 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  ArrowUpRight, 
  Clock,
  FolderOpen,
  Gem,
} from 'lucide-react';

interface Props {
  capitalData: CapitalOverview | null;
  capitalLoading: boolean;
}

export function InvestmentsFeed({ capitalData, capitalLoading }: Props) {
  return (
    <div className="flex-1 min-w-[280px] flex flex-col gap-8 font-['Sora',sans-serif]">

      {/* Capital Stats Grid */}
      {capitalData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white rounded-[28px] border border-emerald-50 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                <TrendingUp size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Invertido</span>
            </div>
            <div className="text-[28px] font-black text-[#1c2b1e] tracking-tighter leading-none relative z-10">
              ${capitalData.totalInvested.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-emerald-50 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 bg-emerald-50 text-[#00897b] rounded-xl flex items-center justify-center border border-emerald-100 group-hover:scale-110 transition-transform">
                <BarChart3 size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inversiones</span>
            </div>
            <div className="text-[28px] font-black text-[#1c2b1e] tracking-tighter leading-none relative z-10">
              {capitalData.totalInvestments}
            </div>
            <div className="text-[11px] font-bold text-slate-400 mt-1 relative z-10">
              {capitalData.completedInvestments} completadas
            </div>
          </div>

          <div className="bg-white rounded-[28px] border border-emerald-50 p-6 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="w-10 h-10 bg-amber-50 text-[#f9a825] rounded-xl flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform">
                <Wallet size={18} strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Capital Disponible</span>
            </div>
            <div className="text-[28px] font-black text-[#1c2b1e] tracking-tighter leading-none relative z-10">
              {capitalData.availableCapital !== null ? `$${capitalData.availableCapital.toLocaleString()}` : '—'}
            </div>
            {capitalData.pendingAmount > 0 && (
              <div className="text-[11px] font-bold text-amber-600 mt-1 relative z-10 flex items-center gap-1">
                <Clock size={10} strokeWidth={3} /> ${capitalData.pendingAmount.toLocaleString()} pendiente
              </div>
            )}
          </div>
        </div>
      )}

      {capitalLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-[28px] border border-emerald-50 p-6 shadow-sm animate-pulse">
              <div className="w-10 h-10 bg-slate-100 rounded-xl mb-4"></div>
              <div className="w-24 h-3 bg-slate-100 rounded-full mb-3"></div>
              <div className="w-32 h-7 bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      {/* Investments List Area */}
      <div className="bg-white rounded-[40px] shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 border border-emerald-50">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-10">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-[#1c2b1e] text-white rounded-xl flex items-center justify-center">
                <Gem size={18} strokeWidth={2.5} />
             </div>
             <span className="text-[20px] font-black text-[#1c2b1e] tracking-tight uppercase tracking-widest leading-none">
               Historial de Inversiones
             </span>
          </div>
          <button className="bg-[#2e7d32] hover:bg-[#1c2b1e] text-white border-none rounded-xl px-4 py-3 text-[12px] font-black uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-900/10">
            <ArrowUpRight size={16} strokeWidth={3} /> Explorar Campañas
          </button>
        </div>

        {/* Empty state */}
        <div className="py-24 text-center bg-slate-50/20 border-[2px] border-dashed border-emerald-200 rounded-[40px] flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm flex items-center justify-center text-emerald-200 mb-6 group hover:scale-110 transition-transform">
             <FolderOpen size={40} strokeWidth={1} />
          </div>
          <p className="text-[#1c2b1e] font-black text-[20px] mb-2 uppercase tracking-tight">Sin Inversiones Aún</p>
          <p className="text-slate-400 font-medium text-[15px] max-w-[360px] leading-relaxed mb-10">Explora campañas activas y comienza a construir tu portafolio de inversión con impacto real.</p>
          <button className="text-[#2e7d32] font-black text-[13px] uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent">
            Explorar oportunidades disponibles
          </button>
        </div>
      </div>
    </div>
  );
}
