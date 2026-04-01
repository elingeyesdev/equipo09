import { useState, useEffect, useCallback } from 'react';
import {
  getMyInvestorProfile,
  createInvestorProfile,
  updateInvestorProfile,
} from '../api/investor.api';
import type {
  InvestorProfile,
  CreateInvestorProfileDto,
} from '../types/investor.types';

interface UseInvestorProfileReturn {
  profile: InvestorProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  isNewProfile: boolean;
  fetchProfile: () => Promise<void>;
  submitProfile: (dto: CreateInvestorProfileDto) => Promise<void>;
}

export function useInvestorProfile(): UseInvestorProfileReturn {
  const [profile, setProfile] = useState<InvestorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyInvestorProfile();
      setProfile(data);
      setIsNewProfile(false);
    } catch (err: any) {
      // 404 = no tiene perfil aún → modo creación
      if (err?.response?.status === 404) {
        setProfile(null);
        setIsNewProfile(true);
      } else {
        setError('Error al cargar el perfil. Verifica que el servidor esté activo.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const submitProfile = useCallback(
    async (dto: CreateInvestorProfileDto) => {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      try {
        let saved: InvestorProfile;
        if (isNewProfile) {
          saved = await createInvestorProfile(dto);
          setSuccessMessage('¡Perfil creado exitosamente!');
        } else {
          saved = await updateInvestorProfile(dto);
          setSuccessMessage('¡Perfil actualizado exitosamente!');
        }
        setProfile(saved);
        setIsNewProfile(false);
      } catch (err: any) {
        const msg =
          err?.response?.data?.message ||
          'Error al guardar el perfil. Intenta de nuevo.';
        setError(Array.isArray(msg) ? msg.join(', ') : msg);
      } finally {
        setSaving(false);
        // Auto-limpiar mensaje de éxito
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    },
    [isNewProfile],
  );

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    loading,
    saving,
    error,
    successMessage,
    isNewProfile,
    fetchProfile,
    submitProfile,
  };
}
