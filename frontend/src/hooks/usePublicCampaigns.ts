import { useState, useEffect, useCallback } from 'react';
import {
  fetchPublicCampaigns,
  type PublicCampaign,
  type PaginatedPublicCampaigns,
  type PublicCampaignFilters,
} from '../api/public-campaigns.api';

export function usePublicCampaigns(initialFilters: PublicCampaignFilters = {}) {
  const [campaigns, setCampaigns] = useState<PublicCampaign[]>([]);
  const [meta, setMeta] = useState<PaginatedPublicCampaigns['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PublicCampaignFilters>({
    page: 1,
    limit: 12,
    sortBy: 'created_at',
    sortOrder: 'DESC',
    ...initialFilters,
  });

  const loadCampaigns = useCallback(async (f: PublicCampaignFilters) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchPublicCampaigns(f);
      setCampaigns(result.data);
      setMeta(result.meta);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al cargar campañas');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCampaigns(filters);
  }, [filters, loadCampaigns]);

  const updateFilters = useCallback((partial: Partial<PublicCampaignFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...partial,
      page: partial.page ?? 1, // reset page on filter change unless specified
    }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }));
  }, []);

  const refresh = useCallback(() => {
    loadCampaigns(filters);
  }, [filters, loadCampaigns]);

  return {
    campaigns,
    meta,
    loading,
    error,
    filters,
    updateFilters,
    goToPage,
    refresh,
  };
}
