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

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.coverImageUrl || null);

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
