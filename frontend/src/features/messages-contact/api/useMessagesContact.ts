// src/features/messages-contact/api/useMessagesContact.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { MessageContact, PageServeur } from "@/types/api"

export type FiltreLecture = "tous" | "non-lus" | "lus"

export function useMessagesContact(filtre: FiltreLecture, page: number) {
  return useQuery({
    queryKey: ["messages-contact", filtre, page],
    queryFn: async () => {
      const reponse = await apiClient.get<PageServeur<MessageContact>>("/messages-contact", {
        params: {
          page,
          limit: 20,
          ...(filtre === "non-lus" ? { est_lu: false } : filtre === "lus" ? { est_lu: true } : {}),
        },
      })
      return reponse.data
    },
    placeholderData: (precedent) => precedent,
  })
}

export function useNombreMessagesNonLus() {
  return useQuery({
    queryKey: ["messages-contact", "non-lus-count"],
    queryFn: async () => {
      const reponse = await apiClient.get<{ total: number }>("/messages-contact/non-lus/count")
      return reponse.data.total
    },
    refetchInterval: 60_000,
  })
}

export function useMarquerMessageLu() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const reponse = await apiClient.patch<MessageContact>(`/messages-contact/${id}/lu`)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages-contact"] })
    },
  })
}

export function useSupprimerMessageContact() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const reponse = await apiClient.delete<{ id: string; supprime: boolean }>(`/messages-contact/${id}`)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages-contact"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })
}
