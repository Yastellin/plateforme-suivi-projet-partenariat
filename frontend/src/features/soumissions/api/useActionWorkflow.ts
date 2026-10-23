import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export type TypeEntiteSoumise = 'projets' | 'partenaires' | 'partenariats';
export type ActionWorkflow = 'soumettre' | 'publier';

/** Command hook commun aux agrégats partageant le workflow soumission/publication. */
export function useActionWorkflow(
  typeEntite: TypeEntiteSoumise,
  id: string,
  action: ActionWorkflow,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const reponse = await apiClient.post(`/${typeEntite}/${id}/${action}`);
      return reponse.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [typeEntite] });
      queryClient.invalidateQueries({ queryKey: [typeEntite, id] });
    },
  });
}
