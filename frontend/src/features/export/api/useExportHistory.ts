import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { PageServeur } from '@/types/api';
import type { HistoriqueExport } from '../types/export.types';

export function useExportHistory(page: number, limit = 10) {
  return useQuery({
    queryKey: ['exports', 'historique', page, limit],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<HistoriqueExport>>(
        '/exports/historique',
        { params: { page, limit } },
      );
      return reponse.data;
    },
    placeholderData: (precedent) => precedent,
    refetchOnWindowFocus: false,
  });
}
