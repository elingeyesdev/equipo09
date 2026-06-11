import type { CapitalOverview } from '../types/investor.types';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Wallet, 
  HandCoins, 
  Clock, 
  Gem, 
  ArrowRight,
  ArrowUpCircle,
} from 'lucide-react';

interface Props {
  data: CapitalOverview;
  onAddCapital?: () => void;
}

export function InvestorDashboardOverview({ data, onAddCapital }: Props) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const hasMaxConfigured = data.maxInvestmentLimit !== null;
  const availableCapital = data.availableCapital || 0;
  const isCapitalLow = hasMaxConfigured && data.maxInvestmentLimit! > 0 && (availableCapital / data.maxInvestmentLimit!) < 0.2;
  const isCapitalEmpty = hasMaxConfigured && availableCapital <= 0;

  const cardClass = "relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1.5 transition-all duration-500 flex flex-col group";
  const labelClass = "text-[11px] font-black text-slate-400 uppercase tracking-widest mt-auto group-hover:text-[#2e7d32] transition-colors";
  const valueClass = "text-4xl font-black tracking-tighter mt-4 mb-2";

  return (
    <div className="flex flex-col gap-6 font-['Plus Jakarta Sans',sans-serif]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Capital Disponible */}
        <div className={`${cardClass} col-span-1 sm:col-span-2 lg:col-span-2 bg-gradient-to-br from-[#1c2b1e] to-[#2e7d32] border-none !shadow-emerald-900/20`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-transform duration-1000 group-hover:scale-150" />
          
          <div className="flex justify-between items-start relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-400 border border-white/10 group-hover:scale-110 transition-transform duration-500">
              <Wallet size={28} strokeWidth={2.5} />
            </div>
            {hasMaxConfigured && onAddCapital && (
              <button
                onClick={onAddCapital}
                className="px-4 py-2.5 rounded-xl bg-white text-[#1c2b1e] hover:bg-emerald-50 hover:text-[#2e7d32] text-[12px] font-black uppercase tracking-widest transition-all border-none cursor-pointer flex items-center gap-2 active:scale-95 shadow-lg"
              >
                <ArrowUpCircle size={16} strokeWidth={3} />
                Aumentar Capital
              </button>
            )}
          </div>
          
          <div className={`relative z-10 ${valueClass} ${hasMaxConfigured ? (isCapitalEmpty ? 'text-red-400' : isCapitalLow ? 'text-amber-400' : 'text-white') : 'text-white/50'} text-5xl mt-6`}>
            {hasMaxConfigured ? formatCurrency(availableCapital) : 'N/D'}
          </div>
          <div className="text-[12px] font-black text-emerald-100/70 uppercase tracking-widest relative z-10 mt-1">
            Capital Disponible
          </div>
        </div>

        {/* Total Invertido */}
        <div className={cardClass}>
          <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-[#2e7d32] transition-colors duration-500">
            <HandCoins size={24} strokeWidth={2.5} />
          </div>
          <div className={`${valueClass} text-[#1c2b1e]`}>
            {formatCurrency(data.totalInvested || 0)}
          </div>
          <div className={labelClass}>Total Invertido</div>
        </div>

        {/* Monto Pendiente */}
        <div className={cardClass}>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors duration-500">
            <Clock size={24} strokeWidth={2.5} />
          </div>
          <div className={`${valueClass} text-[#1c2b1e]`}>
            {formatCurrency(data.pendingAmount || 0)}
          </div>
          <div className={labelClass}>Monto Pendiente</div>
        </div>

        {/* Inversiones */}
        <div className={cardClass}>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors duration-500">
            <Gem size={24} strokeWidth={2.5} />
          </div>
          <div className={`${valueClass} text-[#1c2b1e]`}>
            {data.completedInvestments || 0}
          </div>
          <div className={labelClass}>Inversiones</div>
        </div>
      </div>

      {/* Alerta: Capital bajo o agotado */}
      {hasMaxConfigured && (isCapitalLow || isCapitalEmpty) && onAddCapital && (
        <div className={`${isCapitalEmpty ? 'bg-red-50/80 border-red-100' : 'bg-amber-50/80 border-amber-100'} backdrop-blur-md border p-6 rounded-[24px] flex items-center gap-5 animate-in slide-in-from-top-4 duration-700 shadow-sm`}>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCapitalEmpty ? 'bg-red-100 text-red-500' : 'bg-amber-100 text-[#f9a825]'}`}>
             <AlertTriangle size={24} strokeWidth={2.5} />
          </div> 
          <div className="flex-1">
            <h4 className={`text-lg font-black mb-1 ${isCapitalEmpty ? 'text-red-900' : 'text-amber-900'}`}>
              {isCapitalEmpty ? 'Capital Agotado' : 'Capital Bajo'}
            </h4>
            <div className={`text-[14px] ${isCapitalEmpty ? 'text-red-700' : 'text-amber-700'} font-medium`}>
              {isCapitalEmpty 
                ? 'Necesitas agregar más fondos para continuar invirtiendo.'
                : 'Tienes menos del 20% de tu límite. Considera agregar más fondos.'
              }
            </div>
          </div>
        </div>
      )}

      {/* Alerta: Sin max configurado */}
      {!hasMaxConfigured && (
        <div className="bg-[#1c2b1e] border border-emerald-900 p-6 rounded-[24px] flex flex-col sm:flex-row sm:items-center gap-5 animate-in slide-in-from-top-4 duration-700 shadow-xl shadow-emerald-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0 border border-white/5 relative z-10">
             <AlertTriangle size={24} strokeWidth={2.5} />
          </div> 
          <div className="flex-1 relative z-10">
            <h4 className="text-lg font-black text-white mb-1">Perfil Incompleto</h4>
            <div className="text-[14px] text-emerald-100/70 font-medium">
              No has configurado tu monto máximo de inversión para calcular el capital disponible.
            </div>
          </div>
          <Link to="/profile" className="shrink-0 px-6 py-3 rounded-xl bg-[#2e7d32] hover:bg-emerald-500 text-white text-[13px] font-black uppercase tracking-widest transition-all border-none cursor-pointer flex items-center justify-center gap-2 active:scale-95 no-underline relative z-10">
            Configurar Ahora
            <ArrowRight size={16} strokeWidth={3} />
          </Link>
        </div>
      )}
    </div>
  );
}

