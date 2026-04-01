import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CreateCampaignDto, CampaignType } from '../types/campaign.types';
import type { Category } from '../types/category.types';
import { getCategories } from '../api/categories.api';

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

  return (
    <div className="card campaign-form-card fade-in">
      <h2>Lanzar nueva campaña</h2>
      <p className="text-muted">Completa los datos esenciales para presentar tu idea al mundo.</p>

      {saveError && (
        <div className="alert-error" style={{ marginBottom: '1.5rem' }}>
          {saveError}
        </div>
      )}

      <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-group full-width">
          <label htmlFor="title">Título de la Campaña <span className="required">*</span></label>
          <input
            id="title"
            type="text"
            placeholder="E.g. Botellas de agua reusables del océano"
            className={errors.title ? 'error-field' : ''}
            {...register('title')}
          />
          {errors.title && <span className="field-error">{errors.title.message}</span>}
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="campaignType">Tipo de Financiación <span className="required">*</span></label>
            <select
              id="campaignType"
              className={errors.campaignType ? 'error-field' : ''}
              {...register('campaignType')}
            >
              <option value="reward">Con Recompensa (Reward)</option>
              <option value="donation">Donación (Donation)</option>
              <option value="equity">Participación (Equity)</option>
            </select>
            {errors.campaignType && <span className="field-error">{errors.campaignType.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">Categoría del Proyecto <span className="required">*</span></label>
            <select
              id="categoryId"
              className={errors.categoryId ? 'error-field' : ''}
              disabled={loadingCats}
              {...register('categoryId')}
            >
              <option value="">Selecciona una categoría...</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            {errors.categoryId && <span className="field-error">{errors.categoryId.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="goalAmount">Meta Económica (USD) <span className="required">*</span></label>
            <input
              id="goalAmount"
              type="number"
              placeholder="10000"
              min="100"
              className={errors.goalAmount ? 'error-field' : ''}
              {...register('goalAmount', { valueAsNumber: true })}
            />
            {errors.goalAmount && <span className="field-error">{errors.goalAmount.message?.toString()}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="shortDescription">Resumen corto (Opcional)</label>
            <input
              id="shortDescription"
              type="text"
              placeholder="Una frase llamativa de tu proyecto"
              {...register('shortDescription')}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Historia / Descripción en detalle <span className="required">*</span></label>
            <textarea
              id="description"
              placeholder="Cuenta tu historia, por qué necesitas inversión, en qué la gastarás..."
              rows={5}
              className={errors.description ? 'error-field' : ''}
              {...register('description')}
            />
            {errors.description && <span className="field-error">{errors.description.message}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="endDate">Fecha límite de la meta (Opcional)</label>
            <input
              id="endDate"
              type="datetime-local"
              {...register('endDate')}
            />
          </div>
        </div>

        <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Creando...
              </>
            ) : (
              'Publicar Borrador'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
