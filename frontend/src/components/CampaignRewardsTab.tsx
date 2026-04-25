import { useState, useEffect } from 'react';
import { getRewardTiers, createRewardTier, updateRewardTier, deleteRewardTier, getRewardClaims } from '../api/campaign.api';
import type { RewardTier, CreateRewardTierDto, UpdateRewardTierDto, RewardClaim } from '../types/campaign.types';
import { 
  Gem, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Calendar, 
  Save, 
  X,
  AlertCircle,
  Loader2,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { formatCampaignCurrency } from '../utils/campaignFunding';

interface Props {
  campaignId: string;
  currency: string;
}

export function CampaignRewardsTab({ campaignId, currency }: Props) {
  const [tiers, setTiers] = useState<RewardTier[]>([]);
  const [claims, setClaims] = useState<RewardClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState<string | null>(null); // 'new' for new tier, or tier.id
  const [formData, setFormData] = useState<Partial<CreateRewardTierDto>>({});
  const [submitting, setSubmitting] = useState(false);
  const [showClaims, setShowClaims] = useState(false);

  useEffect(() => {
    loadData();
  }, [campaignId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tiersData, claimsData] = await Promise.all([
        getRewardTiers(campaignId),
        getRewardClaims(campaignId)
      ]);
      setTiers(tiersData);
      setClaims(claimsData);
    } catch (err: any) {
      console.error(err);
      setError('Error al cargar la información de recompensas.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsEditing('new');
    setFormData({
      title: '',
      description: '',
      amount: 10,
      currency: currency,
      maxClaims: null,
      isActive: true,
      items: []
    } as any);
  };

  const handleEdit = (tier: RewardTier) => {
    setIsEditing(tier.id);
    setFormData({
      title: tier.title,
      description: tier.description,
      amount: tier.amount,
      currency: tier.currency,
      maxClaims: tier.maxClaims,
      estimatedDelivery: tier.estimatedDelivery ? new Date(tier.estimatedDelivery).toISOString().slice(0, 16) : undefined,
      isActive: tier.isActive,
      items: tier.items || []
    } as any);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este nivel de recompensa?')) return;
    try {
      await deleteRewardTier(campaignId, id);
      setTiers(tiers.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al eliminar. Puede que ya tenga reclamos, en ese caso debes desactivarla.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.amount) {
      alert('Por favor completa todos los campos requeridos (*)');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Clean up maxClaims if empty string
      const payload: any = { ...formData };
      if (payload.maxClaims === '' || payload.maxClaims === 0) payload.maxClaims = null;
      if (typeof payload.maxClaims === 'string') payload.maxClaims = parseInt(payload.maxClaims, 10);
      
      if (isEditing === 'new') {
        const newTier = await createRewardTier(campaignId, payload as CreateRewardTierDto);
        setTiers([...tiers, newTier]);
      } else {
        const updatedTier = await updateRewardTier(campaignId, isEditing!, payload as UpdateRewardTierDto);
        setTiers(tiers.map(t => t.id === updatedTier.id ? updatedTier : t));
      }
      setIsEditing(null);
      setFormData({});
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error al guardar el nivel de recompensa.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Cargando niveles de recompensa...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center">
        <p className="text-red-600 font-bold">{error}</p>
        <button onClick={loadData} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold">
          Reintentar
        </button>
      </div>
    );
  }

  const inputClass = "w-full border-gray-200 border-[1.5px] rounded-xl px-4 py-3 text-[14px] outline-none transition-all bg-gray-50/50 focus:bg-white focus:border-[#2e7d32] focus:ring-4 focus:ring-emerald-500/10 placeholder:text-gray-400 font-medium";
  const labelClass = "text-[11px] font-black text-slate-500 mb-2 block uppercase tracking-wider ml-1";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-['Sora',sans-serif]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 text-amber-500 mb-2">
            <Gem size={20} strokeWidth={2.5} />
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em]">Gestión de Recompensas</h3>
          </div>
          <p className="text-slate-500 text-[14px] font-medium max-w-md">
            Define niveles de aportación y los beneficios que ofrecerás a tus inversores.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={handleAddNew}
            className="bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-black px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 border-none cursor-pointer text-[13px] flex items-center justify-center gap-2"
          >
            <Plus size={16} strokeWidth={3} />
            Nuevo Nivel
          </button>
        )}
      </div>

      {/* Formulario */}
      {isEditing && (
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-emerald-900/5 border border-emerald-50 relative animate-in fade-in zoom-in-95 duration-300">
          <h3 className="text-xl font-black text-[#1c2b1e] mb-6">
            {isEditing === 'new' ? 'Crear Nivel de Recompensa' : 'Editar Nivel'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Título *</label>
                <input 
                  type="text" 
                  required 
                  className={inputClass}
                  value={formData.title || ''}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="Ej. Bronce, Plata, Acceso Anticipado..."
                />
              </div>
              <div>
                <label className={labelClass}>Monto Mínimo ({currency}) *</label>
                <input 
                  type="number" 
                  required 
                  min="1"
                  className={inputClass}
                  value={formData.amount || ''}
                  onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  placeholder="Ej. 50"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>Descripción y Beneficios *</label>
                <textarea 
                  required 
                  rows={3}
                  className={`${inputClass} resize-none`}
                  value={formData.description || ''}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe qué incluye esta recompensa..."
                />
              </div>
              <div>
                <label className={labelClass}>Stock Disponible (Opcional)</label>
                <input 
                  type="number" 
                  min="1"
                  className={inputClass}
                  value={formData.maxClaims === null ? '' : formData.maxClaims}
                  onChange={e => setFormData({...formData, maxClaims: e.target.value ? parseInt(e.target.value) : null})}
                  placeholder="Dejar vacío para ilimitado"
                />
              </div>
              <div>
                <label className={labelClass}>Fecha de Entrega Estimada (Opcional)</label>
                <input 
                  type="datetime-local" 
                  className={inputClass}
                  value={formData.estimatedDelivery || ''}
                  onChange={e => setFormData({...formData, estimatedDelivery: e.target.value})}
                />
              </div>
              {isEditing !== 'new' && (
                <div className="md:col-span-2 flex items-center gap-3 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={formData.isActive}
                    onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    className="w-5 h-5 accent-[#2e7d32]"
                  />
                  <div>
                    <label htmlFor="isActive" className="text-[14px] font-black text-slate-800 cursor-pointer">Recompensa Activa</label>
                    <p className="text-[12px] text-slate-500">Si desmarcas esta opción, la recompensa dejará de estar visible para nuevos inversores.</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setIsEditing(null)}
                className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#2e7d32] text-white font-black hover:bg-[#1c2b1e] transition-colors flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                {isEditing === 'new' ? 'Crear Recompensa' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Recompensas */}
      {!isEditing && tiers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tiers.map(tier => (
            <div key={tier.id} className={`bg-white rounded-[28px] border-2 p-6 transition-all ${tier.isActive ? 'border-emerald-50 hover:border-emerald-200 shadow-sm hover:shadow-xl' : 'border-slate-100 opacity-60'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-[#1c2b1e]">
                    ${tier.amount.toLocaleString()}
                  </span>
                  {!tier.isActive && (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">
                      Inactiva
                    </span>
                  )}
                  {tier.isActive && tier.maxClaims !== null && tier.currentClaims >= tier.maxClaims && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest flex items-center gap-1">
                      <Lock size={10} /> Agotada
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(tier)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-emerald-100 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors">
                    <Edit2 size={14} strokeWidth={2.5} />
                  </button>
                  <button onClick={() => handleDelete(tier.id)} className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-100 text-slate-400 hover:text-red-600 flex items-center justify-center transition-colors">
                    <Trash2 size={14} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
              <h4 className="text-[16px] font-black text-[#1c2b1e] mb-2">{tier.title}</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed mb-6 line-clamp-3">
                {tier.description}
              </p>
              
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 bg-slate-50 px-4 py-3 rounded-xl">
                <div className="flex items-center gap-1.5">
                  <Users size={14} strokeWidth={2.5} className="text-[#2e7d32]" />
                  <span className="text-slate-700">{tier.currentClaims}</span>
                  <span>/ {tier.maxClaims === null ? '∞' : tier.maxClaims} reclamos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isEditing && tiers.length === 0 && (
         <div className="col-span-full py-16 text-center bg-white border-2 border-dashed border-emerald-100 rounded-[32px]">
           <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4">
             <Gem size={32} />
           </div>
           <h4 className="text-slate-900 font-black text-lg mb-2">No tienes recompensas</h4>
           <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">
             Añade niveles de recompensa para incentivar a tus inversores a aportar más capital.
           </p>
           <button
             onClick={handleAddNew}
             className="bg-[#2e7d32] text-white font-black px-6 py-3 rounded-xl transition-all shadow-lg hover:bg-[#1c2b1e]"
           >
             Crear Primer Nivel
           </button>
         </div>
      )}

      {/* Sección de Reclamos (Inversores que obtuvieron recompensa) */}
      {!isEditing && claims.length > 0 && (
        <div className="mt-12 pt-8 border-t border-slate-200">
          <button 
            onClick={() => setShowClaims(!showClaims)}
            className="w-full flex items-center justify-between bg-white border border-slate-200 p-6 rounded-[24px] hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Users size={20} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <h4 className="text-[15px] font-black text-slate-800">Inversores con Recompensas ({claims.length})</h4>
                <p className="text-[12px] text-slate-500 font-medium">Ver listado de personas que reclamaron un nivel</p>
              </div>
            </div>
            {showClaims ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
          </button>

          {showClaims && (
            <div className="mt-4 bg-white rounded-[24px] border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px]">
                    <tr>
                      <th className="px-6 py-4">Inversor</th>
                      <th className="px-6 py-4">Recompensa</th>
                      <th className="px-6 py-4">Monto Aportado</th>
                      <th className="px-6 py-4">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {claims.map((claim) => (
                      <tr key={claim.investment_id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{claim.first_name} {claim.last_name}</div>
                          <div className="text-slate-500 text-[11px]">{claim.investor_email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 font-bold px-3 py-1.5 rounded-lg text-[11px]">
                            <Gem size={12} strokeWidth={2.5} />
                            {claim.reward_title}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-700">
                          {formatCampaignCurrency(claim.amount, currency)}
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-[12px]">
                          {new Date(claim.invested_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
