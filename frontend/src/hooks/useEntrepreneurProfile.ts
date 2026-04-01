import { useState, useEffect, useCallback } from 'react';
import {
  getMyEntrepreneurProfile,
  createEntrepreneurProfile,
  updateEntrepreneurProfile,
} from '../api/entrepreneur.api';
import type {
  EntrepreneurProfile,
  CreateEntrepreneurProfileDto,
} from '../types/entrepreneur.types';

interface UseEntrepreneurProfileReturn {
  profile: EntrepreneurProfile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;
  isNewProfile: boolean;
  fetchProfile: () => Promise<void>;
  submitProfile: (dto: CreateEntrepreneurProfileDto) => Promise<void>;
}

export function useEntrepreneurProfile(): UseEntrepreneurProfileReturn {
  const [profile, setProfile] = useState<EntrepreneurProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyEntrepreneurProfile();
      setProfile(data);
      setIsNewProfile(false);
    } catch (err: any) {
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

  // ── Crear o actualizar perfil
  const submitProfile = useCallback(
    async (dto: CreateEntrepreneurProfileDto) => {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);
      try {
        let saved: EntrepreneurProfile;
        if (isNewProfile) {
          saved = await createEntrepreneurProfile(dto);
          setSuccessMessage('¡Perfil creado exitosamente! Bienvenido a la plataforma.');
        } else {
          saved = await updateEntrepreneurProfile(dto);
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
