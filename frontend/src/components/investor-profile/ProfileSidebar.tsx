import type { InvestorProfile } from '../../types/investor.types';
import { 
  MapPin, 
  FileText, 
  Link2, 
  Home, 
  Globe, 
  Scale, 
  Pencil, 
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  Trash2,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react';

type ModalType = 'profile' | 'fiscal' | 'address' | 'investment' | 'avatar' | null;

interface Props {
  profile: InvestorProfile | null;
  openModal: (type: ModalType) => void;
  userEmail?: string;
  onDeleteProfile?: () => void | Promise<void>;
}

const INVESTOR_TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  institutional: 'Institucional',
  angel: 'Ángel',
};

export function ProfileSidebar({ profile, openModal, userEmail, onDeleteProfile }: Props) {
  const fields = [
    { label: 'Información básica', value: profile?.firstName && profile?.lastName && profile?.bio, modal: 'profile' },
    { label: 'Datos fiscales', value: profile?.taxId, modal: 'fiscal' },
    { label: 'Ubicación', value: profile?.addressLine1 && profile?.country, modal: 'address' },
    { label: 'Preferencias de inversión', value: profile?.minInvestment || profile?.maxInvestment, modal: 'investment' },
    { label: 'Foto de perfil', value: profile?.avatarUrl, modal: 'avatar' },
  ];
  
  const filledCount = fields.filter(f => f.value).length;
  const percentage = Math.round((filledCount / fields.length) * 100) || 0;
  const nextStep = fields.find(f => !f.value);

  const cardClass = "bg-white rounded-[28px] shadow-sm border border-emerald-50 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 group transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden relative";
  const sectionTitle = "text-[15px] font-black text-[#1c2b1e] flex items-center justify-between gap-2 uppercase tracking-widest";
  const iconBox = "w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center shrink-0 border border-emerald-100 transition-all group-hover:scale-110";
  const editBtn = "w-9 h-9 bg-slate-50 hover:bg-emerald-100 text-slate-400 hover:text-[#2e7d32] rounded-xl flex items-center justify-center cursor-pointer transition-all border-none active:scale-95";

  return (
    <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-6 font-['Sora',sans-serif]">
      
      {/* Profile completeness */}
      <div className={`${cardClass} border-l-[6px] border-l-[#2e7d32]`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-3xl -mr-12 -mt-12 opacity-50"></div>
        <div className={sectionTitle}>
           Proceso de Perfil
          <span className="text-[14px] text-[#2e7d32] font-black">{percentage}%</span>
        </div>
        <div className="mt-4 h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner relative z-10">
          <div 
            className="h-full bg-gradient-to-r from-[#a5d6a7] to-[#2e7d32] rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(46,125,50,0.3)]" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        {percentage < 100 && nextStep && (
          <button 
            className="mt-5 w-full text-center py-3 text-[13px] text-[#2e7d32] font-black bg-emerald-50 border border-emerald-100 rounded-xl hover:bg-[#2e7d32] hover:text-white transition-all flex items-center justify-center gap-2 group/btn relative z-10 cursor-pointer" 
            onClick={() => openModal(nextStep.modal as any)}
          >
            Siguiente: {nextStep.label}
            <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Bio & Type */}
      <div className={cardClass}>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[16px] font-black text-[#1c2b1e] uppercase tracking-widest">Biografía & Perfil</span>
          <button onClick={() => openModal('profile')} className={editBtn} title="Editar">
            <Pencil size={14} strokeWidth={2.5} />
          </button>
        </div>
        
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4 text-[#1c2b1e] text-[14px]">
            <div className={iconBox}><Shield size={18} strokeWidth={2.5} /></div>
            <span className="font-bold text-[#2e7d32]">
              {profile?.investorType ? INVESTOR_TYPE_LABELS[profile.investorType] : 'Tipo no definido'}
              {profile?.accredited && (
                <span className="ml-2 bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest">Acreditado</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[#1c2b1e] text-[14px]">
            <div className={iconBox}><MapPin size={18} strokeWidth={2.5} /></div>
            <span className="font-bold text-slate-700">{profile?.city && profile?.state ? `${profile.city}, ${profile.state}` : 'Ubicación no especificada'}</span>
          </div>
          
          <div className="flex items-start gap-4 text-[#1c2b1e] text-[14px]">
            <div className={iconBox}><FileText size={18} strokeWidth={2.5} /></div>
            <span className="font-medium text-slate-500 line-clamp-3 leading-relaxed">
              {profile?.bio || <span className="text-slate-300 italic font-normal">Trayectoria profesional no detallada.</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Investment Preferences */}
      <div className={cardClass}>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[16px] font-black text-[#1c2b1e] uppercase tracking-widest">Capital & Límites</span>
          <button onClick={() => openModal('investment')} className={editBtn}>
            <Pencil size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-[#1c2b1e] text-[14px]">
            <div className={`${iconBox} bg-[#1c2b1e] text-white border-transparent`}>
               <TrendingUp size={18} strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <div className="font-black truncate text-slate-900">
                Rango: {profile?.minInvestment ? `$${profile.minInvestment.toLocaleString()}` : '—'} — {profile?.maxInvestment ? `$${profile.maxInvestment.toLocaleString()}` : '—'}
              </div>
              <div className="text-[12px] text-slate-400 font-bold tracking-widest mt-0.5">
                Mín / Máx de inversión
              </div>
            </div>
          </div>

          {profile?.preferredCategories && profile.preferredCategories.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-[#2e7d32]" strokeWidth={2.5} />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sectores de Interés</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.preferredCategories.map((cat, i) => (
                  <span key={i} className="bg-emerald-50 text-[#2e7d32] border border-emerald-100 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address */}
      <div className={cardClass}>
        <div className="flex justify-between items-center mb-6">
          <span className="text-[16px] font-black text-[#1c2b1e] uppercase tracking-widest">Ubicación Legal</span>
          <button onClick={() => openModal('address')} className={editBtn}>
            <Pencil size={14} strokeWidth={2.5} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 text-[#1c2b1e] text-[14px]">
            <div className={iconBox}><Home size={18} strokeWidth={2.5} /></div>
            <span className="font-bold text-slate-700 truncate">{profile?.addressLine1 || 'Dirección no especificada'}</span>
          </div>
          <div className="flex items-center gap-4 text-[#1c2b1e] text-[14px]">
            <div className={iconBox}><Globe size={18} strokeWidth={2.5} /></div>
            <span className="font-bold text-slate-700">
              {profile?.country ? `${profile.country} · CP ${profile.postalCode || '-'}` : 'Región no especificada'}
            </span>
          </div>
        </div>
      </div>

      {/* Identity verification */}
      <div className={`rounded-[28px] p-6 shadow-sm ring-1 group transition-all hover:shadow-lg ${profile?.identityVerified ? 'bg-emerald-50/50 ring-emerald-100' : 'bg-slate-50/50 ring-slate-100 hover:ring-slate-200'}`}>
        <div className="flex justify-between items-center mb-5">
          <span className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest leading-none">Status de Auditoría</span>
        </div>
        
        {profile?.identityVerified ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border border-emerald-100 rounded-2xl flex items-center justify-center text-[#2e7d32] shadow-sm shrink-0">
                 <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="font-black text-[#1c2b1e] text-[14px] leading-tight mb-1 uppercase tracking-tight">Identidad Certificada</div>
                <div className="text-[11px] text-[#2e7d32] font-black uppercase tracking-tighter opacity-70">Inversor verificado</div>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="bg-white border border-emerald-100 text-[#2e7d32] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#2e7d32] rounded-full animate-pulse"></div> Check KYC
              </span>
              <span className="bg-white border border-emerald-100 text-[#2e7d32] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xs flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#2e7d32] rounded-full animate-pulse"></div> Biometría
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white border border-red-50 rounded-2xl flex items-center justify-center text-[#f9a825] shadow-sm shrink-0">
                 <Scale size={24} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="font-black text-slate-700 text-[14px] leading-tight mb-1 uppercase tracking-tight">Verificación Requerida</div>
                <div className="text-[11px] text-slate-400 font-bold leading-tight">Envía tus documentos para proteger tu cuenta y habilitar inversiones.</div>
              </div>
            </div>
            <button className="w-full mt-2 py-3.5 bg-[#f9a825] hover:bg-[#c62828] text-white font-black rounded-xl transition-all text-[12px] uppercase tracking-widest shadow-lg shadow-amber-500/20 active:scale-95 border-none cursor-pointer flex items-center justify-center gap-2">
              <ShieldAlert size={16} strokeWidth={3} />
              Iniciar Verificación
            </button>
          </div>
        )}
      </div>

      {profile && onDeleteProfile && (
        <div className="rounded-[28px] p-6 border border-red-100 bg-red-50/40 shadow-sm">
          <p className="text-[11px] font-black text-red-800 uppercase tracking-widest mb-2">Zona de riesgo</p>
          <p className="text-[13px] text-red-900/80 font-medium leading-snug mb-4">
            Elimina solo tu perfil de inversor. Tu usuario y sesión siguen activos. No disponible si tienes inversiones.
          </p>
          <button
            type="button"
            onClick={() => void onDeleteProfile()}
            className="w-full py-3 rounded-xl text-[12px] font-black uppercase tracking-widest bg-white border border-red-200 text-red-700 hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 size={16} strokeWidth={2.5} />
            Eliminar perfil inversor
          </button>
        </div>
      )}

      {userEmail && (
        <div className="px-6 py-4 bg-white border border-emerald-50 rounded-[20px] shadow-sm flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#2e7d32]">
              <Link2 size={14} strokeWidth={2.5} />
           </div>
           <div className="min-w-0">
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">CUENTA VINCULADA</div>
              <div className="text-[12px] font-bold text-slate-600 truncate">{userEmail}</div>
           </div>
        </div>
      )}
    </div>
  );
}
