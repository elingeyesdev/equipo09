import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateCampaignDto, CampaignType } from '../types/campaign.types';
import type { Category } from '../types/category.types';
import { getCategories } from '../api/categories.api';
import { AlertCircle, Save, X } from 'lucide-react';

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
  onSuccess: (dto: CreateCampaignDto) => Promise<boolean>;
  onCancel: () => void;
  saving: boolean;
  saveError: string | null;
}

export function CampaignForm({ onSuccess, onCancel, saving, saveError }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      shortDescription: '',
      goalAmount: 1000,
      campaignType: 'reward',
      categoryId: '',
      endDate: '',
    },
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

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

  const onSubmit = async (data: FormValues) => {
    const dto: CreateCampaignDto = {
      title: data.title,
      description: data.description,
      shortDescription: data.shortDescription || undefined,
      categoryId: data.categoryId,
      goalAmount: data.goalAmount,
      campaignType: data.campaignType as CampaignType,
      endDate: data.endDate || undefined,
    };

    const success = await onSuccess(dto);
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
        <h2 className="text-2xl font-black text-[#1c2b1e] tracking-tight mb-2 leading-none">Lanzar nueva campaña</h2>
        <p className="text-[14px] font-medium text-slate-400">Completa los datos esenciales para presentar tu idea al mundo con solidez financiera.</p>
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
            className="w-full md:w-auto bg-[#2e7d32] hover:bg-[#1c2b1e] text-white font-black px-12 py-3.5 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-500/20 border-none cursor-pointer text-[14px] flex items-center justify-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Publicando...
              </>
            ) : (
              <>
                <Save size={18} strokeWidth={2.5} />
                Guardar Borrador
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
