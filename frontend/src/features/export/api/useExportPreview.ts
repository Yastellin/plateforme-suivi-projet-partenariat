import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { ApercuExport, FiltresExport } from '../types/export.types';

export function useExportPreview(filtres: FiltresExport, enabled: boolean) {
  return useQuery({
    queryKey: ['exports', 'apercu', filtres],
    queryFn: async ({ signal }) => {
      const reponse = await apiClient.post<ApercuExport>(
        '/exports/apercu',
        filtres,
        { signal },
      );
      return reponse.data;
    },
    enabled,
    placeholderData: (precedent) => precedent,
    refetchOnWindowFocus: false,
  });
}
