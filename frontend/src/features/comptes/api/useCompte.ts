import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { PreferencesCompte, Utilisateur } from '@/types/api';

export function useCompte() {
  return useQuery({
    queryKey: ['compte'],
    queryFn: async () => (await apiClient.get<Utilisateur>('/compte')).data,
  });
}

export function useModifierPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: PreferencesCompte) =>
      (await apiClient.patch<Utilisateur>('/compte/preferences', preferences)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['compte'] }),
  });
}

export interface ConfigurationInstitutionnelle {
  id: string;
  cle: string;
  valeur: string | null;
  logo_url: string | null;
}

export function useConfigurationInstitutionnelle(actif = true) {
  return useQuery({
    queryKey: ['configuration'],
    queryFn: async () => (await apiClient.get<ConfigurationInstitutionnelle>('/configuration')).data,
    enabled: actif,
  });
}
