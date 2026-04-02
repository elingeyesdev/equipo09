import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import type { EntrepreneurProfile } from '../types/entrepreneur.types';

const requiredUrl = z
  .string()
  .min(1, 'La URL es requerida')
  .max(512, 'Máximo 512 caracteres')
  .refine(
    (v) => /^https?:\/\/.+/.test(v),
    { message: 'Debe ser una URL válida (ej. https://...)' },
  );

const schema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  displayName: z.string().max(150, 'Máximo 150 caracteres').optional().or(z.literal('')),
  bio: z
    .string()
    .min(30, 'La biografía debe tener al menos 30 caracteres')
    .max(2000, 'Máximo 2000 caracteres'),
  companyName: z.string().min(2, 'Mínimo 2 caracteres').max(200, 'Máximo 200 caracteres'),
  website: requiredUrl,
  linkedinUrl: requiredUrl,
  addressLine: z.string().max(255, 'Máximo 255 caracteres').optional().or(z.literal('')),
  city: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  state: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  country: z.string().min(1, 'El país es requerido').max(100, 'Máximo 100 caracteres'),
  postalCode: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  bankAccountNumber: z.string().max(100, 'Máximo 100 caracteres').optional().or(z.literal('')),
  bankName: z.string().max(200, 'Máximo 200 caracteres').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profile: EntrepreneurProfile | null;
  saving: boolean;
  isNew: boolean;
  onSubmit: (data: FormValues) => void;
}

const EMPTY_VALUES: FormValues = {
  firstName: '', lastName: '', displayName: '', bio: '',
  companyName: '', website: '', linkedinUrl: '',
  addressLine: '', city: '', state: '', country: '', postalCode: '',
  bankAccountNumber: '', bankName: '',
};

export function EntrepreneurProfileForm({ profile, saving, isNew, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        displayName: profile.displayName ?? '',
        bio: profile.bio ?? '',
        companyName: profile.companyName ?? '',
        website: profile.website ?? '',
        linkedinUrl: profile.linkedinUrl ?? '',
        addressLine: profile.addressLine ?? '',
        city: profile.city ?? '',
        state: profile.state ?? '',
        country: profile.country ?? '',
        postalCode: profile.postalCode ?? '',
        bankAccountNumber: profile.bankAccountNumber ?? '',
        bankName: profile.bankName ?? '',
      });
    }
  }, [profile, reset]);

  return (
    <form className="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-section">
        <div className="section-title">👤 Datos personales</div>
        <div className="form-grid">

          <div className="form-group">
            <label htmlFor="ep-firstName">
              Nombre <span className="required">*</span>
            </label>
            <input
              id="ep-firstName"
              type="text"
              placeholder="Carlos"
              className={errors.firstName ? 'error-field' : ''}
              {...register('firstName')}
            />
            {errors.firstName && (
              <span className="field-error">{errors.firstName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="ep-lastName">
              Apellido <span className="required">*</span>
            </label>
            <input
              id="ep-lastName"
              type="text"
              placeholder="Mendoza"
              className={errors.lastName ? 'error-field' : ''}
              {...register('lastName')}
            />
            {errors.lastName && (
              <span className="field-error">{errors.lastName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="ep-displayName">Nombre público</label>
            <input
              id="ep-displayName"
              type="text"
              placeholder="Carlos M."
              {...register('displayName')}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="ep-bio">Biografía</label>
            <textarea
              id="ep-bio"
              placeholder="Emprendedor apasionado por la tecnología y la innovación social..."
              {...register('bio')}
            />
            {errors.bio && (
              <span className="field-error">{errors.bio.message}</span>
            )}
          </div>
        </div>
      </div>
      <div className="form-section">
        <div className="section-title">🏢 Información del negocio</div>
        <div className="form-grid">

          <div className="form-group">
            <label htmlFor="ep-companyName">
              Nombre de la empresa <span className="required">*</span>
            </label>
            <input
              id="ep-companyName"
              type="text"
              placeholder="TechVentures SRL"
              className={errors.companyName ? 'error-field' : ''}
              {...register('companyName')}
            />
            {errors.companyName && (
              <span className="field-error">{errors.companyName.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="ep-website">Sitio web <span className="required">*</span></label>
            <input
              id="ep-website"
              type="url"
              placeholder="https://techventures.com"
              className={errors.website ? 'error-field' : ''}
              {...register('website')}
            />
            {errors.website && (
              <span className="field-error">{errors.website.message}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="ep-linkedinUrl">LinkedIn <span className="required">*</span></label>
            <input
              id="ep-linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/tu-perfil"
              className={errors.linkedinUrl ? 'error-field' : ''}
              {...register('linkedinUrl')}
            />
            {errors.linkedinUrl && (
              <span className="field-error">{errors.linkedinUrl.message}</span>
            )}
          </div>
        </div>
      </div>
      <div className="form-section">
        <div className="section-title">📍 Dirección</div>
        <div className="form-grid">

          <div className="form-group full-width">
            <label htmlFor="ep-addressLine">Dirección</label>
            <input
              id="ep-addressLine"
              type="text"
              placeholder="Calle 100 #15-20"
              {...register('addressLine')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ep-city">Ciudad</label>
            <input id="ep-city" type="text" placeholder="Bogotá" {...register('city')} />
          </div>

          <div className="form-group">
            <label htmlFor="ep-state">Departamento / Estado</label>
            <input id="ep-state" type="text" placeholder="Cundinamarca" {...register('state')} />
          </div>

          <div className="form-group">
            <label htmlFor="ep-country">País</label>
            <input id="ep-country" type="text" placeholder="Colombia" {...register('country')} />
          </div>

          <div className="form-group">
            <label htmlFor="ep-postalCode">Código postal</label>
            <input id="ep-postalCode" type="text" placeholder="110111" {...register('postalCode')} />
          </div>
        </div>
      </div>
      <div className="form-section">
        <div className="section-title">🏦 Datos bancarios</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="ep-bankName">Nombre del banco</label>
            <input
              id="ep-bankName"
              type="text"
              placeholder="Banco Nacional"
              {...register('bankName')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="ep-bankAccountNumber">Número de cuenta</label>
            <input
              id="ep-bankAccountNumber"
              type="text"
              placeholder="0012345678"
              {...register('bankAccountNumber')}
            />
          </div>
        </div>
      </div>
      <div className="form-actions">
        {!isNew && (
          <button
            type="button"
            id="btn-reset-entrepreneur"
            className="btn btn-ghost"
            onClick={() => reset()}
            disabled={saving || !isDirty}
          >
            Descartar cambios
          </button>
        )}
        <button
          type="submit"
          id="btn-save-entrepreneur"
          className="btn btn-primary"
          disabled={saving || (!isNew && !isDirty)}
        >
          {saving ? (
            <>
              <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
              Guardando...
            </>
          ) : (
            isNew ? '✦ Crear perfil' : '✦ Guardar cambios'
          )}
        </button>
      </div>
    </form>
  );
}
