// src/features/etablissements/pages/EtablissementsListePage.tsx

import { useMemo, useState } from "react";
import { Building2, FolderKanban, Handshake, Network } from "lucide-react";

import { EmptyState } from "@/components/shared/EmptyState";
import { KpiCard } from "@/components/shared/KpiCard";
import { KpiGrid } from "@/components/shared/KpiGrid";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelBody } from "@/components/shared/Panel";
import { TablePagination } from "@/components/shared/TablePagination";
import { TableToolbar } from "@/components/shared/TableToolbar";
import { useEtablissements } from "@/features/etablissements/api/useEtablissements";
import { useComparatifEtablissements } from "@/features/tableau-de-bord/api/useComparatifEtablissements";
import { CarteStatistiquesEtablissement } from "@/features/etablissements/components/CarteStatistiquesEtablissement";
import {
  FiltreTypeStatistique,
  type TypeStatistique,
} from "@/features/etablissements/components/FiltreTypeStatistique";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

export function EtablissementsListePage() {
  const { utilisateur } = useAuth();
  const cheminBase = utilisateur?.role === "DECIDEUR" ? "/decideur" : "/presidence";
  const [recherche, setRecherche] = useState("");
  const [page, setPage] = useState(1);
  const [filtre, setFiltre] = useState<TypeStatistique>("tous");
  const rechercheDebouncee = useDebounce(recherche, 300);

  const { data, isLoading } = useEtablissements({
    page,
    limit: 12,
    recherche: rechercheDebouncee || undefined,
  });
  const { data: comparatif } = useComparatifEtablissements();

  // Statistiques par établissement, indexées par identifiant
  const statistiques = useMemo(
    () => new Map((comparatif ?? []).map((item) => [item.etablissement_id, item])),
    [comparatif],
  );

  // Totaux de la plateforme (tous établissements confondus)
  const totaux = useMemo(() => {
    const liste = comparatif ?? [];
    const somme = (cle: "projets" | "partenaires" | "partenariats") =>
      liste.reduce((acc, item) => acc + (item[cle] ?? 0), 0);
    return {
      etablissements: liste.length,
      projets: somme("projets"),
      partenaires: somme("partenaires"),
      partenariats: somme("partenariats"),
      maxProjets: Math.max(1, ...liste.map((item) => item.projets ?? 0)),
      maxPartenaires: Math.max(1, ...liste.map((item) => item.partenaires ?? 0)),
    };
  }, [comparatif]);

  const etablissements = data?.data ?? [];

  return (
    <div>
      <PageHeader
        titre="Établissements"
        description={
          data
            ? `${data.meta.total} établissement${data.meta.total > 1 ? "s" : ""} enregistré${data.meta.total > 1 ? "s" : ""}`
            : "Chargement…"
        }
      />

      <KpiGrid>
        <KpiCard icone={Building2} libelle="Établissements" valeur={totaux.etablissements} />
        <KpiCard icone={FolderKanban} libelle="Projets" valeur={totaux.projets} />
        <KpiCard icone={Handshake} libelle="Partenaires" valeur={totaux.partenaires} />
        <KpiCard icone={Network} libelle="Partenariats" valeur={totaux.partenariats} />
      </KpiGrid>

      <Panel>
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur);
            setPage(1);
          }}
          placeholderRecherche="Rechercher un établissement…"
          enfants={<FiltreTypeStatistique valeur={filtre} onChange={setFiltre} />}
        />

        {isLoading ? (
          <div className="grid gap-4 p-[16px_18px] sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((cle) => (
              <div
                key={cle}
                className="h-56 w-full animate-pulse rounded-[var(--radius)] bg-[var(--color-page-bg)]"
              />
            ))}
          </div>
        ) : etablissements.length === 0 ? (
          <EmptyState
            icone={Building2}
            titre="Aucun établissement"
            description="Aucun établissement ne correspond à votre recherche."
          />
        ) : (
          <PanelBody>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {etablissements.map((etablissement) => (
                <CarteStatistiquesEtablissement
                  key={etablissement.id}
                  etablissement={etablissement}
                  statistiques={statistiques.get(etablissement.id)}
                  maxProjets={totaux.maxProjets}
                  maxPartenaires={totaux.maxPartenaires}
                  filtre={filtre}
                  lien={`${cheminBase}/etablissements/${etablissement.id}`}
                />
              ))}
            </div>
          </PanelBody>
        )}

        {data ? (
          <TablePagination meta={data.meta} onChangerPage={setPage} />
        ) : null}
      </Panel>
    </div>
  );
}
