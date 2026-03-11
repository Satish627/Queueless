'use client';

import { listPublicBusinesses, type PublicBusinessSnapshot } from '@queueless/api';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { supabaseBrowserClient } from '@/lib/supabase-browser';

export const usePublicBusiness = () => {
  const [businesses, setBusinesses] = useState<PublicBusinessSnapshot[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const items = await listPublicBusinesses(supabaseBrowserClient);
      setBusinesses(items);
      setSelectedBusinessId((previous) => previous || items[0]?.business_id || '');
    } catch (loadError) {
      if (loadError instanceof Error) {
        setError(loadError.message);
      } else {
        setError('Unable to load business data from Supabase.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const selectedBusiness = useMemo(() => {
    return businesses.find((item) => item.business_id === selectedBusinessId) ?? null;
  }, [businesses, selectedBusinessId]);

  return {
    businesses,
    selectedBusiness,
    selectedBusinessId,
    setSelectedBusinessId,
    isLoading,
    error,
    refresh,
  };
};
