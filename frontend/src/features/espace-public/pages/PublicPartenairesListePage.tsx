// src/features/espace-public/pages/PublicPartenairesListePage.tsx
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
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { ImageDefaut } from "@/features/espace-public/components/ImageDefaut"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"
import type { PartenairePublic } from "@/types/api"

const TAILLE_PAGE = 12
const TOUS = "tous"

function uniques(valeurs: string[]): string[] {
  return [...new Set(valeurs.filter(Boolean))].sort((premier, second) => premier.localeCompare(second, "fr"))
}

function TuileLogoPartenaire({ partenaire }: { partenaire: PartenairePublic }) {
  return (
    <Link
      to={`/partenaires/${partenaire.id}`}
      className="vt-logo-tile"
      aria-label={`Voir le partenaire ${partenaire.nom}`}
    >
      {partenaire.logo_url ? (
        <img src={partenaire.logo_url} alt="" loading="lazy" decoding="async" />
      ) : (
        <ImageDefaut alt="" className="vt-image-defaut" />
      )}
    </Link>
  )
}

export function PublicPartenairesListePage() {
  const [recherche, setRecherche] = useState("")
  const [pays, setPays] = useState(TOUS)
  const [page, setPage] = useState(1)
  const rechercheDifferee = useDebounce(recherche, 250)
  const optionsRequete = usePublicTousPartenaires()
  const requete = usePublicPartenaires({
    recherche: rechercheDifferee || undefined,
    pays: pays === TOUS ? undefined : pays,
    page,
    limit: TAILLE_PAGE,
  })
  const partenaires = requete.data?.data ?? []
  const tousLesPartenaires = optionsRequete.data ?? []
  const paysDisponibles = uniques(tousLesPartenaires.map((partenaire) => partenaire.pays))

  function changerRecherche(valeur: string) {
    setRecherche(valeur)
    setPage(1)
  }

  return (
    <div className="vt-liste-page">
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Partenaires" }]} />
      </div>
      <PageHeaderPublique
        surTitre="RÉSEAU D'EXCELLENCE"
        titre="Nos"
        titreAccent="Partenaires"
        description="Les entreprises, institutions et universités qui collaborent avec l'Université de Fianarantsoa."
      />
      <section className="vt-section" aria-label="Liste des partenaires">
        <div className="vt-wrap">
          <div className="vt-filter-bar">
            <div className="vt-search">
              <Search size={16} aria-hidden="true" />
              <label htmlFor="recherche-partenaires" className="sr-only">Rechercher un partenaire</label>
              <Input
                id="recherche-partenaires"
                type="search"
                placeholder="Rechercher un partenaire"
                value={recherche}
                onChange={(event) => changerRecherche(event.target.value)}
              />
            </div>
            <label className="vt-select-wrap">
              <span>Pays</span>
              <select className="vt-select" value={pays} onChange={(event) => { setPays(event.target.value); setPage(1) }}>
                <option value={TOUS}>Tous les pays</option>
                {paysDisponibles.map((valeur) => <option key={valeur} value={valeur}>{valeur}</option>)}
              </select>
            </label>
          </div>

          {requete.isLoading && (
            <div className="vt-logo-grid vt-mt" aria-busy="true" aria-label="Chargement des partenaires">
              {[...Array(10)].map((_, index) => <Skeleton key={index} className="aspect-square w-full" />)}
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
              description={recherche.trim() || pays !== TOUS
                ? "Aucun résultat ne correspond à votre recherche ou aux filtres sélectionnés. Essayez d'autres critères."
                : "Découvrez les organisations et institutions qui collaborent avec l’Université de Fianarantsoa."}
            />
          )}
          {!requete.isLoading && !requete.isError && partenaires.length > 0 && (
            <>
              <RevealGroup className="vt-logo-grid vt-mt" direction="left">
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
        </div>
      </section>
    </div>
  )
}
