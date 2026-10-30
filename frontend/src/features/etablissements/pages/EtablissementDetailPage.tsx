// src/features/etablissements/pages/EtablissementDetailPage.tsx

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Building2, FolderKanban, Handshake, Network } from "lucide-react";
import { TableauLiensEtablissement } from "@/features/etablissements/components/TableauLiensEtablissement";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel";
import { LogoMedia } from "@/components/shared/ImageMedia";
import { useEtablissement } from "@/features/etablissements/api/useEtablissement";
import { useComparatifEtablissements } from "@/features/tableau-de-bord/api/useComparatifEtablissements";
import { useProjets } from "@/features/projets/api/useProjets";
import { usePartenaires } from "@/features/partenaires/api/usePartenaires";
import { usePartenariats } from "@/features/partenariats/api/usePartenariats";
import { Skeleton } from "@/components/ui/skeleton";
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext";
import { usePermissions } from "@/hooks/usePermissions";
import {
  FiltreTypeStatistique,
  type TypeStatistique,
} from "@/features/etablissements/components/FiltreTypeStatistique";

export function EtablissementDetailPage() {
  const { id = "" } = useParams<{ id: string }>();
  const permissions = usePermissions();
  const [filtre, setFiltre] = useState<TypeStatistique>("tous");
  const { data: etablissement, isLoading } = useEtablissement(id);
  const { data: comparatif } = useComparatifEtablissements();
  const projets = useProjets({ page: 1, limit: 10, etablissement_id: id });
  const partenaires = usePartenaires({
    page: 1,
    limit: 10,
    etablissement_id: id,
  });
  const partenariats = usePartenariats({
    page: 1,
    limit: 10,
    etablissement_id: id,
  });
  useTitreBreadcrumb(etablissement?.nom);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    );
  }
  if (!etablissement) {
    return (
      <EmptyState
        icone={Building2}
        titre="Établissement introuvable"
        description="Cet établissement n'existe pas ou a été supprimé."
      />
    );
  }

  const statistiques = comparatif?.find((item) => item.etablissement_id === id);
  const cheminBase = permissions.estDecideur ? "/decideur" : "/presidence";

  return (
    <div>
      <PageHeader
        titre={etablissement.nom}
        description={etablissement.sigle ?? undefined}
      />

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <Panel>
          <PanelHeader titre="Identité et description" />
          <PanelBody className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <LogoMedia
                src={etablissement.logo_url}
                nom={etablissement.nom}
                className="h-20 w-20 flex-shrink-0 rounded-lg border border-[var(--color-border)] bg-white object-contain p-1 text-lg"
              />
              <p className="text-xs text-[var(--color-text-secondary)]">
                Ce logo est géré exclusivement par le compte de l’établissement.
              </p>
            </div>
            <p className="text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
              {etablissement.description ?? "Aucune description renseignée."}
            </p>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader
            titre="Statistiques"
            sousTitre="Périmètre de cet établissement"
          />
          <PanelBody>
            <div className="grid grid-cols-2 gap-3">
              {filtre !== "partenaires" ? (
                <>
                  <Indicateur
                    icone={FolderKanban}
                    libelle="Projets"
                    valeur={statistiques?.projets ?? projets.data?.meta.total ?? 0}
                  />
                  <Indicateur
                    icone={FolderKanban}
                    libelle="Projets actifs"
                    valeur={statistiques?.projets_actifs ?? 0}
                  />
                </>
              ) : null}
              {filtre !== "projets" ? (
                <>
                  <Indicateur
                    icone={Handshake}
                    libelle="Partenaires"
                    valeur={
                      statistiques?.partenaires ?? partenaires.data?.meta.total ?? 0
                    }
                  />
                  <Indicateur
                    icone={Network}
                    libelle="Partenariats"
                    valeur={
                      statistiques?.partenariats ??
                      partenariats.data?.meta.total ??
                      0
                    }
                  />
                </>
              ) : null}
            </div>
          </PanelBody>
        </Panel>
      </div>

      <div className="mb-4 flex justify-end">
        <FiltreTypeStatistique valeur={filtre} onChange={setFiltre} />
      </div>

      <div className="flex flex-col gap-4">
        {filtre !== "partenaires" ? (
          <TableauLiensEtablissement
            titre="Projets"
            sousTitre="Projets de cet établissement"
            icone={FolderKanban}
            libelleDate="Début"
            messageVide="Aucun projet pour cet établissement."
            lignes={(projets.data?.data ?? []).map((item) => ({
              id: item.id,
              titre: item.nom,
              sousTitre: item.intitule_officiel ?? item.type,
              statut: item.statut,
              date: item.date_debut,
              lien: `${cheminBase}/projets/${item.id}`,
            }))}
          />
        ) : null}
        {filtre !== "projets" ? (
          <TableauLiensEtablissement
            titre="Partenariats"
            sousTitre="Partenariats impliquant cet établissement"
            icone={Network}
            libelleDate="Début"
            messageVide="Aucun partenariat pour cet établissement."
            lignes={(partenariats.data?.data ?? []).map((item) => ({
              id: item.id,
              titre: item.intitule,
              sousTitre: item.domaine,
              statut: item.statut,
              date: item.date_debut,
              lien: `${cheminBase}/partenaires-partenariats/partenariats/${item.id}`,
            }))}
          />
        ) : null}
        {filtre !== "projets" ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <ListeLiee
              titre="Partenaires"
              elements={(partenaires.data?.data ?? []).map((item) => ({
                id: item.id,
                libelle: item.nom,
                lien: `${cheminBase}/partenaires-partenariats/partenaires/${item.id}`,
              }))}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Indicateur({
  icone: Icone,
  libelle,
  valeur,
}: {
  icone: typeof Building2;
  libelle: string;
  valeur: number;
}) {
  return (
    <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3">
      <Icone className="mb-2 h-4 w-4 text-[var(--color-brand)]" />
      <div className="text-xl font-bold">{valeur}</div>
      <div className="text-xs text-[var(--color-text-secondary)]">
        {libelle}
      </div>
    </div>
  );
}

function ListeLiee({
  titre,
  elements,
}: {
  titre: string;
  elements: { id: string; libelle: string; lien: string }[];
}) {
  return (
    <Panel>
      <PanelHeader titre={titre} />
      <PanelBody>
        {elements.length ? (
          <ul className="flex flex-col gap-2">
            {elements.map((element) => (
              <li key={element.id}>
                <Link
                  to={element.lien}
                  className="text-[13px] font-semibold text-[var(--color-brand)] hover:underline"
                >
                  {element.libelle}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--color-text-secondary)]">
            Aucune donnée.
          </p>
        )}
      </PanelBody>
    </Panel>
  );
}
