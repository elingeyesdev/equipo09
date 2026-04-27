import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePublicCampaigns } from '../hooks/usePublicCampaigns';
import { Navbar } from '../components/Navbar';
import { getImageUrl } from '../utils/image.utils';
import type { PublicCampaign } from '../api/public-campaigns.api';
import {
  Search,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Rocket,
  Target,
  Heart,
  Gem,
  FolderOpen,
} from 'lucide-react';

const CAMPAIGN_TYPE_LABELS: Record<string, { label: string; icon: any; color: string }> = {
  donation: { label: 'Donación', icon: Heart, color: '#e91e63' },
  reward: { label: 'Recompensa', icon: Gem, color: '#f9a825' },
  equity: { label: 'Equity', icon: TrendingUp, color: '#2e7d32' },
};

function CampaignCard({ campaign, onClick }: { campaign: PublicCampaign; onClick?: () => void }) {
  const progress = campaign.goalAmount > 0
    ? Math.min(Math.round((campaign.currentAmount / campaign.goalAmount) * 100), 100)
    : 0;


  const coverUrl = getImageUrl(campaign.coverImageUrl);
  const avatarUrl = getImageUrl(campaign.entrepreneurAvatar);

  let daysRemaining: number | null = null;
  if (campaign.endDate) {
    const ms = new Date(campaign.endDate).getTime() - Date.now();
    daysRemaining = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  const typeInfo = CAMPAIGN_TYPE_LABELS[campaign.campaignType] || CAMPAIGN_TYPE_LABELS.donation;
  const TypeIcon = typeInfo.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[28px] shadow-sm border border-emerald-50 overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer">

      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#1c2b1e] to-[#2e7d32] overflow-hidden">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Rocket size={48} strokeWidth={1} className="text-white/20" />
          </div>
        )}

        {/* Category Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl text-[10px] font-black text-[#1c2b1e] uppercase tracking-widest shadow-sm">
          {campaign.categoryName}
        </div>

        {/* Type Badge */}
        <div
          className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest shadow-sm flex items-center gap-1.5"
          style={{ backgroundColor: typeInfo.color }}
        >
          <TypeIcon size={12} strokeWidth={3} />
          {typeInfo.label}
        </div>

        {/* Progress overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
          <div
            className="h-full bg-white/90 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col gap-4">
        {/* Entrepreneur info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#1c2b1e] to-[#2e7d32] flex items-center justify-center text-white text-[10px] font-black overflow-hidden shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              campaign.entrepreneurName?.charAt(0)?.toUpperCase() || '?'
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-slate-700 truncate">
              {campaign.entrepreneurDisplayName
                ? `@${campaign.entrepreneurDisplayName}`
                : campaign.entrepreneurName}
            </p>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[16px] font-black text-[#1c2b1e] leading-tight line-clamp-2 group-hover:text-[#2e7d32] transition-colors">
          {campaign.title}
        </h3>

        {/* Description */}
        {campaign.shortDescription && (
          <p className="text-[13px] text-slate-500 leading-relaxed line-clamp-2 flex-1">
            {campaign.shortDescription}
          </p>
        )}

        {/* Progress bar */}
        <div>
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[20px] font-black text-[#1c2b1e] tracking-tight">
              ${campaign.currentAmount.toLocaleString()}
            </span>
            <span className="text-[12px] font-bold text-slate-400">
              de ${campaign.goalAmount.toLocaleString()}
            </span>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_6px_rgba(46,125,50,0.3)]"
              style={{
                width: `${progress}%`,
                background: progress >= 100
                  ? 'linear-gradient(90deg, #f9a825, #ff6f00)'
                  : 'linear-gradient(90deg, #a5d6a7, #2e7d32)',
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-[12px] text-slate-400 font-bold pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5">
            <Target size={13} strokeWidth={2.5} className="text-[#2e7d32]" />
            <span className="text-[#2e7d32] font-black">{progress}%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} strokeWidth={2.5} />
            <span>{campaign.investorCount} inversores</span>
          </div>
          {daysRemaining !== null && (
            <div className="flex items-center gap-1.5">
              <Calendar size={13} strokeWidth={2.5} />
              <span>{daysRemaining > 0 ? `${daysRemaining} días` : 'Finalizada'}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ExploreCampaignsPage() {
  const { campaigns, meta, loading, error, filters, updateFilters, goToPage } = usePublicCampaigns();
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleCardClick = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`, {
      state: { from: location.pathname + location.search },
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ q: searchInput || undefined });
  };

  const sortOptions = [
    { value: 'created_at:DESC', label: 'Más recientes' },
    { value: 'created_at:ASC', label: 'Más antiguas' },
    { value: 'current_amount:DESC', label: 'Mayor recaudación' },
    { value: 'goal_amount:ASC', label: 'Menor meta' },
    { value: 'goal_amount:DESC', label: 'Mayor meta' },
  ];

  const typeFilters = [
    { value: '', label: 'Todos' },
    { value: 'donation', label: 'Donación' },
    { value: 'reward', label: 'Recompensa' },
    { value: 'equity', label: 'Equity' },
  ];

  const currentSort = `${filters.sortBy || 'created_at'}:${filters.sortOrder || 'DESC'}`;

  return (
    <div className="min-h-screen bg-[#f4f7f4] font-['Sora',sans-serif]">
      <Navbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#1c2b1e] via-[#2e7d32] to-[#1c2b1e] relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[60%] bg-[#a5d6a7] rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[30%] h-[50%] bg-[#00897b] rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 py-16 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-none">
            Descubre Campañas con Impacto
          </h1>
          <p className="text-emerald-100/80 text-[16px] font-medium max-w-[600px] mx-auto mb-10 leading-relaxed">
            Explora proyectos innovadores de emprendedores bolivianos. Invierte en ideas que transforman comunidades.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-[640px] mx-auto flex gap-3">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={2.5} />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Buscar campañas por nombre, descripción..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/95 backdrop-blur-md border-none text-[15px] font-medium outline-none focus:ring-4 focus:ring-emerald-500/20 shadow-xl shadow-black/10 placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-white text-[#2e7d32] px-8 py-4 rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95 shadow-xl shadow-black/10 border-none cursor-pointer"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border-b border-emerald-50 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex flex-col sm:flex-row items-center gap-4">
          {/* Type filters */}
          <div className="flex items-center gap-2 flex-1 overflow-x-auto">
            <Filter size={16} className="text-slate-400 shrink-0" strokeWidth={2.5} />
            {typeFilters.map(tf => (
              <button
                key={tf.value}
                onClick={() => updateFilters({ campaignType: tf.value || undefined })}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-[12px] font-black uppercase tracking-widest border-none cursor-pointer transition-all active:scale-95 ${
                  (filters.campaignType || '') === tf.value
                    ? 'bg-[#2e7d32] text-white shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-[#2e7d32]'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown size={16} className="text-slate-400" strokeWidth={2.5} />
            <select
              value={currentSort}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split(':') as [any, any];
                updateFilters({ sortBy, sortOrder });
              }}
              className="bg-slate-50 border-none rounded-xl px-4 py-2.5 text-[12px] font-bold text-slate-600 outline-none cursor-pointer appearance-none pr-8 focus:ring-2 focus:ring-emerald-500/20"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Results count */}
          {meta && (
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest shrink-0">
              {meta.totalItems} campaña{meta.totalItems !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Grid */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-[28px] shadow-sm border border-emerald-50 overflow-hidden flex flex-col animate-pulse"
              >
                {/* Cover image skeleton */}
                <div className="h-48 bg-slate-200 relative">
                  <div className="absolute top-4 left-4 w-20 h-6 bg-slate-300 rounded-xl" />
                  <div className="absolute top-4 right-4 w-24 h-6 bg-slate-300 rounded-xl" />
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-300" />
                </div>

                {/* Content skeleton */}
                <div className="p-6 flex-1 flex flex-col gap-4">
                  {/* Entrepreneur avatar + name */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                    <div className="w-28 h-3 bg-slate-200 rounded-full" />
                  </div>

                  {/* Title */}
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded-full w-[85%]" />
                    <div className="h-4 bg-slate-200 rounded-full w-[55%]" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 flex-1">
                    <div className="h-3 bg-slate-100 rounded-full w-full" />
                    <div className="h-3 bg-slate-100 rounded-full w-[70%]" />
                  </div>

                  {/* Amount + progress bar */}
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="h-5 w-28 bg-slate-200 rounded-full" />
                      <div className="h-3 w-20 bg-slate-100 rounded-full" />
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-200 rounded-full w-[45%]" />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div className="h-3 w-14 bg-slate-200 rounded-full" />
                    <div className="h-3 w-24 bg-slate-100 rounded-full" />
                    <div className="h-3 w-16 bg-slate-100 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 rounded-[24px] p-6 text-center max-w-md mx-auto my-20 shadow-sm">
            <AlertCircle size={32} className="text-red-400 mx-auto mb-4" strokeWidth={2} />
            <p className="text-red-700 font-bold text-[15px]">{error}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="w-20 h-20 bg-white rounded-[28px] shadow-sm flex items-center justify-center text-emerald-200">
              <FolderOpen size={40} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-[#1c2b1e] tracking-tight uppercase">Sin Resultados</h3>
            <p className="text-slate-400 font-medium text-[15px] max-w-[360px] text-center leading-relaxed">
              No hay campañas que coincidan con tus filtros. Intenta con otra búsqueda o cambia los filtros.
            </p>
            <button
              onClick={() => {
                setSearchInput('');
                updateFilters({ q: undefined, campaignType: undefined, categoryId: undefined });
              }}
              className="text-[#2e7d32] font-black text-[13px] uppercase tracking-widest hover:underline cursor-pointer border-none bg-transparent"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {campaigns.map(campaign => (
                <CampaignCard key={campaign.id} campaign={campaign} onClick={() => handleCardClick(campaign.id)} />
              ))}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-14">
                <button
                  onClick={() => goToPage(meta.currentPage - 1)}
                  disabled={meta.currentPage <= 1}
                  className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-50 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-[#2e7d32] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none"
                >
                  <ChevronLeft size={20} strokeWidth={2.5} />
                </button>

                {Array.from({ length: meta.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === meta.totalPages || Math.abs(p - meta.currentPage) <= 2)
                  .map((page, idx, arr) => (
                    <span key={page} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== page - 1 && (
                        <span className="text-slate-300 font-bold px-1">…</span>
                      )}
                      <button
                        onClick={() => goToPage(page)}
                        className={`w-12 h-12 rounded-xl font-black text-[14px] transition-all active:scale-95 cursor-pointer border-none ${
                          page === meta.currentPage
                            ? 'bg-[#2e7d32] text-white shadow-lg shadow-emerald-500/20'
                            : 'bg-white text-slate-500 hover:bg-emerald-50 hover:text-[#2e7d32] shadow-sm'
                        }`}
                      >
                        {page}
                      </button>
                    </span>
                  ))}

                <button
                  onClick={() => goToPage(meta.currentPage + 1)}
                  disabled={meta.currentPage >= meta.totalPages}
                  className="w-12 h-12 bg-white rounded-xl shadow-sm border border-emerald-50 flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-[#2e7d32] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none"
                >
                  <ChevronRight size={20} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
