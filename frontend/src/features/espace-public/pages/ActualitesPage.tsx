// Liste des actualités publiques, triées de la plus récente à la plus ancienne.
import { useMemo, useState } from "react"
import { Newspaper, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { useMediaQuery } from "@/lib/ecran"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

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
    for (const publication of publications) {
      const courant = publication.projet.etablissement
      if (courant) noms.set(courant.id, courant.sigle ?? courant.nom)
    }
    return [...noms.entries()].sort((a, b) => a[1].localeCompare(b[1], "fr"))
  }, [publications])

  const filtrees = useMemo(() => {
    const terme = rechercheDifferee.trim().toLowerCase()
    return publications.filter((publication) => {
      if (etablissement !== TOUS && publication.projet.etablissement?.id !== etablissement) return false
      if (!terme) return true
      return `${publication.titre} ${publication.description_publique ?? ""} ${publication.projet.nom}`
        .toLowerCase()
        .includes(terme)
    })
  }, [publications, rechercheDifferee, etablissement])

  const totalPages = Math.max(1, Math.ceil(filtrees.length / PAR_PAGE))
  const pageCourante = Math.min(page, totalPages)
  const grille = mobile
    ? filtrees.slice(0, visibles)
    : filtrees.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE)

  function changerRecherche(valeur: string) {
    setRecherche(valeur)
    setPage(1)
    setVisibles(PAR_CHARGEMENT)
  }

  function changerEtablissement(valeur: string) {
    setEtablissement(valeur)
    setPage(1)
    setVisibles(PAR_CHARGEMENT)
  }

  return (
    <div className="vt-liste-page">
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Actualités" }]} />
      </div>
      <PageHeaderPublique
        surTitre="DERNIÈRES PUBLICATIONS"
        titre="Nos"
        titreAccent="Actualités"
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
            onChange={(event) => changerRecherche(event.target.value)}
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
            <div className="vt-card-list">
              {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-96 rounded-md" />)}
            </div>
          )}

          {requete.isError && (
            <EmptyState
              icone={Newspaper}
              titre="Les actualités n'ont pas pu être chargées"
              description="Vérifiez votre connexion puis réessayez."
              action={<Button variant="outline" onClick={() => requete.refetch()}>Réessayer</Button>}
            />
          )}

          {!requete.isLoading && !requete.isError && filtrees.length === 0 && (
            <EmptyState
              icone={Search}
              titre="Aucune actualité trouvée"
              description="Essayez d'autres mots-clés ou retirez le filtre d'établissement."
            />
          )}

          {!requete.isLoading && !requete.isError && grille.length > 0 && (
            <RevealGroup className="vt-card-list vt-mt" direction="right">
              {grille.map((publication) => (
                <RevealItem key={publication.id} className="vt-card-list-item">
                  <CartePublication
                    publication={publication}
                    lien={`/actualites/${publication.id}`}
                  />
                </RevealItem>
              ))}
            </RevealGroup>
          )}

          {mobile && filtrees.length > visibles && (
            <div className="vt-center vt-mt">
              <Button variant="outline" className="rounded-md" onClick={() => setVisibles((courant) => courant + PAR_CHARGEMENT)}>
                Charger plus
              </Button>
            </div>
          )}

          {!mobile && totalPages > 1 && (
            <nav aria-label="Pagination" className="vt-pager">
              <Button variant="outline" size="sm" disabled={pageCourante <= 1} onClick={() => setPage(pageCourante - 1)}>
                Précédent
              </Button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className="vt-pager-num"
                  aria-current={pageCourante === index + 1 ? "page" : undefined}
                  aria-label={`Page ${index + 1}`}
                  onClick={() => setPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <Button variant="outline" size="sm" disabled={pageCourante >= totalPages} onClick={() => setPage(pageCourante + 1)}>
                Suivant
              </Button>
            </nav>
          )}
        </div>
      </section>
    </div>
  )
}
