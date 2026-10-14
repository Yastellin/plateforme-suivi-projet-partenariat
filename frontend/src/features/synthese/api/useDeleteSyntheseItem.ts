// src/features/synthese/api/useDeleteSyntheseItem.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

/** DELETE /synthese/items/:id — réservé à la Présidence. */
export function useDeleteSyntheseItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/synthese/items/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['synthese'] });
    },
  });
}
