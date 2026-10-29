// Liste publique des projets : filtres, time-cards et pagination.
import { useMemo, useState } from "react"
import { FolderKanban, FolderOpen, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { usePublicProjets } from "@/features/espace-public/api/usePublicProjets"
import { CarteProjetTimeCard } from "@/features/espace-public/components/CartesPubliques"
import { PageListePublique } from "@/features/espace-public/components/PageListePublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"

const TOUS = "tous"
const PAR_PAGE = 9
const STATUTS = [
  { valeur: TOUS, libelle: "Tous" },
  { valeur: "EN_COURS", libelle: "En cours" },
  { valeur: "EN_ATTENTE", libelle: "En attente" },
  { valeur: "TERMINE", libelle: "Terminés" },
]

interface Filtres {
  recherche: string
  domaine: string
  statut: string
}

function libellerDomaine(domaine: string): string {
  const valeur = domaine.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
  if (valeur.includes("recherche")) return "Recherche"
  if (valeur.includes("formation")) return "Formation"
  if (valeur.includes("innovation")) return "Innovation"
  if (valeur.includes("infrastructure")) return "Infrastructure"
  return domaine.replaceAll("_", " ")
}

function FiltresProjets({
  filtres,
  domaines,
  onChange,
}: {
  filtres: Filtres
  domaines: string[]
  onChange: (filtres: Filtres) => void
}) {
  return (
    <div className="vt-project-list-filters">
      <div className="vt-filter-group vt-project-filter-status-group" role="group" aria-label="Filtrer par statut">
        {STATUTS.map((statut) => (
          <button key={statut.valeur} type="button" className="vt-filter-btn" aria-pressed={filtres.statut === statut.valeur} onClick={() => onChange({ ...filtres, statut: statut.valeur })}>
            {statut.libelle}
          </button>
        ))}
      </div>
      <div className="vt-filter-group vt-project-filter-domain-group" role="group" aria-label="Filtrer par domaine">
        <button type="button" className="vt-filter-btn" aria-pressed={filtres.domaine === TOUS} onClick={() => onChange({ ...filtres, domaine: TOUS })}>Tous les domaines</button>
        {domaines.map((domaine) => (
          <button key={domaine} type="button" className="vt-filter-btn" aria-pressed={filtres.domaine === domaine} onClick={() => onChange({ ...filtres, domaine })}>
            {libellerDomaine(domaine)}
          </button>
        ))}
      </div>
    </div>
  )
}

export function PublicProjetsListePage() {
  const requete = usePublicProjets({ page: 1, limit: 100 })
  const projets = useMemo(() => requete.data?.data ?? [], [requete.data])
  const [filtres, setFiltres] = useState<Filtres>({ recherche: "", domaine: TOUS, statut: TOUS })
  const [page, setPage] = useState(1)
  const rechercheDifferee = useDebounce(filtres.recherche, 250)

  const domaines = useMemo(
    () => [...new Set(projets.map((projet) => projet.domaine).filter((domaine): domaine is string => Boolean(domaine)))].sort((a, b) => a.localeCompare(b, "fr")),
    [projets],
  )

  const affiches = useMemo(() => {
    const terme = rechercheDifferee.trim().toLowerCase()
    return projets.filter((projet) => {
      if (filtres.statut !== TOUS && projet.statut !== filtres.statut) return false
      if (filtres.domaine !== TOUS && projet.domaine !== filtres.domaine) return false
      if (!terme) return true
      return `${projet.nom} ${projet.intitule_officiel ?? ""} ${projet.domaine ?? ""}`.toLowerCase().includes(terme)
    })
  }, [projets, rechercheDifferee, filtres.domaine, filtres.statut])

  const nombrePages = Math.max(1, Math.ceil(affiches.length / PAR_PAGE))
  const pageCourante = Math.min(page, nombrePages)
  const visibles = affiches.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE)

  function changerFiltres(nouveauxFiltres: Filtres) {
    setFiltres(nouveauxFiltres)
    setPage(1)
  }

  return (
    <PageListePublique
      filAriane={[{ label: "Accueil", href: "/" }, { label: "Projets" }]}
      surTitre="Collaborations actives"
      titre={<>Tous nos <span>Projets</span></>}
      description="Explorez les projets publics de l'université, leurs domaines et leurs établissements partenaires."
      filtres={<FiltresProjets filtres={filtres} domaines={domaines} onChange={changerFiltres} />}
      recherche={(
        <>
          <Search size={17} aria-hidden="true" />
          <label htmlFor="recherche-projets" className="sr-only">Rechercher un projet</label>
          <Input
            id="recherche-projets"
            type="search"
            placeholder="Rechercher un projet..."
            value={filtres.recherche}
            onChange={(event) => changerFiltres({ ...filtres, recherche: event.target.value })}
          />
        </>
      )}
      compteurResultats={!requete.isLoading && !requete.isError ? `${affiches.length} résultats trouvés` : undefined}
    >
      {requete.isLoading && (
        <div className="vt-projects-list vt-projects-list-page" aria-busy="true" aria-label="Chargement des projets">
          {[...Array(4)].map((_, index) => <Skeleton key={index} className="vt-time-card-skeleton rounded-xl" />)}
        </div>
      )}
      {requete.isError && (
        <EmptyState icone={FolderKanban} titre="Les projets n'ont pas pu être chargés" description="Vérifiez votre connexion puis réessayez." action={<Button variant="outline" onClick={() => requete.refetch()}>Réessayer</Button>} />
      )}
      {!requete.isLoading && !requete.isError && affiches.length === 0 && (
        <EmptyStateSection
          icone={<FolderOpen aria-hidden="true" />}
          titre="Aucun projet public pour le moment"
          description={filtres.recherche.trim() || filtres.domaine !== TOUS || filtres.statut !== TOUS
            ? "Aucun résultat ne correspond à votre recherche ou aux filtres sélectionnés. Essayez d'autres critères."
            : "De nouvelles collaborations sont en cours de finalisation. Les fiches détaillées de nos projets seront disponibles prochainement."}
        />
      )}
      {!requete.isLoading && !requete.isError && visibles.length > 0 && (
        <>
          <RevealGroup className="vt-projects-list vt-projects-list-page" direction="right">
            {visibles.map((projet) => (
              <RevealItem key={projet.id} className="vt-project-time-item">
                <CarteProjetTimeCard projet={projet} lien={`/projets/${projet.id}`} variante="liste" />
              </RevealItem>
            ))}
          </RevealGroup>
          {nombrePages > 1 && (
            <nav aria-label="Pagination des projets" className="vt-pager">
              <Button variant="outline" size="sm" disabled={pageCourante <= 1} onClick={() => setPage(pageCourante - 1)}>Précédent</Button>
              {[...Array(nombrePages)].map((_, index) => (
                <button key={index} type="button" className="vt-pager-num" aria-current={pageCourante === index + 1 ? "page" : undefined} aria-label={`Page ${index + 1}`} onClick={() => setPage(index + 1)}>{index + 1}</button>
              ))}
              <Button variant="outline" size="sm" disabled={pageCourante >= nombrePages} onClick={() => setPage(pageCourante + 1)}>Suivant</Button>
            </nav>
          )}
        </>
      )}
    </PageListePublique>
  )
}
