import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useCampaignDetail } from '../hooks/useCampaignDetail';
import { Navbar } from '../components/Navbar';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  Calendar,
  Target,
  Heart,
  Gem,
  Rocket,
  AlertCircle,
  RefreshCw,
  Clock,
  DollarSign,
  ArrowUpRight,
  User,
} from 'lucide-react';

const CAMPAIGN_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  donation: { label: 'Donación', icon: Heart, color: '#e91e63' },
  reward: { label: 'Recompensa', icon: Gem, color: '#f9a825' },
  equity: { label: 'Equity', icon: TrendingUp, color: '#2e7d32' },
};

/* ───────────────────────────────────────────────── */
/*  SKELETON LOADING                                 */
/* ───────────────────────────────────────────────── */

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 py-8 animate-pulse">
        {/* Back button skeleton */}
        <div className="h-5 w-44 bg-slate-200 rounded-full mb-8" />

        {/* Hero image skeleton */}
        <div className="h-[380px] md:h-[440px] bg-slate-200 rounded-[28px] mb-10" />

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content skeleton */}
          <div className="flex-1 space-y-6">
            <div className="flex gap-3 mb-4">
              <div className="w-24 h-7 bg-slate-200 rounded-xl" />
              <div className="w-20 h-7 bg-slate-200 rounded-xl" />
            </div>
            <div className="h-9 bg-slate-200 rounded-full w-[80%]" />
            <div className="h-5 bg-slate-100 rounded-full w-[50%]" />
            <div className="space-y-3 pt-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-4 bg-slate-100 rounded-full" style={{ width: `${90 - i * 8}%` }} />
              ))}
            </div>
            {/* Entrepreneur section skeleton */}
            <div className="mt-10 pt-8 border-t border-slate-100 space-y-4">
              <div className="h-6 w-48 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-slate-200 rounded-full" />
                  <div className="h-3 w-24 bg-slate-100 rounded-full" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded-full w-full" />
                <div className="h-4 bg-slate-100 rounded-full w-[70%]" />
              </div>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-[28px] p-8 space-y-6 shadow-sm border border-emerald-50">
              <div className="h-8 bg-slate-200 rounded-full w-[60%]" />
              <div className="h-3 bg-slate-100 rounded-full w-full" />
              <div className="h-4 bg-slate-200 rounded-full w-[40%]" />
              <div className="space-y-4 pt-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-28 bg-slate-100 rounded-full" />
                    <div className="h-4 w-20 bg-slate-200 rounded-full" />
                  </div>
                ))}
              </div>
              <div className="h-14 bg-slate-200 rounded-2xl mt-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────── */
/*  MAIN PAGE                                        */
/* ───────────────────────────────────────────────── */

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { campaign, loading, error, retry } = useCampaignDetail(id);

  // Determine where to go back — preserve filter state
  const backUrl = (location.state as any)?.from || '/explore';

  const handleGoBack = () => {
    navigate(backUrl);
  };

  /* ── Loading ── */
  if (loading) return <DetailSkeleton />;

  /* ── Error ── */
  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
        <Navbar />
        <div className="max-w-[600px] mx-auto px-6 py-32 text-center">
          <div className="bg-white rounded-[28px] p-10 shadow-sm border border-red-100">
            <AlertCircle size={48} className="text-red-400 mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-2xl font-black text-[#1c2b1e] mb-3 tracking-tight">
              {error === 'Campaña no encontrada o no está publicada'
                ? 'Campaña No Encontrada'
                : 'Error al Cargar'}
            </h2>
            <p className="text-slate-500 font-medium text-[15px] mb-8 leading-relaxed">
              {error || 'No se pudo obtener la información de esta campaña.'}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleGoBack}
                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-black text-[13px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 cursor-pointer border-none"
              >
                ← Volver al Portal
              </button>
              <button
                onClick={retry}
                className="px-6 py-3 rounded-xl bg-[#2e7d32] text-white font-black text-[13px] uppercase tracking-widest hover:bg-[#256b29] transition-all active:scale-95 cursor-pointer border-none flex items-center gap-2"
              >
                <RefreshCw size={14} strokeWidth={3} />
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Computed values ── */
  const progress = campaign.goalAmount > 0
    ? Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100)
    : 0;

  let daysRemaining: number | null = null;
  if (campaign.endDate) {
    const ms = new Date(campaign.endDate).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const typeInfo = CAMPAIGN_TYPE_LABELS[campaign.campaignType] || CAMPAIGN_TYPE_LABELS.donation;
  const TypeIcon = typeInfo.icon;

  return (
    <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-6 py-8">
        {/* ── Back button ── */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-slate-500 hover:text-[#2e7d32] font-bold text-[13px] uppercase tracking-widest mb-8 transition-colors cursor-pointer bg-transparent border-none group"
        >
          <ArrowLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
          Regresar al Portal
        </button>

        {/* ── Hero Image ── */}
        <div className="relative h-[320px] md:h-[440px] rounded-[28px] overflow-hidden shadow-xl shadow-black/5 mb-10">
          {campaign.coverImageUrl ? (
            <img
              src={campaign.coverImageUrl}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1c2b1e] via-[#2e7d32] to-[#1c2b1e] flex items-center justify-center">
              <Rocket size={80} strokeWidth={0.8} className="text-white/10" />
            </div>
          )}

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-6 left-6 flex gap-3">
            <span className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-[11px] font-black text-[#1c2b1e] uppercase tracking-widest shadow-sm">
              {campaign.categoryName}
            </span>
            <span
              className="px-4 py-2 rounded-xl text-[11px] font-black text-white uppercase tracking-widest shadow-sm flex items-center gap-1.5"
              style={{ backgroundColor: typeInfo.color }}
            >
              <TypeIcon size={13} strokeWidth={3} />
              {typeInfo.label}
            </span>
          </div>

          {/* Progress bar at bottom of hero */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
            <div
              className="h-full transition-all duration-1000 ease-out"
              style={{
                width: `${progress}%`,
                background: progress >= 100
                  ? 'linear-gradient(90deg, #f9a825, #ff6f00)'
                  : 'linear-gradient(90deg, #a5d6a7, #2e7d32)',
              }}
            />
          </div>
        </div>

        {/* ── Content + Sidebar ── */}
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0">
            {/* Title block */}
            <h1 className="text-3xl md:text-4xl font-black text-[#1c2b1e] tracking-tight leading-tight mb-3">
              {campaign.title}
            </h1>
            {campaign.subtitle && (
              <p className="text-[17px] text-slate-500 font-medium leading-relaxed mb-6">
                {campaign.subtitle}
              </p>
            )}

            {/* Entrepreneur mini banner */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1c2b1e] to-[#2e7d32] flex items-center justify-center text-white text-[12px] font-black overflow-hidden shrink-0">
                {campaign.entrepreneurAvatar ? (
                  <img src={campaign.entrepreneurAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  campaign.entrepreneurName?.charAt(0)?.toUpperCase() || '?'
                )}
              </div>
              <div>
                <p className="text-[13px] font-bold text-slate-600">
                  por{' '}
                  <span className="text-[#2e7d32]">
                    {campaign.entrepreneurDisplayName
                      ? `@${campaign.entrepreneurDisplayName}`
                      : campaign.entrepreneurName}
                  </span>
                </p>
              </div>
            </div>

            {/* Description — Campaign Story */}
            <div className="bg-white rounded-[28px] shadow-sm border border-emerald-50 p-8 md:p-10 mb-8">
              <h2 className="text-xl font-black text-[#1c2b1e] tracking-tight mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Target size={20} strokeWidth={2.5} className="text-[#2e7d32]" />
                </div>
                Historia del Proyecto
              </h2>
              <div className="text-[15px] text-slate-600 leading-[1.9] whitespace-pre-wrap">
                {campaign.description || 'Este emprendedor aún no ha agregado una descripción detallada de su campaña.'}
              </div>
            </div>

            {/* Entrepreneur Bio Section */}
            <div className="bg-white rounded-[28px] shadow-sm border border-emerald-50 p-8 md:p-10">
              <h2 className="text-xl font-black text-[#1c2b1e] tracking-tight mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <User size={20} strokeWidth={2.5} className="text-[#2e7d32]" />
                </div>
                Sobre el Emprendedor
              </h2>

              <div className="flex items-start gap-5">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#1c2b1e] to-[#2e7d32] flex items-center justify-center text-white text-2xl font-black overflow-hidden shrink-0 shadow-lg shadow-emerald-500/10">
                  {campaign.entrepreneurAvatar ? (
                    <img src={campaign.entrepreneurAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    campaign.entrepreneurName?.charAt(0)?.toUpperCase() || '?'
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-black text-[#1c2b1e] mb-1 tracking-tight">
                    {campaign.entrepreneurName}
                  </h3>
                  {campaign.entrepreneurDisplayName && (
                    <p className="text-[13px] text-[#2e7d32] font-bold mb-4">
                      @{campaign.entrepreneurDisplayName}
                    </p>
                  )}
                  <p className="text-[15px] text-slate-500 leading-[1.8] whitespace-pre-wrap">
                    {campaign.entrepreneurBio || 'Este emprendedor aún no ha agregado su biografía.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="lg:sticky lg:top-8 space-y-6">

              {/* Investment Card */}
              <div className="bg-white rounded-[28px] shadow-lg shadow-emerald-500/5 border border-emerald-50 p-8">
                {/* Raised Amount */}
                <div className="mb-6">
                  <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">
                    Recaudado
                  </p>
                  <p className="text-4xl font-black text-[#1c2b1e] tracking-tighter">
                    ${campaign.currentAmount.toLocaleString()}
                    <span className="text-[14px] font-bold text-slate-400 ml-2">
                      {campaign.currency || 'USD'}
                    </span>
                  </p>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${progress}%`,
                        background: progress >= 100
                          ? 'linear-gradient(90deg, #f9a825, #ff6f00)'
                          : 'linear-gradient(90deg, #a5d6a7, #2e7d32)',
                        boxShadow: '0 0 8px rgba(46,125,50,0.3)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-[13px] font-black text-[#2e7d32]">
                      {progress}%
                    </span>
                    <span className="text-[13px] font-bold text-slate-400">
                      Meta: ${campaign.goalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-[#f4f7f4] rounded-2xl p-4 text-center">
                    <Users size={20} strokeWidth={2} className="text-[#2e7d32] mx-auto mb-2" />
                    <p className="text-xl font-black text-[#1c2b1e]">{campaign.investorCount}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Inversores
                    </p>
                  </div>
                  <div className="bg-[#f4f7f4] rounded-2xl p-4 text-center">
                    <Calendar size={20} strokeWidth={2} className="text-[#2e7d32] mx-auto mb-2" />
                    <p className="text-xl font-black text-[#1c2b1e]">
                      {daysRemaining !== null
                        ? daysRemaining > 0 ? daysRemaining : 0
                        : '∞'}
                    </p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {daysRemaining !== null && daysRemaining <= 0 ? 'Finalizada' : 'Días restantes'}
                    </p>
                  </div>
                </div>

                {/* Investment details */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between py-3 border-b border-slate-50">
                    <span className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                      <DollarSign size={15} strokeWidth={2.5} className="text-slate-400" />
                      Inversión mínima
                    </span>
                    <span className="text-[14px] font-black text-[#1c2b1e]">
                      ${campaign.minInvestment?.toLocaleString() || '0'}
                    </span>
                  </div>

                  {campaign.maxInvestment && (
                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                        <ArrowUpRight size={15} strokeWidth={2.5} className="text-slate-400" />
                        Inversión máxima
                      </span>
                      <span className="text-[14px] font-black text-[#1c2b1e]">
                        ${campaign.maxInvestment.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {campaign.startDate && (
                    <div className="flex items-center justify-between py-3 border-b border-slate-50">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                        <Clock size={15} strokeWidth={2.5} className="text-slate-400" />
                        Fecha inicio
                      </span>
                      <span className="text-[14px] font-black text-[#1c2b1e]">
                        {new Date(campaign.startDate).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}

                  {campaign.endDate && (
                    <div className="flex items-center justify-between py-3">
                      <span className="flex items-center gap-2 text-[13px] font-bold text-slate-500">
                        <Calendar size={15} strokeWidth={2.5} className="text-slate-400" />
                        Fecha cierre
                      </span>
                      <span className="text-[14px] font-black text-[#1c2b1e]">
                        {new Date(campaign.endDate).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <button
                  className="w-full py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest transition-all active:scale-[0.97] cursor-pointer border-none shadow-lg"
                  style={{
                    background: daysRemaining !== null && daysRemaining <= 0
                      ? '#94a3b8'
                      : 'linear-gradient(135deg, #2e7d32, #1c2b1e)',
                    color: '#fff',
                    boxShadow: daysRemaining !== null && daysRemaining <= 0
                      ? 'none'
                      : '0 8px 24px rgba(46,125,50,0.3)',
                  }}
                  disabled={daysRemaining !== null && daysRemaining <= 0}
                >
                  {daysRemaining !== null && daysRemaining <= 0
                    ? 'Campaña Finalizada'
                    : 'Invertir en este Proyecto'}
                </button>

                {daysRemaining !== null && daysRemaining <= 0 ? null : (
                  <p className="text-[11px] text-slate-400 font-medium text-center mt-3 leading-relaxed">
                    Serás redirigido al formulario de inversión
                  </p>
                )}
              </div>

              {/* Campaign status card */}
              <div className="bg-white rounded-[28px] shadow-sm border border-emerald-50 p-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{
                      backgroundColor:
                        campaign.status === 'published' ? '#2e7d32'
                          : campaign.status === 'funded' ? '#f9a825'
                          : '#64748b',
                    }}
                  />
                  <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
                    {campaign.status === 'published' ? 'Campaña Activa'
                      : campaign.status === 'funded' ? 'Completamente Financiada'
                      : campaign.status === 'partially_funded' ? 'Parcialmente Financiada'
                      : campaign.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
