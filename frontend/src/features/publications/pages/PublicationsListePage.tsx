// src/features/publications/pages/PublicationsListePage.tsx

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  EyeOff,
  ExternalLink,
  Globe,
  Image as ImageIcon,
  Newspaper,
  Pencil,
} from "lucide-react"

import apiClient from "@/lib/api-client"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { resoudreUrlFichier } from "@/lib/url"
import type { Publication } from "@/types/api"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { TablePagination } from "@/components/shared/TablePagination"
import { EmptyState } from "@/components/shared/EmptyState"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { useChangerStatutPublication } from "@/features/publications/api/useChangerStatutPublication"
import {
  ModaleStatutPublication,
  type ActionStatutPublication,
} from "@/features/publications/components/ModaleStatutPublication"
import {
  formaterDatePublication,
  libelleStatutPublication,
  pluriel,
} from "@/features/publications/lib/affichage-publication"

type FiltreStatut = "TOUTES" | "PUBLIEE" | "BROUILLON"

interface ReponsePublications {
  data: Publication[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

const LIMITE = 20

function messageErreur(erreur: unknown): string {
  const message = (erreur as { response?: { data?: { message?: string | string[] } } })
    ?.response?.data?.message
  if (Array.isArray(message)) return message.join(" ")
  if (typeof message === "string") return message
  return "L'action n'a pas pu être enregistrée. Réessayez."
}

export function PublicationsListePage() {
  const { peutModifier } = usePermissions()
  const [recherche, setRecherche] = useState("")
  const [filtre, setFiltre] = useState<FiltreStatut>("TOUTES")
  const [page, setPage] = useState(1)
  const rechercheDebouncee = useDebounce(recherche, 300)

  const [cible, setCible] = useState<{
    publication: Publication
    action: ActionStatutPublication
  } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const changerStatut = useChangerStatutPublication()

  const listeQuery = useQuery({
    queryKey: ["publications", { page, recherche: rechercheDebouncee, filtre }],
    queryFn: async () => {
      const reponse = await apiClient.get<ReponsePublications>("/publications", {
        params: {
          page,
          limit: LIMITE,
          titre: rechercheDebouncee || undefined,
          statut: filtre === "TOUTES" ? undefined : filtre,
        },
      })
      return reponse.data
    },
  })

  const compteursQuery = useQuery({
    queryKey: ["publications", "compteurs"],
    queryFn: async () => {
      const [publiees, brouillons] = await Promise.all([
        apiClient.get<ReponsePublications>("/publications", { params: { limit: 1, statut: "PUBLIEE" } }),
        apiClient.get<ReponsePublications>("/publications", { params: { limit: 1, statut: "BROUILLON" } }),
      ])
      return {
        publiees: publiees.data.meta.total,
        brouillons: brouillons.data.meta.total,
      }
    },
  })

  useEffect(() => {
    if (!toast) return
    const minuteur = window.setTimeout(() => setToast(null), 2500)
    return () => window.clearTimeout(minuteur)
  }, [toast])

  function fermerModale() {
    setCible(null)
    changerStatut.reset()
  }

  function ouvrirAction(publication: Publication, action: ActionStatutPublication) {
    changerStatut.reset()
    setCible({ publication, action })
  }

  function confirmerAction() {
    if (!cible) return
    const { publication, action } = cible
    changerStatut.mutate(
      { id: publication.id, statut: action === "PUBLIER" ? "PUBLIEE" : "BROUILLON" },
      {
        onSuccess: () => {
          setCible(null)
          setToast(
            action === "PUBLIER"
              ? "Publication mise en ligne"
              : "Publication retirée de l'espace public",
          )
        },
      },
    )
  }

  const compteurs = compteursQuery.data
  const totalPubliees = compteurs?.publiees ?? 0
  const totalBrouillons = compteurs?.brouillons ?? 0
  const totalToutes = totalPubliees + totalBrouillons
  const meta = listeQuery.data?.meta
  const donnees = listeQuery.data?.data ?? []
  const estFiltree = filtre !== "TOUTES" || rechercheDebouncee.trim() !== ""

  const segments: { valeur: FiltreStatut; libelle: string; nombre: number }[] = [
    { valeur: "TOUTES", libelle: "Toutes", nombre: totalToutes },
    { valeur: "PUBLIEE", libelle: "Publiées", nombre: totalPubliees },
    { valeur: "BROUILLON", libelle: "Brouillons", nombre: totalBrouillons },
  ]

  const classeIconeAction =
    "grid h-8 w-8 place-items-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-page-bg)]"

  return (
    <div>
      <PageHeader
        titre="Publications"
        description={
          compteurs
            ? `${totalToutes} ${pluriel(totalToutes, "publication", "publications")} ${pluriel(totalToutes, "enregistrée", "enregistrées")}`
            : "Chargement…"
        }
      />

      <Panel>
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={(valeur) => {
            setRecherche(valeur)
            setPage(1)
          }}
          placeholderRecherche="Rechercher une publication…"
          action={
            <div
              role="group"
              aria-label="Filtrer par statut"
              className="inline-flex gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-page-bg)] p-0.5"
            >
              {segments.map((segment) => {
                const actif = filtre === segment.valeur
                return (
                  <button
                    key={segment.valeur}
                    type="button"
                    aria-pressed={actif}
                    onClick={() => {
                      setFiltre(segment.valeur)
                      setPage(1)
                    }}
                    className={`inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-sm)] px-3 text-xs font-semibold ${
                      actif
                        ? "bg-[var(--color-brand)] text-white"
                        : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    }`}
                  >
                    {segment.libelle}
                    <span className="tabular-nums opacity-80">{segment.nombre}</span>
                  </button>
                )
              })}
            </div>
          }
        />

        {listeQuery.isLoading ? (
          <div className="flex flex-col gap-3 p-[16px_18px]">
            {[0, 1, 2, 3, 4].map((cle) => (
              <Skeleton key={cle} className="h-12 w-full" />
            ))}
          </div>
        ) : listeQuery.isError ? (
          <EmptyState titre="Impossible de charger les publications." icone={Newspaper} />
        ) : donnees.length === 0 ? (
          <EmptyState
            icone={Newspaper}
            titre={
              estFiltree
                ? "Aucune publication ne correspond à votre recherche."
                : "Aucune publication n'a encore été créée."
            }
            description={
              estFiltree
                ? "Essayez avec un autre terme de recherche ou un autre filtre."
                : "Les publications créées apparaîtront ici."
            }
          />
        ) : (
          <PanelBody>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr>
                    {["Publication", "Statut", "Date de publication"].map((entete) => (
                      <th
                        key={entete}
                        scope="col"
                        className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]"
                      >
                        {entete}
                      </th>
                    ))}
                    <th
                      scope="col"
                      className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-right text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {donnees.map((publication) => {
                    const estPubliee = publication.statut === "PUBLIEE"
                    const nbPhotos = publication.photos?.length ?? 0
                    const urlVignette = resoudreUrlFichier(
                      publication.photos?.[0]?.url_fichier ?? publication.image_couverture_url,
                    )
                    const date = formaterDatePublication(publication.date_publication)
                    const cheminDetail = estPubliee
                      ? `/projets-partenariats/publication/${publication.id}`
                      : `/presidence/publications/${publication.projet_id}`

                    return (
                      <tr key={publication.id} className="hover:bg-[var(--color-page-bg)]">
                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <Link
                            to={cheminDetail}
                            aria-label={
                              estPubliee
                                ? `Ouvrir le détail de la publication ${publication.titre}`
                                : `Ouvrir l'éditeur de la publication ${publication.titre}`
                            }
                            className="flex items-center gap-3 text-[var(--color-text-primary)] hover:text-[var(--color-brand)]"
                          >
                            {urlVignette ? (
                              <img
                                src={urlVignette}
                                alt=""
                                loading="lazy"
                                className="h-9 w-9 flex-shrink-0 rounded-lg border border-[var(--color-border)] object-cover"
                              />
                            ) : (
                              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-page-bg)]">
                                <ImageIcon className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true" />
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block max-w-[16rem] truncate font-semibold" title={publication.titre}>
                                {publication.titre}
                              </span>
                              <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
                                {nbPhotos} {pluriel(nbPhotos, "photo", "photos")}
                              </span>
                            </span>
                          </Link>
                        </td>

                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                          <StatusBadge
                            libelle={libelleStatutPublication(publication.statut)}
                            tonalite={estPubliee ? "actif" : "brouillon"}
                          />
                        </td>

                        <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                          {date ? (
                            <span className="tabular-nums">{date}</span>
                          ) : (
                            <span aria-label="Date non renseignée">—</span>
                          )}
                        </td>

                        <td className="whitespace-nowrap border-b border-[var(--color-border)] px-[18px] py-[13px] text-right">
                          <div className="inline-flex items-center gap-1">
                            {estPubliee ? (
                              <a
                                href={`/projets-partenariats/publication/${publication.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Voir sur l'espace public"
                                aria-label={`Voir « ${publication.titre} » sur l'espace public`}
                                className={`${classeIconeAction} hover:text-[var(--color-brand)]`}
                              >
                                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                              </a>
                            ) : null}

                            {peutModifier ? (
                              <Link
                                to={`/presidence/publications/${publication.projet_id}`}
                                title="Modifier"
                                aria-label={`Modifier « ${publication.titre} »`}
                                className={`${classeIconeAction} hover:text-[var(--color-brand)]`}
                              >
                                <Pencil className="h-4 w-4" aria-hidden="true" />
                              </Link>
                            ) : null}

                            {peutModifier && estPubliee ? (
                              <button
                                type="button"
                                title="Retirer de l'espace public"
                                aria-label={`Retirer « ${publication.titre} » de l'espace public`}
                                onClick={() => ouvrirAction(publication, "RETIRER")}
                                className={`${classeIconeAction} hover:text-[var(--status-expire-fg)]`}
                              >
                                <EyeOff className="h-4 w-4" aria-hidden="true" />
                              </button>
                            ) : null}

                            {peutModifier && !estPubliee ? (
                              <button
                                type="button"
                                title="Publier"
                                aria-label={`Publier « ${publication.titre} »`}
                                onClick={() => ouvrirAction(publication, "PUBLIER")}
                                className={`${classeIconeAction} hover:text-[var(--status-actif-fg)]`}
                              >
                                <Globe className="h-4 w-4" aria-hidden="true" />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {meta ? <TablePagination meta={meta} onChangerPage={setPage} /> : null}
          </PanelBody>
        )}
      </Panel>

      {cible ? (
        <ModaleStatutPublication
          action={cible.action}
          titrePublication={cible.publication.titre}
          enCours={changerStatut.isPending}
          erreur={changerStatut.isError ? messageErreur(changerStatut.error) : null}
          onConfirmer={confirmerAction}
          onAnnuler={fermerModale}
        />
      ) : null}

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg dark:bg-emerald-500 dark:text-emerald-950"
        >
          {toast}
        </div>
      ) : null}
    </div>
  )
}
