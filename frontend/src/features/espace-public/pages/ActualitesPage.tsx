// src/features/espace-public/pages/ActualitesPage.tsx
// Liste des actualites : publications de la Presidence (API publique uniquement).
// Recherche, filtre par etablissement, une actualite a la une, grille de 3 colonnes,
// pagination numerotee sur ordinateur et bouton "Charger plus" sur mobile.
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { CalendarDays, Landmark, Newspaper, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { useMediaQuery } from "@/lib/ecran"
import { formaterDate } from "@/lib/format"
import type { PublicationPublique } from "@/types/api"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { Illustration } from "@/features/espace-public/components/Illustrations"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { imagePrincipalePublication, resumePublication } from "@/features/espace-public/lib/publique"
import { Reveal, RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

const TOUS = "tous"
const PAR_PAGE = 9
const PAR_CHARGEMENT = 6

export function ActualitesPage() {
  const requete = usePublicPublications({ limit: 100 })
  const publications = useMemo(
    () => [...(requete.data?.data ?? [])].sort((premiere, seconde) =>
      (seconde.date_publication ?? "").localeCompare(premiere.date_publication ?? ""),
    ),
    [requete.data],
  )
  const mobile = useMediaQuery("(max-width: 639px)")

  const [recherche, setRecherche] = useState("")
  const rechercheDifferee = useDebounce(recherche, 250)
  const [etablissement, setEtablissement] = useState(TOUS)
  const [page, setPage] = useState(1)
  const [visibles, setVisibles] = useState(PAR_CHARGEMENT)

  const etablissements = useMemo(() => {
    const noms = new Map<string, string>()
    for (const p of publications) {
      const e = p.projet.etablissement
      if (e) noms.set(e.id, e.sigle ?? e.nom)
    }
    return [...noms.entries()].sort((a, b) => a[1].localeCompare(b[1], "fr"))
  }, [publications])

  const filtrees = useMemo(() => {
    const terme = rechercheDifferee.trim().toLowerCase()
    return publications.filter((p) => {
      if (etablissement !== TOUS && p.projet.etablissement?.id !== etablissement) return false
      if (!terme) return true
      return `${p.titre} ${p.description_publique ?? ""} ${p.projet.nom}`.toLowerCase().includes(terme)
    })
  }, [publications, rechercheDifferee, etablissement])

  const enAvant: PublicationPublique | undefined = filtrees[0]
  const imageEnAvant = enAvant ? imagePrincipalePublication(enAvant) : null
  const photoEnAvant = enAvant
    ? [...enAvant.photos].sort((premiere, seconde) => premiere.ordre - seconde.ordre)[0]
    : undefined
  const altImageEnAvant = enAvant?.image_couverture_url
    ? enAvant.titre
    : photoEnAvant?.legende || enAvant?.titre || ""
  const reste = filtrees.slice(1)
  const totalPages = Math.max(1, Math.ceil(reste.length / PAR_PAGE))
  const pageCourante = Math.min(page, totalPages)
  const grille = mobile ? reste.slice(0, visibles) : reste.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE)

  const changerRecherche = (valeur: string) => {
    setRecherche(valeur)
    setPage(1)
    setVisibles(PAR_CHARGEMENT)
  }
  const changerEtablissement = (valeur: string) => {
    setEtablissement(valeur)
    setPage(1)
    setVisibles(PAR_CHARGEMENT)
  }

  return (
    <div>
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Actualités" }]} />
      </div>
      <PageHeaderPublique
        etiquette="Publications"
        icone={Newspaper}
        titre="Actualités"
        description="Les publications de la Présidence de l'université, de la plus récente à la plus ancienne."
      >
        <label htmlFor="recherche-actualites" className="sr-only">
          Rechercher une actualité
        </label>
        <div className="vt-search">
          <Search size={16} aria-hidden="true" />
          <Input
            id="recherche-actualites"
            type="search"
            placeholder="Rechercher une actualité"
            value={recherche}
            onChange={(e) => changerRecherche(e.target.value)}
          />
        </div>
      </PageHeaderPublique>

      <section className="vt-section" aria-label="Liste des actualités">
        <div className="vt-wrap">
          {etablissements.length > 1 && (
            <div className="vt-filters" role="group" aria-label="Filtrer par établissement">
              <button
                type="button"
                className="vt-chip"
                aria-pressed={etablissement === TOUS}
                onClick={() => changerEtablissement(TOUS)}
              >
                Tous
              </button>
              {etablissements.map(([id, libelle]) => (
                <button
                  key={id}
                  type="button"
                  className="vt-chip"
                  aria-pressed={etablissement === id}
                  onClick={() => changerEtablissement(id)}
                >
                  {libelle}
                </button>
              ))}
            </div>
          )}

          {requete.isLoading && (
            <div className="vt-grid-p">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-96 rounded-2xl" />
              ))}
            </div>
          )}

          {requete.isError && (
            <EmptyState
              icone={Newspaper}
              titre="Les actualités n'ont pas pu être chargées"
              description="Vérifiez votre connexion puis réessayez."
              action={
                <Button variant="outline" onClick={() => requete.refetch()}>
                  Réessayer
                </Button>
              }
            />
          )}

          {!requete.isLoading && !requete.isError && filtrees.length === 0 && (
            <EmptyState
              icone={Search}
              titre="Aucune actualité trouvée"
              description="Essayez d'autres mots-clés ou retirez le filtre d'établissement."
            />
          )}

          {enAvant && (
            <Reveal direction="right">
              <article className="vt-feat vt-pub">
              <Link to={`/projets-partenariats/publication/${enAvant.id}`} className="vt-feat-lien">
                <div className="vt-feat-cover vt-pub-cover">
                  {imageEnAvant ? (
                    <motion.img
                      layoutId={`cover-${enAvant.id}`}
                      src={imageEnAvant}
                      alt={altImageEnAvant}
                      className="vt-art-img"
                      decoding="async"
                    />
                  ) : (
                    <div role="img" aria-label={`Illustration neutre de ${enAvant.titre}`}>
                      <Illustration type="montagne" />
                    </div>
                  )}
                </div>
                <div className="vt-pub-body">
                  <span className="vt-badge vt-badge-info">À la une</span>
                  <h2>{enAvant.titre}</h2>
                  <p>{resumePublication(enAvant)}</p>
                  <div className="vt-meta">
                    <span>
                      <Landmark aria-hidden="true" />
                      {enAvant.projet.etablissement?.sigle ?? enAvant.projet.etablissement?.nom ?? "Présidence"}
                    </span>
                    {enAvant.date_publication && (
                      <span>
                        <CalendarDays aria-hidden="true" />
                        {formaterDate(enAvant.date_publication)}
                      </span>
                    )}
                  </div>
                  <span className="vt-link">Lire l'actualité</span>
                </div>
              </Link>
              </article>
            </Reveal>
          )}

          {grille.length > 0 && (
            <RevealGroup className="vt-grid-p vt-mt" direction="right">
              {grille.map((publication) => (
                <RevealItem key={publication.id} className="h-full">
                  <CartePublication
                    publication={publication}
                    lien={`/projets-partenariats/publication/${publication.id}`}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          )}

          {mobile && reste.length > visibles && (
            <div className="vt-center vt-mt">
              <Button variant="outline" className="rounded-full" onClick={() => setVisibles((v) => v + PAR_CHARGEMENT)}>
                Charger plus
              </Button>
            </div>
          )}

          {!mobile && totalPages > 1 && (
            <nav aria-label="Pagination" className="vt-pager">
              <Button variant="outline" size="sm" disabled={pageCourante <= 1} onClick={() => setPage(pageCourante - 1)}>
                Précédent
              </Button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className="vt-pager-num"
                  aria-current={pageCourante === i + 1 ? "page" : undefined}
                  aria-label={`Page ${i + 1}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                disabled={pageCourante >= totalPages}
                onClick={() => setPage(pageCourante + 1)}
              >
                Suivant
              </Button>
            </nav>
          )}
        </div>
      </section>
    </div>
  )
}
