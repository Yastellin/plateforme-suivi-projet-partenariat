// src/features/documents/api/useTelechargerDocument.ts
import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

export function useTelechargerDocument() {
  return useMutation({
    mutationFn: async ({ id, nomFichier }: { id: string; nomFichier: string }) => {
      const reponse = await apiClient.get(`/documents/${id}/telecharger`, {
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