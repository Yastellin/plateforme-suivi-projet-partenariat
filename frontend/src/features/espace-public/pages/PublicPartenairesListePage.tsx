// Liste complète des partenaires publiquement visibles.
import { useState } from "react"
import { Link } from "react-router-dom"
import { Building2, ChevronLeft, ChevronRight, Handshake, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { usePublicTousPartenaires } from "@/features/espace-public/api/usePublicDonneesDetail"
import { PageListePublique } from "@/features/espace-public/components/PageListePublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"
import type { PartenairePublic } from "@/types/api"

const TAILLE_PAGE = 12
const TOUS = "tous"

function uniques(valeurs: string[]): string[] {
  return [...new Set(valeurs.filter(Boolean))].sort((premier, second) => premier.localeCompare(second, "fr"))
}

function libellerType(type: string): string {
  const libelle = type.replaceAll("_", " ").toLocaleLowerCase("fr")
  return libelle.charAt(0).toLocaleUpperCase("fr") + libelle.slice(1)
}

function TuileLogoPartenaire({ partenaire }: { partenaire: PartenairePublic }) {
  return (
    <Link
      to={`/partenaires/${partenaire.id}`}
      className="vt-logo-tile vt-partenaire-logo"
      aria-label={`Voir le partenaire ${partenaire.nom}, ${partenaire.pays}`}
    >
      {partenaire.logo_url ? (
        <span className="vt-partenaire-logo-image">
          <img src={partenaire.logo_url} alt="" loading="lazy" decoding="async" />
        </span>
      ) : null}
      <strong>{partenaire.nom}</strong>
      <span className="vt-partenaire-pays">{partenaire.pays}</span>
    </Link>
  )
}

export function PublicPartenairesListePage() {
  const [recherche, setRecherche] = useState("")
  const [pays, setPays] = useState(TOUS)
  const [type, setType] = useState(TOUS)
  const [page, setPage] = useState(1)
  const rechercheDifferee = useDebounce(recherche, 250)
  const optionsRequete = usePublicTousPartenaires()
  const requete = usePublicPartenaires({
    recherche: rechercheDifferee || undefined,
    pays: pays === TOUS ? undefined : pays,
    type: type === TOUS ? undefined : type,
    page,
    limit: TAILLE_PAGE,
  })
  const partenaires = requete.data?.data ?? []
  const tousLesPartenaires = optionsRequete.data ?? []
  const paysDisponibles = uniques(tousLesPartenaires.map((partenaire) => partenaire.pays))
  const typesDisponibles = uniques(tousLesPartenaires.map((partenaire) => partenaire.type))

  function changerRecherche(valeur: string) {
    setRecherche(valeur)
    setPage(1)
  }

  function changerPays(valeur: string) {
    setPays(valeur)
    setPage(1)
  }

  function changerType(valeur: string) {
    setType(valeur)
    setPage(1)
  }

  return (
    <PageListePublique
      filAriane={[{ label: "Accueil", href: "/" }, { label: "Partenaires" }]}
      surTitre="Réseau d'excellence"
      titre={<>Tous nos <span>Partenaires</span></>}
      description="Les entreprises, institutions et universités qui collaborent avec l'Université de Fianarantsoa."
      filtres={(
        <div className="vt-partner-list-filters">
          <label className="vt-list-select-field">
            <span>Pays</span>
            <select className="vt-list-select" value={pays} onChange={(event) => changerPays(event.target.value)}>
              <option value={TOUS}>Tous les pays</option>
              {paysDisponibles.map((valeur) => <option key={valeur} value={valeur}>{valeur}</option>)}
            </select>
          </label>
          <label className="vt-list-select-field">
            <span>Type</span>
            <select className="vt-list-select" value={type} onChange={(event) => changerType(event.target.value)}>
              <option value={TOUS}>Tous les types</option>
              {typesDisponibles.map((valeur) => <option key={valeur} value={valeur}>{libellerType(valeur)}</option>)}
            </select>
          </label>
        </div>
      )}
      recherche={(
        <>
          <Search size={17} aria-hidden="true" />
          <label htmlFor="recherche-partenaires" className="sr-only">Rechercher un partenaire</label>
          <Input
            id="recherche-partenaires"
            type="search"
            placeholder="Rechercher un partenaire..."
            value={recherche}
            onChange={(event) => changerRecherche(event.target.value)}
          />
        </>
      )}
      compteurResultats={!requete.isLoading && !requete.isError && requete.data ? `${requete.data.meta.total} résultats trouvés` : undefined}
    >
      {requete.isLoading && (
        <div className="vt-logo-grid vt-partner-list-grid" aria-busy="true" aria-label="Chargement des partenaires">
          {[...Array(8)].map((_, index) => <Skeleton key={index} className="aspect-square w-full" />)}
        </div>
      )}
      {requete.isError && (
        <EmptyState
          icone={Handshake}
          titre="Les partenaires n'ont pas pu être chargés"
          description="Vérifiez votre connexion puis réessayez."
          action={<Button variant="outline" onClick={() => requete.refetch()}>Réessayer</Button>}
        />
      )}
      {!requete.isLoading && !requete.isError && partenaires.length === 0 && (
        <EmptyStateSection
          icone={<Building2 aria-hidden="true" />}
          titre="La liste des partenaires arrive bientôt"
          description={recherche.trim() || pays !== TOUS || type !== TOUS
            ? "Aucun résultat ne correspond à votre recherche ou aux filtres sélectionnés. Essayez d'autres critères."
            : "Découvrez les organisations et institutions qui collaborent avec l'Université de Fianarantsoa."}
        />
      )}
      {!requete.isLoading && !requete.isError && partenaires.length > 0 && (
        <>
          <RevealGroup className="vt-logo-grid vt-partner-list-grid" direction="left">
            {partenaires.map((partenaire) => (
              <RevealItem key={partenaire.id} className="vt-logo-grid-item">
                <TuileLogoPartenaire partenaire={partenaire} />
              </RevealItem>
            ))}
          </RevealGroup>
          {(requete.data?.meta.totalPages ?? 0) > 1 && (
            <nav className="vt-pager" aria-label="Pagination des partenaires">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((courante) => courante - 1)}>
                <ChevronLeft size={16} /> Précédent
              </Button>
              <span>Page {page} sur {requete.data?.meta.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= (requete.data?.meta.totalPages ?? 1)} onClick={() => setPage((courante) => courante + 1)}>
                Suivant <ChevronRight size={16} />
              </Button>
            </nav>
          )}
        </>
      )}
    </PageListePublique>
  )
}
