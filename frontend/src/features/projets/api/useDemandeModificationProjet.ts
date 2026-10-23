import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface DemandeModificationReponse {
  projet_id: string;
  statut: string;
  demande: 'EN_ATTENTE';
}

export function useDemanderModificationProjet(projetId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (motif: string) => {
      const reponse = await apiClient.post<DemandeModificationReponse>(
        `/projets/${projetId}/demander-modification`,
        { motif },
      );
      return reponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export type DecisionDemandeModification = 'approuver' | 'rejeter';

interface TraitementDemandeReponse {
  projet_id: string;
  decision: 'APPROUVEE' | 'REJETEE';
  statut: string;
}

export function useTraiterDemandeModificationProjet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projetId,
      decision,
    }: {
      projetId: string;
      decision: DecisionDemandeModification;
    }) => {
      const reponse = await apiClient.post<TraitementDemandeReponse>(
        `/projets/${projetId}/demande-modification/${decision}`,
      );
      return reponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['projets'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'projets'] });
      queryClient.invalidateQueries({ queryKey: ['publications'] });
    },
  });
}
