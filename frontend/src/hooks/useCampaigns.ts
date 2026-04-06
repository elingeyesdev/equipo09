import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  getMyCampaigns,
  createCampaign,
  submitCampaignForReview,
  publishCampaign as publishCampaignApi,
  uploadCampaignImage as uploadCampaignImageApi,
} from '../api/campaign.api';
import type {
  EntrepreneurCampaign,
  CreateCampaignDto,
  QueryCampaignsDto,
} from '../types/campaign.types';
import { getApiErrorMessage } from '../utils/apiError';

const DEFAULT_QUERY: QueryCampaignsDto = {
  page: 1,
  limit: 12,
  sortBy: 'created_at',
  sortOrder: 'DESC',
  filterPreset: 'all',
};

export function useCampaigns() {
  const [query, setQuery] = useState<QueryCampaignsDto>(DEFAULT_QUERY);
  const [campaigns, setCampaigns] = useState<EntrepreneurCampaign[]>([]);
  const [meta, setMeta] = useState<
    | {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
      }
    | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [actionCampaignId, setActionCampaignId] = useState<string | null>(null);

  const queryKey = useMemo(() => JSON.stringify(query), [query]);
  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const paginated = await getMyCampaigns(query);
        if (cancelled) return;
        setCampaigns(paginated.data);
        setMeta(paginated.meta);
      } catch (err: unknown) {
        if (cancelled) return;
        console.error('Error fetching campaigns:', err);
        setError(getApiErrorMessage(err, 'Error al obtener campañas'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  const updateQuery = useCallback((patch: Partial<QueryCampaignsDto>) => {
    setQuery((prev) => {
      const next: QueryCampaignsDto = { ...prev, ...patch };
      if (patch.filterPreset !== undefined) {
        delete next.status;
      }
      if (patch.status !== undefined) {
        delete next.filterPreset;
      }
      return next;
    });
  }, []);

  const fetchCampaigns = useCallback(() => {
    setQuery((q) => ({ ...q }));
  }, []);

  const addCampaign = async (dto: CreateCampaignDto): Promise<boolean> => {
    try {
      setAdding(true);
      setAddError(null);
      await createCampaign(dto);
      setQuery({ ...DEFAULT_QUERY });
      return true;
    } catch (err: unknown) {
      console.error('Error creating campaign:', err);
      setAddError(getApiErrorMessage(err, 'Error al crear la campaña'));
      return false;
    } finally {
      setAdding(false);
    }
  };

  const submitForReview = async (campaignId: string): Promise<boolean> => {
    try {
      setError(null);
      setActionCampaignId(campaignId);
      await submitCampaignForReview(campaignId);
      const paginated = await getMyCampaigns(queryRef.current);
      setCampaigns(paginated.data);
      setMeta(paginated.meta);
      return true;
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'No se pudo enviar a revisión'));
      return false;
    } finally {
      setActionCampaignId(null);
    }
  };

  const publishCampaign = async (campaignId: string): Promise<boolean> => {
    try {
      setError(null);
      setActionCampaignId(campaignId);
      await publishCampaignApi(campaignId);
      const paginated = await getMyCampaigns(queryRef.current);
      setCampaigns(paginated.data);
      setMeta(paginated.meta);
      return true;
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'No se pudo publicar'));
      return false;
    } finally {
      setActionCampaignId(null);
    }
  };

  const uploadCampaignImage = async (campaignId: string, file: File): Promise<boolean> => {
    try {
      setError(null);
      setActionCampaignId(campaignId);
      await uploadCampaignImageApi(campaignId, file);
      // Actualizar la lista local
      const paginated = await getMyCampaigns(queryRef.current);
      setCampaigns(paginated.data);
      setMeta(paginated.meta);
      return true;
    } catch (err: unknown) {
      console.error(err);
      setError(getApiErrorMessage(err, 'Error al subir la imagen'));
      return false;
    } finally {
      setActionCampaignId(null);
    }
  };

  return {
    campaigns,
    meta,
    query,
    updateQuery,
    loading,
    error,
    setError,
    adding,
    addError,
    fetchCampaigns,
    addCampaign,
    submitForReview,
    publishCampaign,
    uploadCampaignImage,
    actionCampaignId,
  };
}
