// src/features/partenaires/api/useContacts.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Contact } from "@/types/api"

export interface PayloadContact {
  nom: string
  fonction?: string
  email?: string
  telephone?: string
}

// Un contact est rattache a un seul partenaire (RG28).
export function useCreerContact(partenaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: PayloadContact) => {
      const reponse = await apiClient.post<Contact>(`/partenaires/${partenaireId}/contacts`, payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenaires", partenaireId] })
    },
  })
}

export function useModifierContact(partenaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PayloadContact }) => {
      const reponse = await apiClient.patch<Contact>(`/contacts/${id}`, payload)
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenaires", partenaireId] })
    },
  })
}

export function useSupprimerContact(partenaireId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/contacts/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partenaires", partenaireId] })
    },
  })
}
