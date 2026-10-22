import { useMutation, useQueryClient } from "@tanstack/react-query";

import apiClient from "@/lib/api-client";

export function useArchiverDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/documents/${id}`);
    },
    onSuccess: (_resultat, id) => {
      queryClient.removeQueries({
        predicate: (query) =>
          query.queryKey[0] === "documents" && query.queryKey.includes(id),
      });
      void queryClient.invalidateQueries({
        predicate: (query) =>
          query.queryKey[0] === "documents" && !query.queryKey.includes(id),
      });
      void queryClient.invalidateQueries({ queryKey: ["archives"] });
    },
  });
}
