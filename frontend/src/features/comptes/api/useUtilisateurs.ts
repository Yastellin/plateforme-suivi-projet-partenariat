import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type { RoleUtilisateur, Utilisateur } from "@/types/api";

export function useUtilisateurs(actif: boolean) {
  return useQuery({
    queryKey: ["utilisateurs"],
    queryFn: async () =>
      (await apiClient.get<Utilisateur[]>("/utilisateurs")).data,
    enabled: actif,
  });
}

export interface AccesUtilisateurPayload {
  actif?: boolean;
  role?: RoleUtilisateur;
  etablissement_id?: string | null;
}

export type CreerUtilisateurPayload = {
  email: string;
  mot_de_passe: string;
} & (
  | { role: "ETABLISSEMENT"; etablissement_nom: string }
  | { role: Exclude<RoleUtilisateur, "ETABLISSEMENT"> }
);

export function useModifierAccesUtilisateur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...acces
    }: AccesUtilisateurPayload & { id: string }) =>
      (await apiClient.patch<Utilisateur>(`/utilisateurs/${id}/acces`, acces))
        .data,
    onSuccess: (utilisateur) => {
      queryClient.setQueryData<Utilisateur[]>(["utilisateurs"], (courants) =>
        courants?.map((item) =>
          item.id === utilisateur.id ? utilisateur : item,
        ),
      );
      return queryClient.invalidateQueries({ queryKey: ["utilisateurs"] });
    },
  });
}

export function useCreerUtilisateur() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreerUtilisateurPayload) =>
      (await apiClient.post<Utilisateur>("/utilisateurs", payload)).data,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["utilisateurs"] }),
  });
}
