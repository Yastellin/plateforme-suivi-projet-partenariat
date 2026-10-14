import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Archive, Download, FileText, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel"
import { Skeleton } from "@/components/ui/skeleton"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { useArchiveDetail } from "@/features/archives/api/useArchiveDetail"
import { useRestaurerArchive } from "@/features/archives/api/useRestaurerArchive"
import { useAuth } from "@/hooks/useAuth"
import { formaterDate } from "@/lib/format"
import type { TypeArchive } from "@/types/api"
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext"

const TYPES_VALIDES: TypeArchive[] = [
  "partenaires",
  "partenariats",
  "projets",
  "conventions",
  "cotutelles",
  "documents",
]

const LABEL_TYPE: Record<TypeArchive, string> = {
  partenaires: "Partenaire",
  partenariats: "Partenariat",
  projets: "Projet",
  conventions: "Convention",
  cotutelles: "Cotutelle",
  documents: "Document",
}

function estTypeValide(valeur: string | undefined): valeur is TypeArchive {
  return Boolean(valeur) && TYPES_VALIDES.includes(valeur as TypeArchive)
}

function titreEntite(type: TypeArchive, data: Record<string, unknown>): string {
  switch (type) {
    case "partenaires": return String(data.nom ?? "Partenaire")
    case "partenariats": return String(data.intitule ?? "Partenariat")
    case "projets": return String(data.nom ?? "Projet")
    case "conventions": return String(data.titre ?? "Convention")
    case "cotutelles": return String(data.nom_doctorant ?? "Cotutelle")
    case "documents": return String(data.nom_fichier ?? "Document")
  }
}

function Champ({ libelle, valeur }: { libelle: string; valeur: string | number | null | undefined }) {
  return (
    <div>
      <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
        {libelle}
      </dt>
      <dd className="mt-1 text-[13px]">{valeur === null || valeur === undefined || valeur === "" ? "—" : String(valeur)}</dd>
    </div>
  )
}

function DetailParType({ type, data }: { type: TypeArchive; data: Record<string, any> }) {
  switch (type) {
    case "partenaires":
      return (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ libelle="Nom" valeur={data.nom} />
          <Champ libelle="Type" valeur={data.type} />
          <Champ libelle="Pays" valeur={data.pays} />
          <Champ libelle="Email" valeur={data.email} />
          <Champ libelle="Telephone" valeur={data.telephone} />
          <Champ libelle="Site web" valeur={data.site_web} />
          <Champ libelle="Statut" valeur={data.statut} />
          <Champ libelle="Visibilite" valeur={data.visibilite} />
          {data.description ? (
            <div className="sm:col-span-2">
              <Champ libelle="Description" valeur={data.description} />
            </div>
          ) : null}
        </dl>
      )

    case "partenariats":
      return (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ libelle="Intitule" valeur={data.intitule} />
          <Champ libelle="Domaine" valeur={data.domaine} />
          <Champ libelle="Date de debut" valeur={data.date_debut ? formaterDate(data.date_debut) : null} />
          <Champ libelle="Date de fin" valeur={data.date_fin ? formaterDate(data.date_fin) : null} />
          <Champ libelle="Statut" valeur={data.statut} />
          {data.objet ? (
            <div className="sm:col-span-2">
              <Champ libelle="Objet" valeur={data.objet} />
            </div>
          ) : null}
          {data.actions_realisees ? (
            <div className="sm:col-span-2">
              <Champ libelle="Actions realisees" valeur={data.actions_realisees} />
            </div>
          ) : null}
          {data.resultats_obtenus ? (
            <div className="sm:col-span-2">
              <Champ libelle="Resultats obtenus" valeur={data.resultats_obtenus} />
            </div>
          ) : null}
        </dl>
      )

    case "projets":
      return (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ libelle="Nom" valeur={data.nom} />
          <Champ libelle="Intitule officiel" valeur={data.intitule_officiel} />
          <Champ libelle="Type" valeur={data.type} />
          <Champ libelle="Domaine" valeur={data.domaine} />
          <Champ libelle="Budget" valeur={data.budget != null ? `${data.budget} Ar` : null} />
          <Champ libelle="Statut" valeur={data.statut} />
          <Champ libelle="Date de debut" valeur={data.date_debut ? formaterDate(data.date_debut) : null} />
          <Champ libelle="Date de fin prevue" valeur={data.date_fin_prevue ? formaterDate(data.date_fin_prevue) : null} />
        </dl>
      )

    case "conventions":
      return (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ libelle="Reference" valeur={data.reference} />
          <Champ libelle="Titre" valeur={data.titre} />
          <Champ libelle="Statut" valeur={data.statut} />
          <Champ libelle="Date de signature" valeur={data.date_signature ? formaterDate(data.date_signature) : null} />
          <Champ libelle="Date de debut" valeur={data.date_debut ? formaterDate(data.date_debut) : null} />
          <Champ libelle="Date de fin" valeur={data.date_fin ? formaterDate(data.date_fin) : null} />
          {data.description ? (
            <div className="sm:col-span-2">
              <Champ libelle="Description" valeur={data.description} />
            </div>
          ) : null}
        </dl>
      )

    case "cotutelles":
      return (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ libelle="Nom du doctorant" valeur={data.nom_doctorant} />
          <Champ libelle="Specialite" valeur={data.specialite} />
          <Champ libelle="Directeur local" valeur={data.directeur_these_local} />
          <Champ libelle="Directeur partenaire" valeur={data.directeur_these_partenaire} />
          <Champ libelle="Type" valeur={data.type} />
          <Champ libelle="Date de debut" valeur={data.date_debut ? formaterDate(data.date_debut) : null} />
          <Champ libelle="Soutenance prevue" valeur={data.date_prevue_soutenance ? formaterDate(data.date_prevue_soutenance) : null} />
          <Champ libelle="Financement" valeur={data.financement_bourse} />
          {data.etat_avancement ? (
            <div className="sm:col-span-2">
              <Champ libelle="Etat d'avancement" valeur={data.etat_avancement} />
            </div>
          ) : null}
        </dl>
      )

    case "documents":
      return (
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Champ libelle="Nom du fichier" valeur={data.nom_fichier} />
          <Champ libelle="Type" valeur={data.type} />
          <Champ libelle="Version" valeur={data.version} />
          <Champ libelle="Rattache a un projet" valeur={data.projet_id ? "Oui" : "Non"} />
          <Champ libelle="Rattache a une convention" valeur={data.convention_id ? "Oui" : "Non"} />
        </dl>
      )
  }
}

export function ArchiveDetailPage() {
  const { type, id } = useParams<{ type: string; id: string }>()
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const [restaurationOuverte, setRestaurationOuverte] = useState(false)

  const typeValide = estTypeValide(type) ? type : undefined
  const { data, isLoading } = useArchiveDetail<Record<string, any>>(
    typeValide as TypeArchive,
    id,
  )
  const titrePourBreadcrumb =
    data && typeValide ? titreEntite(typeValide, data) : null
  useTitreBreadcrumb(titrePourBreadcrumb)
  const restaurer = useRestaurerArchive()

  const cheminBase =
    utilisateur?.role === "PRESIDENCE"
      ? "/presidence"
      : utilisateur?.role === "ETABLISSEMENT"
        ? "/etablissement"
        : "/decideur"

  const peutRestaurer =
    utilisateur?.role === "PRESIDENCE" || utilisateur?.role === "ETABLISSEMENT"

  if (!typeValide || !id) {
    return (
      <EmptyState
        icone={FileText}
        titre="Lien invalide"
        description="Le type ou l'identifiant de l'archive est manquant."
      />
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        icone={Archive}
        titre="Element archive introuvable"
        description="Cet element n'existe pas, a ete restaure, ou ne vous est pas accessible."
      />
    )
  }

  const titre = titreEntite(typeValide, data)
  const dateArchivage = data.updated_at ? formaterDate(String(data.updated_at)) : "—"

  return (
    <div>
      <PageHeader
        titre={titre}
        description={`${LABEL_TYPE[typeValide]} archive le ${dateArchivage}`}
        actions={
          <div className="flex gap-2">
            <Link
              to={`${cheminBase}/archives`}
              className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour aux archives
            </Link>
            {typeValide === "documents" ? (
              <a
                href={`${import.meta.env.VITE_API_URL ?? "http://localhost:3000/api"}/documents/${id}/telecharger`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
              >
                <Download className="h-3.5 w-3.5" />
                Telecharger
              </a>
            ) : null}
            {peutRestaurer ? (
              <button
                type="button"
                onClick={() => setRestaurationOuverte(true)}
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-brand)] hover:border-[var(--color-brand)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Restaurer
              </button>
            ) : null}
          </div>
        }
      />

      <Panel>
        <PanelHeader titre={`Informations (${LABEL_TYPE[typeValide]})`} />
        <PanelBody>
          <DetailParType type={typeValide} data={data} />
        </PanelBody>
      </Panel>

      <DestructiveConfirmDialog
        ouvert={restaurationOuverte}
        onFermer={() => setRestaurationOuverte(false)}
        onConfirmer={() =>
          restaurer.mutate(
            { type: typeValide, id },
            {
              onSuccess: () => {
                toast.success(`${LABEL_TYPE[typeValide]} restaure`)
                setRestaurationOuverte(false)
                navigate(`${cheminBase}/archives`)
              },
              onError: (e: Error) => toast.error(e.message),
            },
          )
        }
        titre={`Restaurer ce ${LABEL_TYPE[typeValide].toLowerCase()} ?`}
        description="L'element redeviendra actif et visible dans les listes courantes."
        nomCible={titre}
        libelleAction="Restaurer"
      />
    </div>
  )
}