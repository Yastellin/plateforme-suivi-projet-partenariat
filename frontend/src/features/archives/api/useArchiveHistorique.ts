import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { TypeArchive } from '@/types/api';

export interface ActionHistoriqueArchive {
  id: string;
  action: string;
  utilisateur_nom: string | null;
  utilisateur_role: string | null;
  details: string | null;
  date_creation: string;
}

export function useArchiveHistorique(type?: TypeArchive, id?: string) {
  return useQuery({
    queryKey: ['archives', type, id, 'historique'],
    queryFn: async () =>
      (await apiClient.get<ActionHistoriqueArchive[]>(`/archives/${type}/${id}/historique`)).data,
    enabled: Boolean(type && id),
  });
}
