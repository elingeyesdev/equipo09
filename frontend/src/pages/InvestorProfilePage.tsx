import { useInvestorProfile } from '../hooks/useInvestorProfile';
import { InvestorProfileForm } from '../components/InvestorProfileForm';
import { Navbar } from '../components/Navbar';
import { User, AlertTriangle, CheckCircle2, Trash2 } from 'lucide-react';

export function InvestorProfilePage() {
  const userEmail = localStorage.getItem('userEmail') ?? '';
  const {
    profile,
    loading,
    saving,
    error,
    successMessage,
    isNewProfile,
    submitProfile,
    deleteProfile,
  } = useInvestorProfile();

  const handleDeleteInvestorProfile = async () => {
    const ok = window.confirm(
      '¿Eliminar tu perfil de inversor? Tu cuenta seguirá activa. No es posible si ya tienes inversiones registradas.',
    );
    if (!ok) return;
    await deleteProfile();
  };

  // Iniciales del avatar
  const initials = profile
    ? `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase()
    : userEmail[0]?.toUpperCase() ?? '?';

  return (
    <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
      <Navbar />

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 py-12">

        {/* Profile header - Green Financial Theme */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="w-24 h-24 rounded-[32px] bg-gradient-to-tr from-[#2e7d32] to-[#00897b] flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-emerald-500/20 shrink-0">
             {initials}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-black text-[#1c2b1e] tracking-tight mb-2 leading-none">
              {profile
                ? `${profile.firstName} ${profile.lastName}`
                : 'Expediente de Inversor'}
            </h1>
            <p className="text-[15px] font-medium text-slate-500 italic">
              {profile?.displayName ?? 'Gestiona tu identidad y límites de capital con solidez financiera.'}
            </p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border shrink-0 flex items-center gap-2
            ${isNewProfile 
              ? 'bg-amber-50 text-[#f9a825] border-amber-200' 
              : 'bg-emerald-50 text-[#2e7d32] border-emerald-200'
            }
          `}>
            {isNewProfile ? (
              <>
                <User size={12} strokeWidth={3} />
                Perfil Pendiente
              </>
            ) : (
              <>
                <CheckCircle2 size={12} strokeWidth={3} />
                Inversor Activo
              </>
            )}
          </div>
        </div>

        {/* Alerts */}
        {(error || successMessage) && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
            {error && (
              <div className="bg-red-50 border border-red-100 text-[#c62828] p-5 rounded-2xl text-[14px] font-bold flex items-center gap-3 shadow-sm shadow-red-900/5">
                <AlertTriangle size={20} strokeWidth={2.5} />
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-100 text-[#2e7d32] p-5 rounded-2xl text-[14px] font-bold flex items-center gap-3 shadow-sm shadow-emerald-900/5">
                <CheckCircle2 size={20} strokeWidth={2.5} />
                {successMessage}
              </div>
            )}
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-emerald-900/5 border border-emerald-50 relative overflow-hidden">
          {/* Subtle background pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          
          {loading ? (
            <div className="py-40 flex flex-col items-center justify-center gap-6">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-[#2e7d32] rounded-full animate-spin" />
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Sincronizando Dossier...</span>
            </div>
          ) : (
            <InvestorProfileForm
              profile={profile}
              saving={saving}
              isNew={isNewProfile}
              onSubmit={submitProfile}
            />
          )}
        </div>

        {!loading && profile && (
          <div className="mt-8 rounded-[28px] p-6 md:p-8 border border-red-100 bg-red-50/40 shadow-sm">
            <p className="text-[11px] font-black text-red-800 uppercase tracking-widest mb-2">Zona de riesgo</p>
            <p className="text-[14px] text-red-900/80 font-medium leading-relaxed mb-4">
              Elimina solo tu perfil de inversor. Tu usuario y sesión siguen activos. No está permitido si ya registraste inversiones en la plataforma.
            </p>
            <button
              type="button"
              onClick={() => void handleDeleteInvestorProfile()}
              disabled={saving}
              className="px-6 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest bg-white border border-red-200 text-red-700 hover:bg-red-50 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Trash2 size={16} strokeWidth={2.5} />
              Eliminar perfil inversor
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
