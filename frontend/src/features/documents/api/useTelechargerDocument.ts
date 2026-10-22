// src/features/documents/api/useTelechargerDocument.ts
import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useTelechargerDocument() {
  return useMutation({
    mutationFn: async ({ id, nomFichier, archive = false }: { id: string; nomFichier: string; archive?: boolean }) => {
      const endpoint = archive
        ? `/archives/documents/${id}/telecharger`
        : `/documents/${id}/telecharger`
      const reponse = await apiClient.get(endpoint, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([reponse.data as BlobPart]))
      const lien = document.createElement("a")
      lien.href = url
      lien.download = nomFichier
      document.body.appendChild(lien)
      lien.click()
      lien.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}