// src/features/synthese/api/useDeletePartenaireStrategique.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

/** DELETE /synthese/partenaires-strategiques/:id — réservé à la Présidence. */
export function useDeletePartenaireStrategique() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/synthese/partenaires-strategiques/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synthese'] });
    },
  });
}
