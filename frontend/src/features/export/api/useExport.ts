// src/features/export/api/useExport.ts
import { useMutation } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"

type FormatExport = "pdf" | "xlsx"
type RessourceExport = "projets" | "conventions"

interface ExportParams {
  ressource: RessourceExport
  format: FormatExport
  filtres?: Record<string, string | number | undefined>
}

// Hook pour telecharger un export serveur (section 7.1 : "Export PDF/Excel
// depuis une liste filtree → telechargement direct, fichier genere cote
// serveur, le frontend declenche simplement le telechargement").
export function useExport() {
  return useMutation({
    mutationFn: async ({ ressource, format, filtres }: ExportParams) => {
      const reponse = await apiClient.get(`/export/${ressource}`, {
        params: { format, ...filtres },
        responseType: "blob",
      })

      // Extraire le nom du fichier depuis Content-Disposition
      const disposition = reponse.headers["content-disposition"]
      let nomFichier = `${ressource}.${format}`
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/)
        if (match) nomFichier = match[1]
      }

      // Creer un lien de telechargement temporaire
      const blob = new Blob([reponse.data as BlobPart])
      const url = window.URL.createObjectURL(blob)
      const lien = document.createElement("a")
      lien.href = url
      lien.download = nomFichier
      document.body.appendChild(lien)
      lien.click()
      document.body.removeChild(lien)
      window.URL.revokeObjectURL(url)
    },
  })
}
