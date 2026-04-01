import { useState, useEffect } from 'react';
import { getCapitalOverview } from '../api/investor.api';
import type { CapitalOverview } from '../types/investor.types';

export function useInvestorDashboard() {
  const [data, setData] = useState<CapitalOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCapitalOverview();
      setData(res);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // Significa que no ha creado su perfil aún
        setError('No tienes perfil de inversor.');
      } else {
        setError('Error al cargar datos financieros.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchOverview,
  };
}
