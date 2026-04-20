import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { EntrepreneurCampaign, CampaignFinancialProgress } from '../types/campaign.types';
import { CircularFundingRing } from './CircularFundingRing';
import { getCampaignFinancialProgress } from '../api/campaign.api';
import { getCampaignHistory } from '../api/admin.api';
import type { CampaignHistoryItem } from '../types/admin.types';
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
  Loader2,
  Mail,
  MapPin,
  Globe,
  Gem,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Heart,
  Clock
} from 'lucide-react';

const CAMPAIGN_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  donation: { label: 'Donación', icon: Heart, color: '#e91e63' },
  reward: { label: 'Recompensa', icon: Gem, color: '#f9a825' },
  equity: { label: 'Equity', icon: TrendingUp, color: '#2e7d32' },
};

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

interface RewardTier {
  id?: string;
  title: string;
  description: string;
  amount: number;
}

interface EntrepreneurInfo {
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  avatar?: string;
  linkedin?: string;
  website?: string;
}

interface Props {
  campaign: EntrepreneurCampaign | null;
  open: boolean;
  onClose: () => void;
  // Entrepreneur actions
  onSubmitForReview?: () => void;
  onPublish?: () => void;
  onUploadImage?: (campaignId: string, file: File) => Promise<boolean>;
  // Admin actions
  isAdmin?: boolean;
  onApprove?: () => void;
  onReject?: (feedback: string) => void;
  // Shared
  actionLoading?: boolean;
  rewardTiers?: RewardTier[];
  entrepreneur?: EntrepreneurInfo;
}

export function CampaignPreviewModal({
  campaign,
  open,
  onClose,
  onSubmitForReview,
  onPublish,
  onUploadImage,
  actionLoading,
  rewardTiers,
  entrepreneur,
  isAdmin,
  onApprove,
  onReject,
}: Props) {
  const [finance, setFinance] = useState<CampaignFinancialProgress | null>(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [adminFeedback, setAdminFeedback] = useState('');
  const [history, setHistory] = useState<CampaignHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
        if (!cancelled) setFinanceLoading(null as any);
        console.error(err);
      } finally {
        if (!cancelled) setFinanceLoading(false);
      }
    })();

    if (isAdmin) {
      setHistoryLoading(true);
      (async () => {
        try {
          const data = await getCampaignHistory(campaign.id);
          if (!cancelled) setHistory(data);
        } catch (err) {
          console.error('Error fetching campaign history:', err);
        } finally {
          if (!cancelled) setHistoryLoading(false);
        }
      })();
    }

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

  const canSubmit = !isAdmin && campaign.status === 'draft';
  const canPublish = !isAdmin && (campaign.status === 'draft' || campaign.status === 'approved');

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
      
      <div className="bg-white rounded-[32px] w-full max-w-[850px] max-h-[90vh] overflow-y-auto relative z-10 shadow-2xl animate-in zoom-in-95 duration-500 border border-white/20">
        
        {/* Header Section */}
        <header className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-emerald-50 flex justify-between items-center z-20">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase text-[#2e7d32] tracking-widest mb-1 leading-none">
              {isAdmin ? 'Revisión Técnica de Administrador' : 'Visión de Análisis Técnico'}
            </span>
            <h2 id="preview-title" className="text-xl font-black text-[#1c2b1e] tracking-tight leading-none">
              {campaign.title}
            </h2>
            <div className="flex items-center gap-3 mt-2">
               <span className="text-[12px] font-bold text-slate-400">{campaign.categoryName || 'General'}</span>
               <div className="w-1 h-1 rounded-full bg-slate-200"></div>
               <span className="text-[10px] font-black uppercase tracking-widest text-[#00897b]">{statusLabel(campaign.status)}</span>
               {campaign.location && (
                 <>
                   <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                   <div className="flex items-center gap-1 text-slate-400">
                     <MapPin size={12} strokeWidth={2.5} />
                     <span className="text-[11px] font-bold">{campaign.location}</span>
                   </div>
                 </>
               )}
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
          <div className="relative group h-[250px] rounded-[28px] overflow-hidden bg-slate-100 border border-emerald-50 shadow-inner">
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
             
              {/* Type Badge Overlay */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span 
                  className="px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-lg flex items-center gap-1.5 backdrop-blur-sm"
                  style={{ backgroundColor: (CAMPAIGN_TYPE_LABELS[campaign.campaignType] || CAMPAIGN_TYPE_LABELS.donation).color }}
                >
                  {(() => {
                    const info = CAMPAIGN_TYPE_LABELS[campaign.campaignType] || CAMPAIGN_TYPE_LABELS.donation;
                    const Icon = info.icon;
                    return (
                      <>
                        <Icon size={12} strokeWidth={3} />
                        {info.label}
                      </>
                    );
                  })()}
                </span>
              </div>

             {onUploadImage && !isAdmin && (
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
          
          {/* Metrics Spotlight */}
          <div className="bg-gradient-to-br from-[#2e7d32] to-[#00897b] rounded-[28px] p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl shadow-emerald-500/20">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-full border border-white/20 shadow-inner">
               <CircularFundingRing currentAmount={cur} goalAmount={goal} />
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 w-full justify-around gap-8 md:gap-4">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100/60 mb-2 leading-none">Meta del Proyecto</span>
                <span className="text-3xl font-black tracking-tight">{formatCampaignCurrency(goal, currency)}</span>
              </div>
              
              <div className="w-px h-12 bg-white/20 hidden md:block self-center"></div>
              
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100/60 mb-2 leading-none">Cierre de Ronda</span>
                <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
                   <Calendar size={18} className="text-emerald-400" />
                   <span>{campaign.endDate ? formatShortDate(campaign.endDate) : 'Sin fecha'}</span>
                </div>
              </div>

              {campaign.startDate && (
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100/60 mb-2 leading-none">Fecha Inicio</span>
                  <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
                    <Clock size={18} className="text-emerald-400" />
                    <span>{formatShortDate(campaign.startDate)}</span>
                  </div>
                </div>
              )}

              {investorsTotal > 0 && (
                <>
                  <div className="w-px h-12 bg-white/20 hidden md:block self-center"></div>
                  <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <span className="text-[11px] font-black uppercase tracking-widest text-emerald-100/60 mb-2 leading-none">Participación</span>
                    <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
                       <Users size={18} className="text-emerald-400" />
                       <span>{investorsTotal} Inversores</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 text-[#1c2b1e]">
            {/* Left Column: Description & Tiers */}
            <div className="flex flex-col gap-10">
              <section className="flex flex-col gap-6">
                <div className="bg-emerald-50/20 p-6 rounded-[24px] border border-emerald-50">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-[#2e7d32] mb-3 flex items-center gap-2">
                    <AlertTriangle size={14} />
                    Resumen Ejecutivo
                  </h3>
                  <p className="text-[15px] text-slate-600 font-medium leading-relaxed italic">
                    {campaign.shortDescription?.trim()
                      ? campaign.shortDescription
                      : 'Sin descripción corta disponible.'}
                  </p>
                </div>

                <div className="space-y-4">
                   <h3 className="text-[13px] font-black border-b border-emerald-50 pb-3 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={18} className="text-[#2e7d32]" />
                    Historia Completa y Objetivos
                  </h3>
                  <div className="text-[14px] text-slate-600 leading-[1.8] whitespace-pre-wrap">
                    {campaign.description || 'No se ha proporcionado una descripción detallada todavía.'}
                  </div>
                </div>
              </section>

              {rewardTiers && rewardTiers.length > 0 && (
                <section className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-black border-b border-emerald-50 pb-3 uppercase tracking-widest flex items-center gap-2">
                    <Gem size={18} className="text-[#2e7d32]" />
                    Niveles de Recompensa
                  </h3>
                  <div className="grid gap-3">
                    {rewardTiers.map((tier, idx) => (
                      <div key={idx} className="p-4 bg-white border border-emerald-50 rounded-2xl flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                        <div>
                          <p className="font-black text-[14px] text-slate-900 leading-tight">{tier.title}</p>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">{tier.description}</p>
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-[#2e7d32] font-black rounded-lg text-[13px]">
                           {formatCampaignCurrency(tier.amount, currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Entrepreneur & Investors */}
            <div className="flex flex-col gap-10">
              {entrepreneur && (
                <section className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-black border-b border-emerald-50 pb-3 uppercase tracking-widest flex items-center gap-2">
                    <User size={18} className="text-[#2e7d32]" />
                    Emprendedor a Cargo
                  </h3>
                  <div className="p-6 bg-white border border-emerald-50 rounded-[32px] space-y-4 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#2e7d32] to-[#aed581] p-0.5 shadow-lg">
                        <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-slate-200 overflow-hidden">
                           {entrepreneur.avatar ? (
                             <img src={entrepreneur.avatar} className="w-full h-full object-cover" alt="Profile" />
                           ) : (
                             <User size={28} />
                           )}
                        </div>
                      </div>
                      <div>
                        <p className="text-[16px] font-black text-slate-900 leading-tight">{entrepreneur.firstName} {entrepreneur.lastName}</p>
                        <p className="text-[11px] font-bold text-[#2e7d32] mt-1 flex items-center gap-1">
                          <Mail size={12} />
                          {entrepreneur.email}
                        </p>
                      </div>
                    </div>
                    {entrepreneur.bio && (
                      <p className="text-[12px] text-slate-500 font-medium italic border-l-2 border-emerald-100 pl-4 py-1 leading-relaxed">
                        "{entrepreneur.bio}"
                      </p>
                    )}
                    {entrepreneur.linkedin && (
                      <div className="pt-1">
                        <a href={entrepreneur.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-300 hover:text-[#2e7d32] rounded-lg transition-all shadow-sm">
                          <Globe size={16} />
                        </a>
                      </div>
                    )}
                  </div>
                </section>
              )}

              <section className="flex flex-col gap-4">
                <h3 className="text-[13px] font-black border-b border-emerald-50 pb-3 uppercase tracking-widest flex items-center gap-2">
                   <TrendingUp size={18} className="text-[#2e7d32]" />
                   Inversores Recientes
                </h3>
                <div className="flex flex-col gap-2 min-h-[100px]">
                  {financeLoading ? (
                    <div className="py-6 flex flex-col items-center justify-center gap-2">
                       <Loader2 className="animate-spin text-emerald-200" size={24} />
                    </div>
                  ) : recent.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                       <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Sin aportes registrados</p>
                    </div>
                  ) : (
                    recent.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between p-3 bg-white border border-emerald-50 rounded-xl hover:shadow-sm transition-all">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-slate-800 leading-tight">
                            {inv.isAnonymous || !inv.investorDisplayName?.trim() ? 'Inversor Confidencial' : inv.investorDisplayName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                             {formatShortDate(inv.createdAt)}
                          </span>
                        </div>
                        <span className="text-[14px] font-black text-[#2e7d32] tracking-tight">
                           {formatCampaignCurrency(inv.amount, inv.currency || currency)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {isAdmin && (
                <section className="flex flex-col gap-4">
                  <h3 className="text-[13px] font-black border-b border-emerald-50 pb-3 uppercase tracking-widest flex items-center gap-2">
                     <Clock size={18} className="text-indigo-500" />
                     Historial de Auditoría
                  </h3>
                  <div className="flex flex-col gap-3 min-h-[100px]">
                    {historyLoading ? (
                      <div className="py-6 flex flex-col items-center justify-center gap-2">
                         <Loader2 className="animate-spin text-indigo-200" size={24} />
                      </div>
                    ) : history.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                         <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Sin historial previo</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {history.map((item) => (
                          <div key={item.id} className="relative pl-6 border-l-2 border-indigo-50 pb-1">
                            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-400"></div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <span className="text-[12px] font-black text-slate-800">
                                  {statusLabel(item.from_status || 'draft')} → <span className="text-indigo-600">{statusLabel(item.to_status)}</span>
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">
                                  {formatShortDate(item.created_at)}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                {item.feedback || 'Sin comentarios registrados.'}
                              </p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                  <User size={10} className="text-slate-400" />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                  {item.changed_by_name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        {isAdmin ? (
          <footer className="sticky bottom-0 bg-white/90 backdrop-blur-md px-8 py-6 border-t border-emerald-50 flex flex-col gap-6 z-20">
             <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Feedback de Revisión Técnica</label>
                <textarea
                  value={adminFeedback}
                  onChange={(e) => setAdminFeedback(e.target.value)}
                  placeholder="Instrucciones para el emprendedor o motivos del rechazo..."
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[24px] text-[#1c2b1e] placeholder:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all text-[13px] font-medium h-24 shadow-sm"
                />
             </div>
             <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 text-slate-400">
                   <AlertTriangle size={18} />
                   <span className="text-[11px] font-bold leading-tight">La decisión notificará automáticamente al emprendedor.</span>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                      type="button"
                      className="flex-1 md:flex-none border-none bg-red-50 hover:bg-red-500 text-red-600 hover:text-white font-black px-8 py-4 rounded-2xl transition-all active:scale-95 text-[13px] cursor-pointer flex items-center justify-center gap-2"
                      disabled={actionLoading}
                      onClick={() => onReject?.(adminFeedback)}
                    >
                      <XCircle size={18} strokeWidth={2.5} />
                      Rechazar
                    </button>
                    <button
                      type="button"
                      className="flex-1 md:flex-none border-none bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-black px-10 py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-emerald-500/20 text-[13px] cursor-pointer flex items-center justify-center gap-2 min-w-[180px]"
                      disabled={actionLoading}
                      onClick={() => onApprove?.()}
                    >
                      {actionLoading ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <>
                          <CheckCircle size={18} strokeWidth={2.5} />
                          Aprobar Proyecto
                        </>
                      )}
                    </button>
                </div>
             </div>
          </footer>
        ) : (canSubmit || canPublish) ? (
          <footer className="footer-panel bg-emerald-50/30 px-8 py-6 border-t border-emerald-50 flex flex-col md:flex-row justify-end items-center gap-4 z-20">
            <div className="flex-1 hidden md:block text-[11px] font-medium text-[#1c2b1e]/50 leading-tight">
               Al lanzar la campaña, esta entrará en fase de recaudación activa.<br /> Certifica que la documentación técnica está completa.
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
                   Enviar a Revisión
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
                   Lanzar Campaña
                 </button>
               )}
            </div>
          </footer>
        ) : null}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
