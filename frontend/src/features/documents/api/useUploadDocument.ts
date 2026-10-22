// src/features/documents/api/useUploadDocument.ts
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { AxiosProgressEvent } from "axios"
import apiClient from "@/lib/api-client"
import type { DocumentFichier, TypeDocument } from "@/types/api"

interface PayloadUploadDocument {
  fichier: File
  type: TypeDocument
  projet_id?: string
  convention_id?: string
  cotutelle_id?: string
  partenariat_id?: string
}

export function useUploadDocument(onProgression?: (pourcentage: number) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ fichier, type, projet_id, convention_id, cotutelle_id, partenariat_id }: PayloadUploadDocument) => {
      const formData = new FormData()
      formData.append("fichier", fichier)
      formData.append("type", type)
      if (projet_id) formData.append("projet_id", projet_id)
      if (convention_id) formData.append("convention_id", convention_id)
      if (cotutelle_id) formData.append("cotutelle_id", cotutelle_id)
      if (partenariat_id) formData.append("partenariat_id", partenariat_id)

      const reponse = await apiClient.post<DocumentFichier>("/documents", formData, {
        onUploadProgress: (evenement: AxiosProgressEvent) => {
          if (evenement.total) {
            onProgression?.(Math.round((evenement.loaded * 100) / evenement.total))
          }
        },
      })
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] })
    },
  })
}