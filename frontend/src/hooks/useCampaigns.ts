import { useState, useCallback, useEffect } from 'react';
import { getMyCampaigns, createCampaign } from '../api/campaign.api';
import type {
  EntrepreneurCampaign,
  CreateCampaignDto,
  QueryCampaignsDto
} from '../types/campaign.types';

export function useCampaigns(initialQuery?: QueryCampaignsDto) {
  const [campaigns, setCampaigns] = useState<EntrepreneurCampaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async (query?: QueryCampaignsDto) => {
    try {
      setLoading(true);
      setError(null);
      const paginated = await getMyCampaigns(query ?? initialQuery);
      setCampaigns(paginated.data);
    } catch (err: any) {
      console.error('Error fetching campaigns:', err);
      setError(err.response?.data?.message || 'Error al obtener campañas');
    } finally {
      setLoading(false);
    }
  }, [initialQuery]);

  const addCampaign = async (dto: CreateCampaignDto): Promise<boolean> => {
    try {
      setAdding(true);
      setAddError(null);
      const newCampaign = await createCampaign(dto);
      setCampaigns((prev) => [newCampaign, ...prev]);
      return true;
    } catch (err: any) {
      console.error('Error creating campaign:', err);
      setAddError(err.response?.data?.message || 'Error al crear la campaña');
      return false;
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    adding,
    addError,
    fetchCampaigns,
    addCampaign
  };
}
