import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import type { InvestorProfile } from '../types/investor.types';
import { CategorySelector } from './CategorySelector';

// ── Esquema de validación (alineado con DTOs del backend) ──────────────────
const schema = z.object({
  firstName:    z.string().min(2, 'Mínimo 2 caracteres').max(100),
  lastName:     z.string().min(2, 'Mínimo 2 caracteres').max(100),
  displayName:  z.string().max(150).optional().or(z.literal('')),
  bio:          z.string().max(2000).optional().or(z.literal('')),
  investorType: z.enum(['individual', 'institutional', 'angel']).optional(),
  taxId:        z.string().max(50).optional().or(z.literal('')),
  addressLine1: z.string().max(255).optional().or(z.literal('')),
  addressLine2: z.string().max(255).optional().or(z.literal('')),
  city:         z.string().max(100).optional().or(z.literal('')),
  state:        z.string().max(100).optional().or(z.literal('')),
  country:      z.string().max(100).optional().or(z.literal('')),
  postalCode:   z.string().max(20).optional().or(z.literal('')),
  minInvestment: z.coerce.number().positive().optional().or(z.literal('' as any)),
  maxInvestment: z.coerce.number().positive().optional().or(z.literal('' as any)),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  profile: InvestorProfile | null;
  saving: boolean;
  isNew: boolean;
  onSubmit: (data: FormValues & { preferredCategories: string[] }) => void;
}

export function InvestorProfileForm({ profile, saving, isNew, onSubmit }: Props) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName:    '',
      lastName:     '',
      displayName:  '',
      bio:          '',
      investorType: 'individual',
      taxId:        '',
      addressLine1: '',
      addressLine2: '',
      city:         '',
      state:        '',
      country:      '',
      postalCode:   '',
      minInvestment: '' as any,
      maxInvestment: '' as any,
    },
  });

  // Pre-llenar formulario si ya existe perfil
  useEffect(() => {
    if (profile) {
      reset({
        firstName:    profile.firstName,
        lastName:     profile.lastName,
        displayName:  profile.displayName ?? '',
        bio:          profile.bio ?? '',
        investorType: profile.investorType,
        taxId:        profile.taxId ?? '',
        addressLine1: profile.addressLine1 ?? '',
        addressLine2: profile.addressLine2 ?? '',
        city:         profile.city ?? '',
        state:        profile.state ?? '',
        country:      profile.country ?? '',
        postalCode:   profile.postalCode ?? '',
        minInvestment: profile.minInvestment ?? ('' as any),
        maxInvestment: profile.maxInvestment ?? ('' as any),
      });
      // Cargar categorías seleccionadas previamente
      setSelectedCategories(profile.preferredCategories ?? []);
    }
  }, [profile, reset]);

  return (
    <form className="form" onSubmit={handleSubmit((data) => onSubmit({ ...data, preferredCategories: selectedCategories }))} noValidate>

      {/* ── DATOS PERSONALES ─────────────────────────────── */}
      <div className="form-section">
        <div className="section-title">Datos personales</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="firstName">Nombre <span className="required">*</span></label>
            <input
              id="firstName"
              type="text"
              placeholder="Laura"
              className={errors.firstName ? 'error-field' : ''}
              {...register('firstName')}
            />
            {errors.firstName && <span className="field-error">{errors.firstName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Apellido <span className="required">*</span></label>
            <input
              id="lastName"
              type="text"
              placeholder="Gómez"
              className={errors.lastName ? 'error-field' : ''}
              {...register('lastName')}
            />
            {errors.lastName && <span className="field-error">{errors.lastName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="displayName">Nombre público</label>
            <input
              id="displayName"
              type="text"
              placeholder="Laura G."
              {...register('displayName')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="investorType">Tipo de inversor</label>
            <select id="investorType" {...register('investorType')}>
              <option value="individual">Individual</option>
              <option value="institutional">Institucional</option>
              <option value="angel">Ángel</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="bio">Biografía</label>
            <textarea
              id="bio"
              placeholder="Inversora con experiencia en startups de tecnología y sostenibilidad..."
              {...register('bio')}
            />
          </div>
        </div>
      </div>

      {/* ── INFORMACIÓN FISCAL ───────────────────────────── */}
      <div className="form-section">
        <div className="section-title">Información fiscal</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="taxId">NIT / Cédula fiscal</label>
            <input
              id="taxId"
              type="text"
              placeholder="123456789"
              {...register('taxId')}
            />
          </div>
        </div>
      </div>

      {/* ── DIRECCIÓN ────────────────────────────────────── */}
      <div className="form-section">
        <div className="section-title">Dirección</div>
        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="addressLine1">Dirección línea 1</label>
            <input
              id="addressLine1"
              type="text"
              placeholder="Calle 72 #10-34"
              {...register('addressLine1')}
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="addressLine2">Dirección línea 2</label>
            <input
              id="addressLine2"
              type="text"
              placeholder="Apto 501"
              {...register('addressLine2')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">Ciudad</label>
            <input id="city" type="text" placeholder="Medellín" {...register('city')} />
          </div>

          <div className="form-group">
            <label htmlFor="state">Departamento / Estado</label>
            <input id="state" type="text" placeholder="Antioquia" {...register('state')} />
          </div>

          <div className="form-group">
            <label htmlFor="country">País</label>
            <input id="country" type="text" placeholder="Colombia" {...register('country')} />
          </div>

          <div className="form-group">
            <label htmlFor="postalCode">Código postal</label>
            <input id="postalCode" type="text" placeholder="050001" {...register('postalCode')} />
          </div>
        </div>
      </div>

      {/* ── PREFERENCIAS DE INVERSIÓN ────────────────────── */}
      <div className="form-section">
        <div className="section-title">Preferencias de inversión</div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="minInvestment">Inversión mínima (USD)</label>
            <input
              id="minInvestment"
              type="number"
              placeholder="500"
              min="1"
              {...register('minInvestment')}
            />
            {errors.minInvestment && <span className="field-error">{String(errors.minInvestment.message)}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="maxInvestment">Inversión máxima (USD)</label>
            <input
              id="maxInvestment"
              type="number"
              placeholder="50000"
              min="1"
              {...register('maxInvestment')}
            />
            {errors.maxInvestment && <span className="field-error">{String(errors.maxInvestment.message)}</span>}
          </div>
        </div>
      </div>

      {/* ── SECTORES DE INTERÉS ──────────────────────────── */}
      <div className="form-section">
        <div className="section-title">Sectores de interés</div>
        <CategorySelector
          selected={selectedCategories}
          onChange={setSelectedCategories}
        />
      </div>

      {/* ── ACCIONES ─────────────────────────────────────── */}
      <div className="form-actions">
        <button
          type="submit"
          id="btn-save-profile"
          className="btn btn-primary"
          disabled={saving}
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
