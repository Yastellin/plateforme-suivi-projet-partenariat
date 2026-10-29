// Liste magazine des actualités publiques, triées de la plus récente à la plus ancienne.
import { useMemo, useState } from "react"
import { Archive, CalendarDays, Newspaper, Search } from "lucide-react"
import { Link } from "react-router-dom"
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
import { imagePrincipalePublication } from "@/features/espace-public/lib/publique"
import { ImageDefaut } from "@/features/espace-public/components/ImageDefaut"

const TOUS = "tous"
const PAR_PAGE = 9
const PAR_CHARGEMENT = 6

function libellerArchive(mois: string): string {
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" })
    .format(new Date(`${mois}-01T12:00:00`))
}

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
  const [archive, setArchive] = useState(TOUS)
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
  const archives = useMemo(() => {
    const comptes = new Map<string, number>()
    for (const publication of publications) {
      const mois = publication.date_publication?.slice(0, 7)
      if (mois && /^\d{4}-\d{2}$/.test(mois)) comptes.set(mois, (comptes.get(mois) ?? 0) + 1)
    }
    return [...comptes.entries()].sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 12)
      .map(([mois, compte]) => ({ mois, compte, libelle: libellerArchive(mois) }))
  }, [publications])

  const filtrees = useMemo(() => {
    const terme = rechercheDifferee.trim().toLowerCase()
    return publications.filter((publication) => {
      if (etablissement !== TOUS && publication.projet.etablissement?.id !== etablissement) return false
      if (archive !== TOUS && !publication.date_publication?.startsWith(archive)) return false
      if (!terme) return true
      return `${publication.titre} ${publication.description_publique ?? ""} ${publication.projet.nom}`
        .toLowerCase()
        .includes(terme)
    })
  }, [publications, rechercheDifferee, etablissement, archive])

  const totalPages = Math.max(1, Math.ceil(filtrees.length / PAR_PAGE))
  const pageCourante = Math.min(page, totalPages)
  const articles = mobile
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

  function changerArchive(valeur: string) {
    setArchive(valeur)
    setPage(1)
    setVisibles(PAR_CHARGEMENT)
  }

  const plusRecentes = publications.slice(0, 3)

  return (
    <div className="vt-liste-page vt-actualites-page">
      <div className="vt-wrap vt-pad-top vt-breadcrumb-centre">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Actualités" }]} />
      </div>
      <PageHeaderPublique
        surTitre="PUBLICATIONS DE L'UNIVERSITÉ"
        titre="Toutes nos"
        titreAccent="Actualités"
        description="Les actualités publiques, classées de la plus récente à la plus ancienne."
      />

      <div className="vt-filter-bar-sticky vt-news-filter-sticky">
        <div className="vt-wrap">
          <div className="vt-news-filter-bar">
            <div className="vt-filter-group" role="group" aria-label="Filtrer par établissement">
              <button type="button" className="vt-filter-pill" aria-pressed={etablissement === TOUS} onClick={() => changerEtablissement(TOUS)}>Tous</button>
              {etablissements.map(([id, libelle]) => (
                <button key={id} type="button" className="vt-filter-pill" aria-pressed={etablissement === id} onClick={() => changerEtablissement(id)}>{libelle}</button>
              ))}
            </div>
            <div className="vt-search vt-news-search">
              <Search size={16} aria-hidden="true" />
              <label htmlFor="recherche-actualites" className="sr-only">Rechercher une actualité</label>
              <Input id="recherche-actualites" type="search" placeholder="Rechercher une actualité" value={recherche} onChange={(event) => changerRecherche(event.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <section className="vt-section" aria-label="Liste des actualités">
        <div className="vt-wrap">
          {requete.isLoading && <div className="vt-news-layout"><div className="vt-news-list">{[...Array(3)].map((_, index) => <Skeleton key={index} className="h-52 rounded-xl" />)}</div></div>}
          {requete.isError && <EmptyState icone={Newspaper} titre="Les actualités n'ont pas pu être chargées" description="Vérifiez votre connexion puis réessayez." action={<Button variant="outline" onClick={() => requete.refetch()}>Réessayer</Button>} />}
          {!requete.isLoading && !requete.isError && filtrees.length === 0 && (
            <EmptyState icone={Search} titre="Aucune actualité trouvée" description="Essayez d'autres mots-clés ou retirez un filtre." />
          )}
          {!requete.isLoading && !requete.isError && articles.length > 0 && (
            <>
              <p className="vt-results-count" aria-live="polite">Affichage de {articles.length} actualités sur {filtrees.length}</p>
              <div className="vt-news-layout">
                <main className="vt-news-main" aria-label="Actualités">
                  <RevealGroup className="vt-news-list" direction="right">
                    {articles.map((publication, index) => (
                      <RevealItem key={publication.id} className="vt-news-list-reveal">
                        <CartePublication publication={publication} lien={`/actualites/${publication.id}`} className={`vt-news-list-item${index === 0 ? " vt-news-featured" : ""}`} />
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </main>
                <aside className="vt-news-sidebar" aria-label="Autres actualités et archives">
                  <section className="vt-news-widget">
                    <h2>Actualités récentes</h2>
                    <ul className="vt-news-recent-list">
                      {plusRecentes.map((publication) => {
                        const image = imagePrincipalePublication(publication)
                        return (
                          <li key={publication.id}>
                            <Link to={`/actualites/${publication.id}`}>
                              <span className="vt-news-thumb">
                                {image ? <img src={image} alt="" loading="lazy" decoding="async" /> : <ImageDefaut alt="" className="vt-image-defaut" />}
                              </span>
                              <span className="vt-news-recent-title">{publication.titre}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                  <section className="vt-news-widget">
                    <h2><Archive size={18} aria-hidden="true" /> Archives</h2>
                    <ul className="vt-news-archive-list">
                      {archives.map(({ mois, compte, libelle }) => (
                        <li key={mois}>
                          <button type="button" aria-pressed={archive === mois} onClick={() => changerArchive(archive === mois ? TOUS : mois)}>
                            <span><CalendarDays size={14} aria-hidden="true" /> {libelle}</span><span>({compte})</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>
                </aside>
              </div>
            </>
          )}

          {mobile && filtrees.length > visibles && (
            <div className="vt-center vt-mt">
              <Button variant="outline" className="rounded-md" onClick={() => setVisibles((courant) => courant + PAR_CHARGEMENT)}>Charger plus</Button>
            </div>
          )}
          {!mobile && totalPages > 1 && (
            <nav aria-label="Pagination" className="vt-pager">
              <Button variant="outline" size="sm" disabled={pageCourante <= 1} onClick={() => setPage(pageCourante - 1)}>Précédent</Button>
              {[...Array(totalPages)].map((_, index) => (
                <button key={index} type="button" className="vt-pager-num" aria-current={pageCourante === index + 1 ? "page" : undefined} aria-label={`Page ${index + 1}`} onClick={() => setPage(index + 1)}>{index + 1}</button>
              ))}
              <Button variant="outline" size="sm" disabled={pageCourante >= totalPages} onClick={() => setPage(pageCourante + 1)}>Suivant</Button>
            </nav>
          )}
        </div>
      </section>
    </div>
  )
}
