import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EntrepreneurCampaign, CampaignFinancialProgress } from '../types/campaign.types';
import { CircularFundingRing } from './CircularFundingRing';
import { getCampaignFinancialProgress } from '../api/campaign.api';
import { formatCampaignCurrency } from '../utils/campaignFunding';
import { 
  FileText, 
  TrendingUp, 
  Users, 
  X, 
  AlertTriangle, 
  Rocket,
  Camera,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'Borrador',
    published: 'Publicada',
    in_review: 'En revisión',
    pending_review: 'En aprobación',
    approved: 'Aprobada',
    funded: 'Financiada',
    partially_funded: 'Parcialmente financiada',
    completed: 'Completada',
    failed: 'Fallida',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
    suspended: 'Suspendida',
  };
  return map[status] ?? status;
}

function investmentStatusLabel(status: string): string {
  const map: Record<string, string> = {
    completed: 'Confirmado',
    pending: 'Pendiente',
    failed: 'Fallido',
    refunded: 'Reembolsado',
    partially_refunded: 'Reemb. parcial',
  };
  return map[status] ?? status;
}

function formatShortDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

interface Props {
  campaign: EntrepreneurCampaign | null;
  open: boolean;
  onClose: () => void;
  onSubmitForReview?: () => void;
  onPublish?: () => void;
  onUploadImage?: (campaignId: string, file: File) => Promise<boolean>;
  actionLoading?: boolean;
}

export function CampaignPreviewModal({
  campaign,
  open,
  onClose,
  onSubmitForReview,
  onPublish,
  onUploadImage,
  actionLoading,
}: Props) {
  const [finance, setFinance] = useState<CampaignFinancialProgress | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open || !campaign) {
      setFinance(null);
      return;
    }

    let cancelled = false;
    setFinance(null);
    setFinanceLoading(true);

    (async () => {
      try {
        const data = await getCampaignFinancialProgress(campaign.id);
        if (!cancelled) setFinance(data);
      } catch (err) {
        if (!cancelled) setFinance(null);
        console.error(err);
      } finally {
        if (!cancelled) setFinanceLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, campaign?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !campaign) return null;

  const canSubmit = campaign.status === 'draft';
  const canPublish = campaign.status === 'draft' || campaign.status === 'approved';

  const handleImageClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (file && onUploadImage) {
        setUploading(true);
        await onUploadImage(campaign.id, file);
        setUploading(false);
      }
    };
    input.click();
  };

  const cur = finance?.currentAmount ?? campaign.currentAmount;
  const goal = finance?.goalAmount ?? campaign.goalAmount;
  const currency = campaign.currency || 'USD';
  const investorsTotal = finance?.investorCount ?? campaign.investorCount;
  const recent = finance?.recentInvestments ?? [];

  const node = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 font-['Sora',sans-serif] animate-in fade-in duration-300" role="dialog" aria-modal="true" aria-labelledby="preview-title">
      <div className="absolute inset-0 bg-[#1c2b1e]/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      
      <div className="bg-white rounded-[32px] w-full max-w-[800px] max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20">
        
        {/* Header Section */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-emerald-50 flex justify-between items-center z-20">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-[#2e7d32] tracking-widest mb-1 leading-none">Visión de Análisis Técnico</span>
            <h2 id="preview-title" className="text-xl font-black text-[#1c2b1e] tracking-tight leading-none">
              {campaign.title}
            </h2>
            <div className="flex items-center gap-2 mt-2">
               <span className="text-[12px] font-bold text-slate-400">{campaign.categoryName || 'General'}</span>
               <div className="w-1 h-1 rounded-full bg-slate-200"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-[#00897b]">{statusLabel(campaign.status)}</span>
            </div>
          </div>
          <button 
            type="button" 
            className="w-10 h-10 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-[#2e7d32] transition-all active:scale-95 flex items-center justify-center border-none cursor-pointer" 
            onClick={onClose}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </header>

        <div className="p-8 flex flex-col gap-10">
          
          {/* Campaign Cover Section */}
          <div className="relative group h-[220px] rounded-[28px] overflow-hidden bg-slate-100 border border-emerald-50 shadow-inner">
             {campaign.coverImageUrl ? (
               <img 
                 src={campaign.coverImageUrl} 
                 alt="Portada de Campaña" 
                 className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
               />
             ) : (
               <div className="w-full h-full bg-gradient-to-br from-slate-50 to-emerald-50/30 flex flex-col items-center justify-center text-slate-300">
                  <ImageIcon size={64} strokeWidth={1} className="mb-2" />
                  <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Sin imagen de portada</span>
               </div>
             )}
             
             {onUploadImage && (
               <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button 
                    onClick={handleImageClick}
                    disabled={uploading}
                    className="bg-white/90 hover:bg-white text-[#1c2b1e] px-6 py-3 rounded-2xl font-black text-[12px] uppercase tracking-widest shadow-xl flex items-center gap-3 transition-all active:scale-95 disabled:opacity-50 border-none cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Camera size={18} />
                    )}
                    {campaign.coverImageUrl ? 'Cambiar Imagen' : 'Subir Portada'}
                  </button>
               </div>
             )}
          </div>
          
          {/* Metrics Spotlight - Green Theme */}
          <div className="bg-gradient-to-br from-[#2e7d32] to-[#00897b] rounded-[28px] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-emerald-500/20">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-inner">
               <CircularFundingRing currentAmount={cur} goalAmount={goal} />
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 w-full justify-around gap-8 md:gap-4">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100 mb-2 leading-none">Capital Recaudado</span>
                <span className="text-3xl font-black tracking-tight">{formatCampaignCurrency(cur, currency)}</span>
              </div>
              
              <div className="w-px h-12 bg-white/20 hidden md:block self-center"></div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100 mb-2 leading-none">Objetivo del Proyecto</span>
                <span className="text-2xl font-black tracking-tight opacity-90">{formatCampaignCurrency(goal, currency)}</span>
              </div>

              {finance != null && finance.remainingAmount > 0 && (
                <>
                  <div className="w-px h-12 bg-white/20 hidden md:block self-center"></div>
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100 mb-2 leading-none">Brecha Pendiente</span>
                    <span className="text-xl font-bold tracking-tight text-white/70 italic">-{formatCampaignCurrency(finance.remainingAmount, currency)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Story/Description */}
            <section className="flex flex-col gap-4">
              <h3 className="text-[13px] font-black text-[#1c2b1e] border-b border-emerald-50 pb-3 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-8 h-8 rounded-lg bg-emerald-50 text-[#2e7d32] flex items-center justify-center">
                    <FileText size={16} strokeWidth={2.5} />
                 </span> 
                 Descripción del Proyecto
              </h3>
              <p className="text-[15px] text-slate-600 font-medium leading-relaxed bg-emerald-50/30 p-6 rounded-2xl border border-emerald-50 italic">
                {campaign.shortDescription?.trim()
                  ? campaign.shortDescription
                  : 'Este emprendedor aún no ha detallado la descripción corta de su propuesta de valor. La información extendida estará disponible tras la publicación oficial.'}
              </p>
            </section>

            {/* Contributors Section */}
            <section className="flex flex-col gap-4">
              <h3 className="text-[13px] font-black text-[#1c2b1e] border-b border-emerald-50 pb-3 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-8 h-8 rounded-lg bg-lime-50 text-[#2e7d32] flex items-center justify-center">
                    <TrendingUp size={16} strokeWidth={2.5} />
                 </span> 
                 Relación de Inversores
              </h3>
              
              <div className="flex flex-col gap-3 min-h-[120px]">
                {financeLoading ? (
                  <div className="py-10 flex flex-col items-center justify-center gap-3">
                     <div className="w-6 h-6 border-3 border-emerald-100 border-t-[#2e7d32] rounded-full animate-spin"></div>
                     <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest leading-none">Auditando Dossier...</span>
                  </div>
                ) : (
                  <>
                    {investorsTotal === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 bg-emerald-50/10 rounded-2xl border border-dashed border-emerald-200">
                         <div className="text-emerald-100 mb-2">
                            <Users size={40} strokeWidth={1.5} />
                         </div>
                         <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Aún sin aportes registrados</p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {recent.map((inv) => (
                          <div key={inv.id} className="flex items-center justify-between p-4 bg-white border border-emerald-50 rounded-xl hover:shadow-md transition-all">
                            <div className="flex flex-col">
                              <span className="text-[14px] font-black text-slate-900 leading-tight tracking-tight">
                                {inv.isAnonymous || !inv.investorDisplayName?.trim() ? 'Inversor Confidencial' : inv.investorDisplayName}
                              </span>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-[#2e7d32] uppercase tracking-tighter">
                                   {investmentStatusLabel(inv.status)}
                                </span>
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                   {formatShortDate(inv.createdAt)}
                                </span>
                              </div>
                            </div>
                            <span className="text-[15px] font-black text-[#2e7d32] tracking-tight">
                              {formatCampaignCurrency(inv.amount, inv.currency || currency)}
                            </span>
                          </div>
                        ))}
                        {investorsTotal > recent.length && (
                           <div className="text-center py-2">
                              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest italic">+{investorsTotal - recent.length} inversores adicionales</span>
                           </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        {(canSubmit || canPublish) && (
          <footer className="footer-panel bg-emerald-50/30 px-8 py-6 border-t border-emerald-50 flex flex-col md:flex-row justify-end items-center gap-4">
            <div className="flex-1 hidden md:block text-[12px] font-medium text-[#1c2b1e]/60 leading-tight">
               Al lanzar la campaña, esta pasará a fase de recaudación activa.<br /> Asegúrate de que toda la información técnica es correcta.
            </div>
            <div className="flex gap-3 w-full md:w-auto">
               {canSubmit && (
                 <button
                   type="button"
                   className="flex-1 md:flex-none bg-[#f9a825] hover:bg-amber-600 text-white font-black px-8 py-3.5 rounded-xl border-none transition-all active:scale-95 shadow-lg shadow-amber-500/20 text-[14px] cursor-pointer flex items-center justify-center gap-2"
                   disabled={actionLoading}
                   onClick={onSubmitForReview}
                 >
                   <AlertTriangle size={18} strokeWidth={2.5} />
                   Enviar para Aprobación
                 </button>
               )}
               {canPublish && (
                 <button
                   type="button"
                   className="flex-1 md:flex-none bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-black px-10 py-3.5 rounded-xl border-none transition-all active:scale-95 shadow-lg shadow-emerald-500/20 text-[14px] cursor-pointer flex items-center justify-center gap-2"
                   disabled={actionLoading}
                   onClick={onPublish}
                 >
                   <Rocket size={18} strokeWidth={2.5} />
                   Lanzar Campaña Ahora
                 </button>
               )}
            </div>
          </footer>
        )}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
