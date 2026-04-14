import { useState, useEffect } from 'react';
import { useInvestorProfile } from '../hooks/useInvestorProfile';
import { useInvestorDashboard } from '../hooks/useInvestorDashboard';
import { Navbar } from '../components/Navbar';

import { ProfileHeader } from '../components/investor-profile/ProfileHeader';
import { ProfileTabs } from '../components/investor-profile/ProfileTabs';
import { ProfileSidebar } from '../components/investor-profile/ProfileSidebar';
import { InvestmentsFeed } from '../components/investor-profile/InvestmentsFeed';
import { EditProfileModal } from '../components/investor-profile/EditProfileModal';
import { 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  MessageSquare, 
  User, 
  MapPin, 
  Shield,
  FolderOpen,
  Rocket,
  Target,
} from 'lucide-react';

type ModalType = 'profile' | 'fiscal' | 'address' | 'investment' | 'avatar' | null;

const INVESTOR_TYPE_LABELS: Record<string, string> = {
  individual: 'Inversor Individual',
  institutional: 'Inversor Institucional',
  angel: 'Ángel Inversionista',
};

export function InvestorProfilePage() {
  const {
    profile,
    loading: profileLoading,
    saving,
    error: profileError,
    successMessage,
    submitProfile,
    uploadAvatarPhoto,
    uploadCoverPhoto,
    deleteProfile,
  } = useInvestorProfile();

  const {
    data: capitalData,
    loading: capitalLoading,
  } = useInvestorDashboard();

  const handleDeleteInvestorProfile = async () => {
    const ok = window.confirm(
      '¿Eliminar tu perfil de inversor? Tu cuenta seguirá activa. No es posible si ya tienes inversiones registradas.',
    );
    if (!ok) return;
    await deleteProfile();
  };

  const [modalType, setModalType] = useState<ModalType>(null);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [onboardingTriggered, setOnboardingTriggered] = useState(false);

  const userEmail = localStorage.getItem('userEmail') ?? '';

  useEffect(() => {
    if (!profileLoading && !profile && !onboardingTriggered) {
      const timer = setTimeout(() => {
        setModalType('profile');
        setOnboardingTriggered(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [profileLoading, profile, onboardingTriggered]);

  const handleSave = async (type: string, data: any) => {
    const baseData = { ...profile, ...data };
    if (!profile) {
      if (!baseData.firstName) baseData.firstName = 'Usuario';
      if (!baseData.lastName) baseData.lastName = 'Sin Registrar';
    }
    const {
      id, userId, avatarUrl, coverUrl, identityVerified, identityVerifiedAt,
      verificationDocuments, totalInvestments, totalInvested, accredited,
      metadata, createdAt, updatedAt, ...sanitizedData
    } = baseData;
    await submitProfile(sanitizedData);
    setModalType(null);
  };

  const error = profileError;

  return (
    <div className="min-h-screen font-sans bg-[#f4f7f4] flex flex-col font-['Sora',sans-serif]">
      <Navbar />

      <main className="flex-1 w-full relative z-0 pb-20">
        
        {profileLoading ? (
           <div className="max-w-[1100px] mx-auto p-40 flex flex-col items-center justify-center gap-6">
             <Loader2 className="w-14 h-14 text-[#2e7d32] animate-spin" strokeWidth={2.5} />
             <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">Sincronizando Expediente Financiero...</p>
           </div>
        ) : (
           <>
             <div className="bg-white shadow-sm">
               <ProfileHeader 
                 profile={profile} 
                 onEdit={(type: any) => setModalType(type as ModalType)} 
                 uploadAvatar={uploadAvatarPhoto}
                 uploadCover={uploadCoverPhoto}
               />
               <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
             </div>

             <div className="max-w-[1100px] mx-auto px-4 sm:px-6 mt-10 flex flex-col lg:flex-row gap-10 items-start">
               
               <ProfileSidebar 
                 profile={profile} 
                 openModal={(type: ModalType) => setModalType(type)} 
                 userEmail={userEmail}
                 onDeleteProfile={profile ? handleDeleteInvestorProfile : undefined}
               />
               
               <div className="flex-1 min-w-0 flex flex-col gap-10 w-full">
                 <div className="w-full mb-2 flex flex-col gap-4">
                      {!profileLoading && !profile && (
                        <div className="bg-gradient-to-r from-[#2e7d32] to-[#1c2b1e] text-white p-6 rounded-[32px] shadow-xl shadow-emerald-900/10 flex items-center justify-between animate-in slide-in-from-top-4 duration-700">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white ring-1 ring-white/30">
                              <Rocket size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                              <h4 className="text-[16px] font-black tracking-tight uppercase tracking-widest leading-none mb-1">¡Casi listo para invertir!</h4>
                              <p className="text-emerald-100/80 text-[13px] font-medium leading-tight">Completa tu información principal para poder realizar tu primera inversión.</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setModalType('profile')}
                            className="bg-white text-[#2e7d32] px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95 shadow-lg border-none cursor-pointer"
                          >
                            Completar Ahora
                          </button>
                        </div>
                      )}

                      {error && (
                        <div className="bg-red-50 text-[#c62828] p-5 rounded-[24px] text-[14px] font-bold border border-red-100 shadow-sm flex items-center gap-3">
                          <AlertCircle size={20} strokeWidth={2.5} /> {error}
                        </div>
                      )}
                      {successMessage && (
                        <div className="bg-emerald-50 text-[#2e7d32] p-5 rounded-[24px] text-[14px] font-bold border border-emerald-100 shadow-sm flex items-center gap-3">
                          <CheckCircle2 size={20} strokeWidth={2.5} /> {successMessage}
                        </div>
                      )}
                 </div>

                 {activeTab === 'portfolio' ? (
                   <InvestmentsFeed capitalData={capitalData} capitalLoading={capitalLoading} />
                 ) : activeTab === 'info' ? (
                   <div className="flex flex-col gap-8">
                      <section className="bg-white rounded-[32px] border border-emerald-50 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center"><User size={20} strokeWidth={2.5} /></div>
                            <h3 className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest">Datos Personales</h3>
                          </div>
                          <button onClick={() => setModalType('profile')} className="text-[#2e7d32] font-black uppercase text-[12px] cursor-pointer hover:underline border-none bg-transparent">Editar</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Nombre Completo</p><p className="font-bold text-[#1c2b1e]">{profile?.firstName} {profile?.lastName}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Nombre Público</p><p className="font-bold text-[#2e7d32]">@{profile?.displayName || 'No definido'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Tipo de Inversor</p><p className="font-bold text-[#2e7d32] flex items-center gap-2"><Shield size={14} /> {profile?.investorType ? INVESTOR_TYPE_LABELS[profile.investorType] : '-'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Tax ID</p><p className="font-bold text-[#1c2b1e]">{profile?.taxId || '-'}</p></div>
                          <div className="md:col-span-2"><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Biografía</p><p className="text-slate-600 leading-relaxed">{profile?.bio || 'Sin biografía.'}</p></div>
                        </div>
                      </section>

                      <section className="bg-white rounded-[32px] border border-emerald-50 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center"><MapPin size={20} strokeWidth={2.5} /></div>
                            <h3 className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest">Ubicación</h3>
                          </div>
                          <button onClick={() => setModalType('address')} className="text-[#2e7d32] font-black uppercase text-[12px] cursor-pointer hover:underline border-none bg-transparent">Editar</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">País</p><p className="font-bold text-[#1c2b1e]">{profile?.country || '-'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Estado / Ciudad</p><p className="font-bold text-[#1c2b1e]">{profile?.state || '-'}, {profile?.city || '-'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Dirección Principal</p><p className="font-bold text-[#1c2b1e]">{profile?.addressLine1 || '-'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Complemento</p><p className="font-bold text-[#1c2b1e]">{profile?.addressLine2 || '-'}</p></div>
                        </div>
                      </section>

                      <section className="bg-white rounded-[32px] border border-emerald-50 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center"><Target size={20} strokeWidth={2.5} /></div>
                            <h3 className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest">Preferencias de Inversión</h3>
                          </div>
                          <button onClick={() => setModalType('investment')} className="text-[#2e7d32] font-black uppercase text-[12px] cursor-pointer hover:underline border-none bg-transparent">Editar</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Inversión Mínima</p><p className="font-bold text-[#1c2b1e]">{profile?.minInvestment ? `$${profile.minInvestment.toLocaleString()}` : '-'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Capacidad Máxima</p><p className="font-bold text-[#1c2b1e]">{profile?.maxInvestment ? `$${profile.maxInvestment.toLocaleString()}` : '-'}</p></div>
                          {profile?.preferredCategories && profile.preferredCategories.length > 0 && (
                            <div className="md:col-span-2">
                              <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-3">Sectores de Interés</p>
                              <div className="flex flex-wrap gap-2">
                                {profile.preferredCategories.map((cat, i) => (
                                  <span key={i} className="bg-emerald-50 text-[#2e7d32] border border-emerald-100 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider">{cat}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </section>
                   </div>
                  ) : activeTab === 'capital' ? (
                    <InvestmentsFeed capitalData={capitalData} capitalLoading={capitalLoading} />
                  ) : (
                    <div className="bg-white rounded-[50px] shadow-sm border border-emerald-50 p-12 text-center text-slate-400 py-32 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50"></div>
                       <div className="text-emerald-100 mb-6 flex justify-center">
                          {activeTab === 'conversations' ? <MessageSquare size={80} strokeWidth={1} /> : <FolderOpen size={80} strokeWidth={1} />}
                       </div>
                       <h3 className="text-2xl font-black text-[#1c2b1e] tracking-tight mb-3 uppercase tracking-widest">
                         {activeTab === 'conversations' ? 'Centro de Conversaciones' : 'Módulo en Desarrollo'}
                       </h3>
                       <p className="max-w-md mx-auto text-[15px] font-medium leading-relaxed text-slate-500">
                         {activeTab === 'conversations' 
                           ? 'Módulo de comunicación directa con emprendedores encriptado. Se activará tras tu primera inversión.'
                           : 'Este módulo estará disponible próximamente para fortalecer la transparencia de tu dossier.'
                         }
                       </p>
                    </div>
                  )}
               </div>
             </div>
           </>
        )}
      </main>

      <EditProfileModal 
        type={modalType} profile={profile} saving={saving}
        onClose={() => setModalType(null)} onSave={handleSave}
      />
    </div>
  );
}
