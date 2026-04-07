import { useState, useEffect } from 'react';
import { useEntrepreneurProfile } from '../hooks/useEntrepreneurProfile';
import { useCampaigns } from '../hooks/useCampaigns';
import { Navbar } from '../components/Navbar';

import { ProfileHeader } from '../components/entrepreneur-profile/ProfileHeader';
import { ProfileTabs } from '../components/entrepreneur-profile/ProfileTabs';
import { ProfileSidebar } from '../components/entrepreneur-profile/ProfileSidebar';
import { CampaignsFeed } from '../components/entrepreneur-profile/CampaignsFeed';
import { EditProfileModal } from '../components/entrepreneur-profile/EditProfileModal';
import { NewCampaignFAB } from '../components/entrepreneur-profile/NewCampaignFAB';
import { CampaignPreviewModal } from '../components/CampaignPreviewModal';
import { 
  FolderOpen, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  MessageSquare, 
  User, 
  Building2, 
  MapPin, 
  CreditCard,
  Globe,
  ExternalLink,
  Rocket,
  Wallet
} from 'lucide-react';

type ModalType = 'profile' | 'personal' | 'company' | 'address' | 'banking' | 'avatar' | 'new-campaign' | null;

export function EntrepreneurProfilePage() {
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
  } = useEntrepreneurProfile();

  const handleDeleteEntrepreneurProfile = async () => {
    const ok = window.confirm(
      '¿Eliminar tu perfil de emprendedor? Tu cuenta seguirá activa. No es posible si ya tienes campañas registradas en la plataforma.',
    );
    if (!ok) return;
    await deleteProfile();
  };

  const {
    campaigns,
    loading: campaignsLoading,
    error: campaignsError,
    addCampaign,
    uploadCampaignImage,
  } = useCampaigns();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [onboardingTriggered, setOnboardingTriggered] = useState(false);

  const userEmail = localStorage.getItem('userEmail') ?? '';

  // Auto-onboarding: Abrir modal si el perfil está vacío por primera vez
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
    if (type === 'new-campaign') {
      // El módulo `campaigns` valida goalAmount con @Min(100) y categoryId es opcional (fallback en BD).
      const goal = Number(data.goalAmount);
      const minGoal = 100;
      await addCampaign({
        title: (data.title || 'Nueva Campaña').trim(),
        description: (data.description || '').trim() || 'Descripción pendiente.',
        goalAmount:
          Number.isFinite(goal) && goal >= minGoal ? goal : minGoal,
        campaignType: 'donation',
      });
    } else {
      // Filtrar el payload para enviar solo campos permitidos por el DTO
      const baseData = { ...profile, ...data };
      
      // Si es un perfil nuevo, necesitamos asegurar firstName y lastName (campos obligatorios en DTO)
      if (!profile) {
        if (!baseData.firstName) baseData.firstName = 'Usuario';
        if (!baseData.lastName) baseData.lastName = 'Sin Registrar';
      }

      const {
        id,
        userId,
        avatarUrl,
        coverUrl,
        identityVerified,
        identityVerifiedAt,
        verificationDocuments,
        totalCampaigns,
        totalRaised,
        rating,
        createdAt,
        updatedAt,
        ...sanitizedData
      } = baseData;
      
      await submitProfile(sanitizedData);
    }
    setModalType(null);
  };

  const error = profileError || campaignsError;

  return (
    <div className="min-h-screen font-sans bg-[#f4f7f4] flex flex-col font-['Sora',sans-serif]">
      <Navbar />

      <main className="flex-1 w-full relative z-0 pb-20">
        
        {profileLoading ? (
           <div className="max-w-[1100px] mx-auto p-40 flex flex-col items-center justify-center gap-6">
             <Loader2 className="w-14 h-14 text-[#2e7d32] animate-spin" strokeWidth={2.5} />
             <p className="text-slate-400 font-black uppercase tracking-widest text-[11px]">Sincronizando Dossier Corporativo...</p>
           </div>
        ) : (
           <>
             {/* HEADER & TABS */}
             <div className="bg-white shadow-sm">
               <ProfileHeader 
                 profile={profile} 
                 onEdit={(type: any) => setModalType(type as ModalType)} 
                 uploadAvatar={uploadAvatarPhoto}
                 uploadCover={uploadCoverPhoto}
               />
               <ProfileTabs 
                 activeTab={activeTab} 
                 setActiveTab={setActiveTab} 
               />
             </div>

             {/* MAIN GRID */}
             <div className="max-w-[1100px] mx-auto px-4 sm:px-6 mt-10 flex flex-col lg:flex-row gap-10 items-start">
               
               <ProfileSidebar 
                 profile={profile} 
                 openModal={(type: ModalType) => setModalType(type)} 
                 userEmail={userEmail}
                 onDeleteProfile={profile ? handleDeleteEntrepreneurProfile : undefined}
               />
               
               <div className="flex-1 min-w-0 flex flex-col gap-10 w-full">
                 {/* Mensajes de Estado y Onboarding */}
                 <div className="w-full mb-2 flex flex-col gap-4">
                      {!profileLoading && !profile && (
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white p-6 rounded-[32px] shadow-xl shadow-emerald-900/10 flex items-center justify-between animate-in slide-in-from-top-4 duration-700">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white ring-1 ring-white/30">
                              <Rocket size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                              <h4 className="text-[16px] font-black tracking-tight uppercase tracking-widest leading-none mb-1">¡Casi listo para emprender!</h4>
                              <p className="text-emerald-100/80 text-[13px] font-medium leading-tight">Completa tu información principal para poder publicar tu primera campaña.</p>
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
                          <AlertCircle size={20} strokeWidth={2.5} />
                          {error}
                        </div>
                      )}
                      {successMessage && (
                        <div className="bg-emerald-50 text-[#2e7d32] p-5 rounded-[24px] text-[14px] font-bold border border-emerald-100 shadow-sm flex items-center gap-3">
                          <CheckCircle2 size={20} strokeWidth={2.5} />
                          {successMessage}
                        </div>
                      )}
                 </div>

                 {activeTab === 'campaigns' ? (
                   <CampaignsFeed 
                     openModal={(type: ModalType) => setModalType(type)} 
                     hasBanking={!!profile?.bankAccountNumber}
                     campaigns={campaigns}
                     loading={campaignsLoading}
                     onCampaignClick={(campaign) => {
                       setSelectedCampaign(campaign);
                       setPreviewOpen(true);
                     }}
                   />
                 ) : activeTab === 'info' ? (
                   <div className="flex flex-col gap-8">
                      {/* Personal */}
                      <section className="bg-white rounded-[32px] border border-emerald-50 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center">
                              <User size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest">Datos Personales</h3>
                          </div>
                          <button onClick={() => setModalType('profile')} className="text-[#2e7d32] font-black uppercase text-[12px] cursor-pointer hover:underline border-none bg-transparent">Editar</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Nombre Completo</p><p className="font-bold text-[#1c2b1e]">{profile?.firstName} {profile?.lastName}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Nombre Público</p><p className="font-bold text-[#2e7d32]">@{profile?.displayName || 'No definido'}</p></div>
                          <div className="md:col-span-2"><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">LinkedIn</p><p className="font-bold text-[#2e7d32] flex items-center gap-2"><ExternalLink size={14} /> {profile?.linkedinUrl || '-'}</p></div>
                          <div className="md:col-span-2"><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Biografía</p><p className="text-slate-600 leading-relaxed">{profile?.bio || 'Sin biografía.'}</p></div>
                        </div>
                      </section>

                      {/* Company */}
                      <section className="bg-white rounded-[32px] border border-emerald-50 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center">
                              <Building2 size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest">Startup & Site</h3>
                          </div>
                          <button onClick={() => setModalType('company')} className="text-[#2e7d32] font-black uppercase text-[12px] cursor-pointer hover:underline border-none bg-transparent">Editar</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Nombre de Empresa</p><p className="font-bold text-[#1c2b1e]">{profile?.companyName || '-'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Sitio Web</p><p className="font-bold text-[#2e7d32] flex items-center gap-2"><Globe size={14} /> {profile?.website || '-'}</p></div>
                        </div>
                      </section>

                      {/* Location */}
                      <section className="bg-white rounded-[32px] border border-emerald-50 p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center">
                              <MapPin size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest">Ubicación</h3>
                          </div>
                          <button onClick={() => setModalType('address')} className="text-[#2e7d32] font-black uppercase text-[12px] cursor-pointer hover:underline border-none bg-transparent">Editar</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">País</p><p className="font-bold text-[#1c2b1e]">{profile?.country || '-'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Estado / Ciudad</p><p className="font-bold text-[#1c2b1e]">{profile?.state}, {profile?.city}</p></div>
                          <div className="md:col-span-2"><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Dirección</p><p className="font-bold text-[#1c2b1e]">{profile?.addressLine || '-'}</p></div>
                        </div>
                      </section>

                      {/* Banking */}
                      <section className="bg-white rounded-[32px] border border-emerald-50 p-8 shadow-sm text-center md:text-left">
                        <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center">
                              <CreditCard size={20} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest">Canal de Fondos</h3>
                          </div>
                          <button onClick={() => setModalType('banking')} className="text-[#2e7d32] font-black uppercase text-[12px] cursor-pointer hover:underline border-none bg-transparent">Editar</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Banco</p><p className="font-bold text-[#1c2b1e]">{profile?.bankName || '-'}</p></div>
                          <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Cuenta</p><p className="font-bold text-[#1c2b1e] tracking-widest">{profile?.bankAccountNumber ? `**** **** ${profile.bankAccountNumber.slice(-4)}` : '-'}</p></div>
                        </div>
                      </section>
                   </div>
                  ) : activeTab === 'banking' ? (
                    <div className="flex flex-col gap-8">
                       {/* Banking */}
                       <section className="bg-white rounded-[32px] border border-emerald-50 p-8 shadow-sm text-center md:text-left">
                         <div className="flex justify-between items-center mb-6">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-emerald-50 text-[#2e7d32] rounded-xl flex items-center justify-center">
                               <CreditCard size={20} strokeWidth={2.5} />
                             </div>
                             <h3 className="text-[15px] font-black text-[#1c2b1e] uppercase tracking-widest">Canal de Fondos</h3>
                           </div>
                           <button onClick={() => setModalType('banking')} className="text-[#2e7d32] font-black uppercase text-[12px] cursor-pointer hover:underline border-none bg-transparent">Editar</button>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[14px]">
                           <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Banco</p><p className="font-bold text-[#1c2b1e]">{profile?.bankName || '-'}</p></div>
                           <div><p className="text-slate-400 font-black uppercase text-[10px] tracking-widest mb-1">Cuenta</p><p className="font-bold text-[#1c2b1e] tracking-widest">{profile?.bankAccountNumber ? `**** **** ${profile.bankAccountNumber.slice(-4)}` : '-'}</p></div>
                         </div>
                       </section>
                    </div>
                  ) : (
                    <div className="bg-white rounded-[50px] shadow-sm border border-emerald-50 p-12 text-center text-slate-400 py-32 relative overflow-hidden">
                       <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50"></div>
                       <div className="text-emerald-100 mb-6 flex justify-center">
                          {activeTab === 'conversations' ? (
                            <MessageSquare size={80} strokeWidth={1} />
                          ) : activeTab === 'finance' ? (
                            <Wallet size={80} strokeWidth={1} />
                          ) : (
                            <FolderOpen size={80} strokeWidth={1} />
                          )}
                       </div>
                       <h3 className="text-2xl font-black text-[#1c2b1e] tracking-tight mb-3 uppercase tracking-widest">
                         {activeTab === 'conversations' 
                           ? 'Centro de Conversaciones' 
                           : activeTab === 'finance'
                             ? 'Gestión Financiera'
                             : 'Módulo en Desarrollo'
                         }
                       </h3>
                       <p className="max-w-md mx-auto text-[15px] font-medium leading-relaxed text-slate-500">
                         {activeTab === 'conversations' 
                           ? 'Módulo de comunicación directa con inversores encriptado. Se activará tras tu primera campaña publicada.'
                           : activeTab === 'finance'
                             ? 'Seguimiento de ingresos, retiros y reportes fiscales de tus campañas. Disponible próximamente.'
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

      {/* Acciones Rápidas */}
      <NewCampaignFAB openModal={(type: ModalType) => setModalType(type)} />

      {/* Modales */}
      <EditProfileModal 
        type={modalType} 
        profile={profile}
        saving={saving}
        onClose={() => setModalType(null)}
        onSave={handleSave}
      />

      <CampaignPreviewModal 
        open={previewOpen} 
        campaign={selectedCampaign} 
        onClose={() => {
          setPreviewOpen(false);
          setSelectedCampaign(null);
        }} 
        onUploadImage={uploadCampaignImage}
      />
      
    </div>
  );
}
