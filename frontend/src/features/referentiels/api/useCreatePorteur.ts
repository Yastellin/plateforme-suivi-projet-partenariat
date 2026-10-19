import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Porteur } from "@/types/api"

interface PayloadCreatePorteur {
  nom: string
  institution_rattachement?: string
}

export function useCreatePorteur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (donnees: PayloadCreatePorteur) => {
      // La page Referentiels ne cree que des porteurs de type PERSONNE.
      // Les types ETABLISSEMENT et AUTRE se creent depuis le wizard de projet
      // (porteur imbrique) ou via une future UI dediee.
      const reponse = await apiClient.post<Porteur>("/referentiels/porteurs", {
        type_porteur: "PERSONNE",
        nom: donnees.nom,
        institution_rattachement: donnees.institution_rattachement,
      })
      return reponse.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["referentiels", "porteurs"] })
    },
  })
}