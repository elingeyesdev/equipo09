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

  const cardClass = "bg-white border border-emerald-50 rounded-[24px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col items-center justify-center gap-3 group relative overflow-hidden";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-[#2e7d32] transition-colors";
  const valueClass = "text-2xl font-black text-[#1c2b1e] tracking-tight";
  const iconWrapper = "w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2e7d32] mb-1 group-hover:scale-110 transition-transform";

  return (
    <div className="flex flex-col gap-6 font-['Sora',sans-serif]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Capital Disponible */}
        <div className={cardClass}>
          <div className={iconWrapper}>
            <Wallet size={20} strokeWidth={2.5} />
          </div>
          <div className={`${valueClass} ${hasMaxConfigured ? (isCapitalEmpty ? 'text-red-500' : isCapitalLow ? 'text-amber-500' : 'text-[#2e7d32]') : 'text-slate-300'}`}>
            {hasMaxConfigured ? formatCurrency(availableCapital) : 'N/D'}
          </div>
          <div className={labelClass}>Capital Disponible</div>
          {hasMaxConfigured && onAddCapital && (
            <button
              onClick={onAddCapital}
              className="mt-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-[#2e7d32] text-[#2e7d32] hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer flex items-center gap-1 active:scale-95"
            >
              <ArrowUpCircle size={12} strokeWidth={3} />
              Aumentar
            </button>
          )}
        </div>

        {/* Total Invertido */}
        <div className={cardClass}>
          <div className={iconWrapper}>
            <HandCoins size={20} strokeWidth={2.5} />
          </div>
          <div className={valueClass}>
            {formatCurrency(data.totalInvested || 0)}
          </div>
          <div className={labelClass}>Total Invertido</div>
        </div>

        {/* Monto Pendiente */}
        <div className={cardClass}>
          <div className={iconWrapper}>
            <Clock size={20} strokeWidth={2.5} />
          </div>
          <div className={valueClass}>
            {formatCurrency(data.pendingAmount || 0)}
          </div>
          <div className={labelClass}>Monto Pendiente</div>
        </div>

        {/* Inversiones */}
        <div className={cardClass}>
          <div className={iconWrapper}>
            <Gem size={20} strokeWidth={2.5} />
          </div>
          <div className={`${valueClass} text-[#00897b]`}>
            {data.completedInvestments || 0}
          </div>
          <div className={labelClass}>Inversiones</div>
        </div>
      </div>

      {/* Alerta: Capital bajo o agotado */}
      {hasMaxConfigured && (isCapitalLow || isCapitalEmpty) && onAddCapital && (
        <div className={`${isCapitalEmpty ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'} border p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-500 shadow-sm`}>
          <div className={`${isCapitalEmpty ? 'text-red-500' : 'text-[#f9a825]'} shrink-0`}>
             <AlertTriangle size={24} strokeWidth={2.5} />
          </div> 
          <div className="flex-1">
            <div className={`text-[14px] ${isCapitalEmpty ? 'text-red-800' : 'text-amber-800'} font-medium leading-relaxed`}>
              {isCapitalEmpty 
                ? 'Tu capital disponible se ha agotado. Necesitas agregar más fondos para continuar invirtiendo.'
                : 'Tu capital disponible es bajo (menos del 20%). Considera agregar más fondos para no perder oportunidades.'
              }
            </div>
          </div>
          <button
            onClick={onAddCapital}
            className="shrink-0 px-4 py-2 rounded-xl bg-[#2e7d32] hover:bg-[#1c2b1e] text-white text-[12px] font-black transition-all border-none cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md shadow-emerald-500/20"
          >
            <ArrowUpCircle size={14} strokeWidth={3} />
            Aumentar Capital
          </button>
        </div>
      )}

      {/* Alerta: Sin max configurado */}
      {!hasMaxConfigured && (
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-2xl flex items-start gap-4 animate-in slide-in-from-top-4 duration-500 shadow-sm shadow-amber-900/5">
          <div className="text-[#f9a825] shrink-0">
             <AlertTriangle size={24} strokeWidth={2.5} />
          </div> 
          <div className="text-[14px] text-amber-800 font-medium leading-relaxed">
            No has configurado tu monto máximo de inversión para calcular el capital disponible.{' '}
            <Link to="/profile" className="text-[#2e7d32] font-black hover:underline underline-offset-4 inline-flex items-center gap-1">
              Configúralo aquí
              <ArrowRight size={14} strokeWidth={3} />
            </Link>.
          </div>
        </div>
      )}
    </div>
  );
}

