import { useMutation, useQueryClient } from "@tanstack/react-query"
import apiClient from "@/lib/api-client"
import type { Porteur } from "@/types/api"

interface PayloadUpdatePorteur {
  nom: string
  institution_rattachement?: string
}

export function useUpdatePorteur() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, donnees }: { id: string; donnees: PayloadUpdatePorteur }) => {
      // On force type_porteur PERSONNE : la page Referentiels ne gere pas
      // encore les autres types. Le backend validera le reste.
      const reponse = await apiClient.patch<Porteur>(`/referentiels/porteurs/${id}`, {
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