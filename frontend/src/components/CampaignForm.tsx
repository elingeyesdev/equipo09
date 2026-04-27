import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Save, X, Plus, Trash2, Gem, Edit2 } from 'lucide-react';
import type { CreateRewardTierDto, EntrepreneurCampaign, CreateCampaignDto, CampaignType } from '../types/campaign.types';
import type { Category } from '../types/category.types';
import { getCategories } from '../api/categories.api';
import { getImageUrl } from '../utils/image.utils';

const schema = z.object({
  title: z.string().min(5, 'El título debe tener mínimo 5 caracteres').max(255),
  description: z.string().min(20, 'Describe tu proyecto más detalladamente').max(5000),
  shortDescription: z.string().max(500).optional().or(z.literal('')),
  goalAmount: z.number().min(100, 'La meta mínima es $100'),
  campaignType: z.enum(['donation', 'reward', 'equity']),
  categoryId: z.string().min(1, 'Debes seleccionar una categoría principal'),
  endDate: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  initialData?: EntrepreneurCampaign | null;
  onSuccess: (dto: CreateCampaignDto, coverFile?: File) => Promise<boolean>;
  onCancel: () => void;
  saving: boolean;
  saveError: string | null;
}

export function CampaignForm({ initialData, onSuccess, onCancel, saving, saveError }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      shortDescription: initialData?.shortDescription || '',
      goalAmount: initialData?.goalAmount || 1000,
      campaignType: initialData?.campaignType || 'reward',
      categoryId: initialData?.categoryId || '',
      endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    },
  });

  const campaignType = watch('campaignType');
  const goalAmount = watch('goalAmount') || 1000;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(getImageUrl(initialData?.coverImageUrl) || null);
  
  const [rewards, setRewards] = useState<CreateRewardTierDto[]>([]);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingRewardIndex, setEditingRewardIndex] = useState<number | null>(null);
  const [rewardData, setRewardData] = useState<CreateRewardTierDto>({
    title: '',
    description: '',
    amount: 10,
    maxClaims: 10
  });

  // Sync rewards when editing
  useEffect(() => {
    if (initialData?.rewardTiers) {
      console.log('CampaignForm: Loading rewards from initialData', initialData.rewardTiers);
      setRewards(initialData.rewardTiers.map(rt => ({
        title: rt.title,
        description: rt.description,
        amount: rt.amount,
        maxClaims: rt.maxClaims ?? 0
      })));
    } else {
      setRewards([]);
    }
  }, [initialData]);

  const totalRewardsValue = rewards.reduce((sum, r) => sum + (r.amount * (r.maxClaims || 0)), 0);
  const progressPercentage = Math.min(100, (totalRewardsValue / goalAmount) * 100);
  const isRewardsComplete = totalRewardsValue === goalAmount;

  useEffect(() => {
    let mounted = true;
    getCategories()
      .then((data) => {
        if (mounted) setCategories(data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setLoadingCats(false);
      });
    return () => { mounted = false; };
  }, []);

  // Sincronizar valores cuando se cargan las categorías o cambia initialData
  useEffect(() => {
    if (!loadingCats && initialData) {
      reset({
        title: initialData.title || '',
        description: initialData.description || '',
        shortDescription: initialData.shortDescription || '',
        goalAmount: initialData.goalAmount || 1000,
        campaignType: initialData.campaignType || 'reward',
        categoryId: initialData.categoryId || '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
      });
    }
  }, [loadingCats, initialData, reset]);

  const addReward = () => {
    // Basic validation: title and description required, amount > 0
    if (!rewardData.title || !rewardData.description || rewardData.amount <= 0) {
      alert('Por favor completa el título, descripción y un monto válido.');
      return;
    }

    // maxClaims validation: only if it's not meant to be infinite (0/null)
    // For now, let's assume if it's 0 it's invalid unless we want to support infinite.
    if ((rewardData.maxClaims || 0) < 0) {
      alert('El stock no puede ser negativo.');
      return;
    }

    if (editingRewardIndex !== null) {
      const updated = [...rewards];
      updated[editingRewardIndex] = { ...rewardData };
      setRewards(updated);
      setEditingRewardIndex(null);
    } else {
      setRewards([...rewards, { ...rewardData }]);
    }
    
    setRewardData({ title: '', description: '', amount: 10, maxClaims: 10 });
    setShowRewardForm(false);
  };

  const editRewardItem = (index: number) => {
    setRewardData({ ...rewards[index] });
    setEditingRewardIndex(index);
    setShowRewardForm(true);
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormValues) => {
    const dto: CreateCampaignDto = {
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription || undefined,
      categoryId: data.categoryId,
      goalAmount: data.goalAmount,
      campaignType: data.campaignType as CampaignType,
      endDate: data.endDate || undefined,
      rewards: data.campaignType === 'reward' ? rewards : undefined
    };

    const success = await onSuccess(dto, coverFile || undefined);
    if (success) {
      onCancel();
    }
  };

  const inputClass = "w-full border-gray-200 border-[1.5px] rounded-xl px-4 py-3 text-[15px] outline-none transition-all bg-gray-50/50 focus:bg-white focus:border-[#2e7d32] focus:ring-4 focus:ring-emerald-500/10 placeholder:text-gray-400 font-medium";
  const labelClass = "text-[12px] font-black text-slate-500 mb-2 block uppercase tracking-wider ml-1";
  const errorClass = "border-[#c62828] focus:border-[#c62828] focus:ring-red-500/10 bg-red-50 focus:bg-red-50";

  return (
    <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-emerald-900/5 border border-emerald-50 animate-in fade-in zoom-in-95 duration-500 font-['Sora',sans-serif]">
      <div className="mb-10">
        <h2 className="text-2xl font-black text-[#1c2b1e] tracking-tight mb-2 leading-none">
          {initialData ? 'Actualizar campaña' : 'Lanzar nueva campaña'}
        </h2>
        <p className="text-[14px] font-medium text-slate-400">
          {initialData 
            ? 'Ajusta los detalles de tu propuesta para cumplir con los requisitos de auditoría.' 
            : 'Completa los datos esenciales para presentar tu idea al mundo con solidez financiera.'}
        </p>
      </div>

      {saveError && (
        <div className="bg-red-50 border border-red-100 text-[#c62828] p-5 rounded-2xl text-[14px] font-bold mb-8 flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
           <AlertCircle size={20} strokeWidth={2.5} />
           {saveError}
        </div>
      )}

      <form className="flex flex-col gap-8" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-col">
          <label htmlFor="title" className={labelClass}>Título de la Campaña <span className="text-[#c62828] font-bold">*</span></label>
          <input
            id="title"
            type="text"
            placeholder="E.g. Botellas de agua reusables del océano"
            className={`${inputClass} ${errors.title ? errorClass : ''}`}
            {...register('title')}
          />
          {errors.title && <span className="text-[11px] font-bold text-[#c62828] mt-2 ml-1">{errors.title.message}</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <label htmlFor="campaignType" className={labelClass}>Incentivo de Financiación <span className="text-[#c62828] font-bold">*</span></label>
            <div className="relative">
              <select
                id="campaignType"
                className={`${inputClass} cursor-pointer appearance-none bg-no-repeat ${errors.campaignType ? errorClass : ''}`}
                {...register('campaignType')}
              >
                <option value="reward">Con Recompensa (Reward)</option>
                <option value="donation">Donación (Donation)</option>
                <option value="equity">Participación (Equity)</option>
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <Save size={14} className="rotate-90" />
              </div>
            </div>
            {errors.campaignType && <span className="text-[11px] font-bold text-[#c62828] mt-2 ml-1">{errors.campaignType.message}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="categoryId" className={labelClass}>Categoría Principal <span className="text-[#c62828] font-bold">*</span></label>
            <select
              id="categoryId"
              className={`${inputClass} cursor-pointer ${errors.categoryId ? errorClass : ''}`}
              disabled={loadingCats}
              {...register('categoryId')}
            >
              <option value="">Selecciona una categoría...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.displayName}</option>
              ))}
            </select>
            {errors.categoryId && <span className="text-[11px] font-bold text-[#c62828] mt-2 ml-1">{errors.categoryId.message}</span>}
          </div>

          <div className="flex flex-col">
            <label htmlFor="goalAmount" className={labelClass}>Meta de Recaudación (USD) <span className="text-[#c62828] font-bold">*</span></label>
            <input
              id="goalAmount"
              type="number"
              placeholder="10000"
              min="100"
              className={`${inputClass} ${errors.goalAmount ? errorClass : ''}`}
              {...register('goalAmount', { valueAsNumber: true })}
            />
            {errors.goalAmount && <span className="text-[11px] font-bold text-[#c62828] mt-2 ml-1">{String(errors.goalAmount.message)}</span>}
          </div>

          <div className="flex flex-col md:col-span-2">
            <label htmlFor="shortDescription" className={labelClass}>Eslogan / Frase corta</label>
            <input
              id="shortDescription"
              type="text"
              placeholder="Una frase impactante que defina tu proyecto"
              className={inputClass}
              {...register('shortDescription')}
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="endDate" className={labelClass}>Fecha de Cierre (Opcional)</label>
            <input
              id="endDate"
              type="datetime-local"
              className={inputClass}
              {...register('endDate')}
            />
          </div>

          <div className="flex flex-col md:col-span-3">
            <label className={labelClass}>Imagen de Portada</label>
            <div 
              className={`relative h-[200px] rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer ${coverPreview ? 'border-[#2e7d32] bg-emerald-50/10' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30'}`}
              onClick={() => document.getElementById('cover-upload')?.click()}
            >
              {coverPreview ? (
                <img src={coverPreview} className="w-full h-full object-cover" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                    <Save size={24} className="text-slate-300" />
                  </div>
                  <p className="text-[13px] font-bold">Seleccionar imagen de portada</p>
                  <p className="text-[11px]">Recomendado: 1200x600px (JPG, PNG)</p>
                </div>
              )}
              <input 
                id="cover-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              {coverPreview && (
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="bg-white text-[#1c2b1e] px-4 py-2 rounded-lg text-[12px] font-black uppercase tracking-widest">Cambiar Imagen</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:col-span-3">
            <label htmlFor="description" className={labelClass}>Propuesta de Valor en Detalle <span className="text-[#c62828] font-bold">*</span></label>
            <textarea
              id="description"
              placeholder="Cuenta tu historia, el origen de tu idea y cómo planeas usar el capital..."
              rows={6}
              className={`${inputClass} resize-none ${errors.description ? errorClass : ''}`}
              {...register('description')}
            />
            {errors.description && <span className="text-[11px] font-bold text-[#c62828] mt-2 ml-1">{errors.description.message}</span>}
          </div>
        </div>

        {/* Reward Management Section */}
        {campaignType === 'reward' && (
          <div className="bg-slate-50/50 rounded-3xl p-6 md:p-8 border border-emerald-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h3 className="text-lg font-black text-[#1c2b1e] tracking-tight mb-1 flex items-center gap-2">
                  <Gem size={20} className="text-amber-500" />
                  Estructura de Recompensas
                </h3>
                <p className="text-[13px] text-slate-500 font-medium">
                  Define cómo se divide tu meta de <span className="font-bold text-[#2e7d32]">${goalAmount}</span> en beneficios para tus inversores.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRewardForm(true)}
                className="bg-white hover:bg-emerald-50 text-[#2e7d32] font-black px-6 py-2.5 rounded-xl border border-emerald-100 shadow-sm transition-all active:scale-95 flex items-center gap-2 text-[13px]"
              >
                <Plus size={16} strokeWidth={3} />
                Agregar Nivel
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Valor Asignado</span>
                <span className={`text-[13px] font-black ${isRewardsComplete ? 'text-[#2e7d32]' : 'text-slate-900'}`}>
                  ${totalRewardsValue} 
                  <span className="text-slate-400 font-medium"> / ${goalAmount}</span>
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                <div 
                  className={`h-full transition-all duration-500 ${isRewardsComplete ? 'bg-[#2e7d32]' : totalRewardsValue > goalAmount ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {totalRewardsValue > goalAmount && (
                <p className="text-[11px] font-bold text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Has superado la meta de la campaña. Ajusta los montos o el stock.
                </p>
              )}
              {!isRewardsComplete && totalRewardsValue < goalAmount && (
                <p className="text-[11px] font-bold text-amber-600 mt-2">
                  Faltan ${(goalAmount - totalRewardsValue)} para completar la meta.
                </p>
              )}
            </div>

            {/* Rewards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.length === 0 ? (
                <div className="md:col-span-2 py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/50">
                  <p className="text-slate-400 font-medium text-[14px]">No has definido recompensas aún.</p>
                </div>
              ) : (
                rewards.map((r, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start group">
                    <div>
                      <h4 className="font-black text-[#1c2b1e] text-[15px] mb-1">{r.title}</h4>
                      <p className="text-[12px] text-slate-500 font-medium mb-3 line-clamp-1">{r.description}</p>
                      <div className="flex gap-4">
                        <div className="text-[11px] font-black text-[#2e7d32] bg-emerald-50 px-2 py-1 rounded-md uppercase">
                          ${r.amount} / u
                        </div>
                        <div className="text-[11px] font-black text-slate-500 bg-slate-100 px-2 py-1 rounded-md uppercase">
                          Stock: {r.maxClaims}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => editRewardItem(idx)}
                        className="p-2 text-slate-300 hover:text-emerald-600 transition-colors"
                        title="Editar Nivel"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeReward(idx)}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                        title="Eliminar Nivel"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reward Add Form (Modal/Overlay style) */}
            {showRewardForm && (
              <div className="fixed inset-0 bg-[#1c2b1e]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-300">
                  <h4 className="text-xl font-black text-[#1c2b1e] mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      {editingRewardIndex !== null ? <Edit2 size={20} className="text-[#2e7d32]" /> : <Plus size={20} className="text-[#2e7d32]" />}
                    </div>
                    {editingRewardIndex !== null ? 'Editar Nivel' : 'Nuevo Nivel'}
                  </h4>
                  
                  <div className="space-y-5">
                    <div>
                      <label className={labelClass}>Título *</label>
                      <input 
                        type="text" 
                        className={inputClass}
                        value={rewardData.title}
                        onChange={e => setRewardData({...rewardData, title: e.target.value})}
                        placeholder="Ej. Acceso Anticipado"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Descripción *</label>
                      <textarea 
                        className={`${inputClass} resize-none`}
                        rows={3}
                        value={rewardData.description}
                        onChange={e => setRewardData({...rewardData, description: e.target.value})}
                        placeholder="Qué incluye este beneficio..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Monto Unitario ($) *</label>
                        <input 
                          type="number" 
                          className={inputClass}
                          value={rewardData.amount}
                          onChange={e => setRewardData({...rewardData, amount: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Stock (Personas) *</label>
                        <input 
                          type="number" 
                          className={inputClass}
                          value={rewardData.maxClaims || 0}
                          onChange={e => setRewardData({...rewardData, maxClaims: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        setShowRewardForm(false);
                        setEditingRewardIndex(null);
                        setRewardData({ title: '', description: '', amount: 10, maxClaims: 10 });
                      }}
                      className="flex-1 px-6 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-[14px] active:scale-95 transition-all"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={addReward}
                      className="flex-1 px-6 py-3 rounded-xl bg-[#2e7d32] text-white font-black text-[14px] active:scale-95 transition-all"
                    >
                      {editingRewardIndex !== null ? 'Guardar Cambios' : 'Agregar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-end items-center gap-4 mt-8 pt-8 border-t border-emerald-50">
          <button
            type="button"
            className="w-full md:w-auto bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-[#c62828] font-bold px-8 py-3.5 rounded-xl transition-all border-none active:scale-95 cursor-pointer text-[14px] flex items-center justify-center gap-2"
            onClick={onCancel}
            disabled={saving}
          >
            <X size={18} strokeWidth={2.5} />
            Descartar Cambios
          </button>
          <button
            type="submit"
            disabled={saving || (campaignType === 'reward' && !isRewardsComplete)}
            className="w-full md:w-auto bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-black px-12 py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 border-none cursor-pointer text-[14px] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {initialData ? 'Guardando...' : 'Publicando...'}
              </>
            ) : (
              <>
                <Save size={18} strokeWidth={2.5} />
                {initialData ? 'Actualizar Datos' : 'Guardar Borrador'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
