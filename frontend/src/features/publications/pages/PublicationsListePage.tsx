// src/features/publications/pages/PublicationsListePage.tsx

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  EyeOff,
  Globe,
  Image as ImageIcon,
  Pencil,
  Search,
} from "lucide-react"

import apiClient from "@/lib/api-client"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { resoudreUrlFichier } from "@/lib/url"
import type { Publication } from "@/types/api"
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

const LIMITE = 25

const BOUTON_ACTION =
  "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors disabled:opacity-60"
const BOUTON_SECONDAIRE =
  `${BOUTON_ACTION} border border-slate-300 text-slate-700 hover:bg-black/5 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10`
const BOUTON_RETIRER =
  `${BOUTON_ACTION} border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-400/30 dark:text-red-400 dark:hover:bg-red-400/10`
const BOUTON_PUBLIER =
  `${BOUTON_ACTION} bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400`

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

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Publications
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {compteurs
              ? `${totalToutes} ${pluriel(totalToutes, "publication", "publications")} ${pluriel(totalToutes, "enregistrée", "enregistrées")}`
              : "Chargement…"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-100 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-300">
            <span className="text-lg font-bold tabular-nums">{totalPubliees}</span>
            {pluriel(totalPubliees, "publiée", "publiées")}
          </span>
          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-200/70 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-300">
            <span className="text-lg font-bold tabular-nums">{totalBrouillons}</span>
            {pluriel(totalBrouillons, "brouillon", "brouillons")}
          </span>
        </div>
      </header>

      <section className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white dark:border-white/10 dark:bg-white/[.04]">
        <div className="flex flex-wrap items-center gap-3 p-4">
          <label className="relative w-full sm:w-80">
            <span className="sr-only">Rechercher une publication</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              aria-hidden="true"
            />
            <input
              type="search"
              value={recherche}
              onChange={(evenement) => {
                setRecherche(evenement.target.value)
                setPage(1)
              }}
              placeholder="Rechercher une publication…"
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 dark:border-white/15 dark:bg-white/5 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </label>

          <div
            role="group"
            aria-label="Filtrer par statut"
            className="inline-flex rounded-xl bg-black/5 p-1 sm:ml-auto dark:bg-white/10"
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
                  className={`inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-colors ${
                    actif
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-emerald-500 dark:text-emerald-950"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                >
                  {segment.libelle}
                  <span className="tabular-nums">{segment.nombre}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="overflow-x-auto border-t border-black/5 dark:border-white/10">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-slate-50 dark:bg-white/5">
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th scope="col" className="px-4 py-3 font-semibold">Publication</th>
                <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
                <th scope="col" className="px-4 py-3 font-semibold">Date de publication</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {listeQuery.isLoading ? (
                [0, 1, 2, 3, 4].map((cle) => (
                  <tr key={cle}>
                    <td colSpan={4} className="px-4 py-3">
                      <div className="h-12 animate-pulse rounded-lg bg-black/5 dark:bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : listeQuery.isError ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    Impossible de charger les publications.
                  </td>
                </tr>
              ) : donnees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-500 dark:text-slate-400">
                    {estFiltree
                      ? "Aucune publication ne correspond à votre recherche."
                      : "Aucune publication n'a encore été créée."}
                  </td>
                </tr>
              ) : (
                donnees.map((publication) => {
                  const estPubliee = publication.statut === "PUBLIEE"
                  const nbPhotos = publication.photos?.length ?? 0
                  const urlVignette = resoudreUrlFichier(
                    publication.photos?.[0]?.url_fichier ?? publication.image_couverture_url,
                  )
                  const date = formaterDatePublication(publication.date_publication)

                  return (
                    <tr key={publication.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[.03]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-100 to-slate-200 dark:from-emerald-400/15 dark:to-white/10">
                              {urlVignette ? (
                                <img src={urlVignette} alt="" loading="lazy" className="h-full w-full object-cover" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-slate-500 dark:text-slate-400" aria-hidden="true" />
                              )}
                            </div>
                            {nbPhotos > 0 ? (
                              <span
                                aria-hidden="true"
                                className="absolute -bottom-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-slate-700 ring-2 ring-white dark:bg-[#0e1714] dark:text-slate-200 dark:ring-[#0e1714]"
                              >
                                {nbPhotos}
                              </span>
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            <Link
                              to={
                                estPubliee
                                  ? `/projets-partenariats/publication/${publication.id}`
                                  : `/presidence/publications/${publication.projet_id}`
                              }
                              aria-label={
                                estPubliee
                                  ? `Ouvrir le détail de la publication ${publication.titre}`
                                  : `Ouvrir l'éditeur de la publication ${publication.titre}`
                              }
                              title={publication.titre}
                              className="block max-w-[16rem] truncate font-semibold text-slate-900 hover:text-emerald-700 hover:underline dark:text-white dark:hover:text-emerald-300"
                            >
                              {publication.titre}
                            </Link>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {nbPhotos} {pluriel(nbPhotos, "photo", "photos")}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            estPubliee
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${estPubliee ? "bg-emerald-500 dark:bg-emerald-300" : "bg-slate-400 dark:bg-slate-400"}`}
                          />
                          {libelleStatutPublication(publication.statut)}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        {date ? (
                          <span className="tabular-nums text-slate-700 dark:text-slate-300">{date}</span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400" aria-label="Date non renseignée">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          {estPubliee ? (
                            <a
                              href={`/projets-partenariats/publication/${publication.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Voir sur l'espace public"
                              aria-label={`Voir « ${publication.titre} » sur l'espace public`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-black/5 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
                            >
                              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          ) : null}

                          {peutModifier ? (
                            <Link
                              to={`/presidence/publications/${publication.projet_id}`}
                              title={`Modifier « ${publication.titre} »`}
                              aria-label={`Modifier « ${publication.titre} »`}
                              className={BOUTON_SECONDAIRE}
                            >
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                              Modifier
                            </Link>
                          ) : null}

                          {peutModifier && estPubliee ? (
                            <button
                              type="button"
                              onClick={() => ouvrirAction(publication, "RETIRER")}
                              className={BOUTON_RETIRER}
                            >
                              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                              Retirer
                            </button>
                          ) : null}

                          {peutModifier && !estPubliee ? (
                            <button
                              type="button"
                              onClick={() => ouvrirAction(publication, "PUBLIER")}
                              className={BOUTON_PUBLIER}
                            >
                              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
                              Publier
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.total > 0 ? (
          <div className="flex items-center justify-between gap-3 border-t border-black/5 px-4 py-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
            <span className="tabular-nums">
              {(meta.page - 1) * meta.limit + 1}–{Math.min(meta.page * meta.limit, meta.total)} sur {meta.total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Page précédente"
                title="Page précédente"
                disabled={meta.page <= 1}
                onClick={() => setPage((valeur) => Math.max(1, valeur - 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-black/5 disabled:opacity-40 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Page suivante"
                title="Page suivante"
                disabled={meta.page >= meta.totalPages}
                onClick={() => setPage((valeur) => valeur + 1)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-700 hover:bg-black/5 disabled:opacity-40 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : null}
      </section>

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
