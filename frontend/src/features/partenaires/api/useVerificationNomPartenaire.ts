import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

export interface PartenaireCorrespondant {
  id: string;
  nom: string;
  pays: string;
  type: string;
}

export interface PartenaireSimilaire extends PartenaireCorrespondant {
  similarite: number;
}

export interface ResultatVerificationNomPartenaire {
  doublon_exact: boolean;
  correspondants: PartenaireCorrespondant[];
  similaires: PartenaireSimilaire[];
}

async function verifierNomPartenaire(
  nom: string,
  signal: AbortSignal,
): Promise<ResultatVerificationNomPartenaire> {
  console.log("Vérification du nom du partenaire.", { nom });
  const reponse = await apiClient.get<ResultatVerificationNomPartenaire>(
    "/partenaires/verification-nom",
    { params: { nom }, signal },
  );
  return reponse.data;
}

export function useVerificationNomPartenaire(nom: string) {
  const nomRecherche = nom.trim();
  return useQuery({
    queryKey: ["partenaires", "verification-nom", nomRecherche],
    queryFn: ({ signal }) => verifierNomPartenaire(nomRecherche, signal),
    enabled: nomRecherche.length >= 2,
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}
