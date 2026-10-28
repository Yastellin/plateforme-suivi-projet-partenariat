// src/features/espace-public/pages/PublicPartenairesListePage.tsx
import { useState } from "react"
import { ChevronLeft, ChevronRight, Handshake, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { usePublicTousPartenaires } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CartePartenaire } from "@/features/espace-public/components/CartesPubliques"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

const TAILLE_PAGE = 12
const TOUS = "tous"

function uniques(valeurs: string[]): string[] {
  return [...new Set(valeurs.filter(Boolean))].sort((premier, second) => premier.localeCompare(second, "fr"))
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

  function reinitialiser() {
    setRecherche("")
    setPays(TOUS)
    setType(TOUS)
    setPage(1)
  }

  function changerRecherche(valeur: string) {
    setRecherche(valeur)
    setPage(1)
  }

  return (
    <div>
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Partenaires" }]} />
      </div>
      <PageHeaderPublique
        etiquette="Partenaires"
        icone={Handshake}
        titre="Nos partenaires"
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
            <label className="vt-select-wrap">
              <span>Type</span>
              <select className="vt-select" value={type} onChange={(event) => { setType(event.target.value); setPage(1) }}>
                <option value={TOUS}>Tous les types</option>
                {typesDisponibles.map((valeur) => <option key={valeur} value={valeur}>{valeur}</option>)}
              </select>
            </label>
          </div>

          {requete.isLoading && (
            <div className="vt-grid-4 vt-mt" aria-busy="true" aria-label="Chargement des partenaires">
              {[...Array(4)].map((_, index) => <Skeleton key={index} className="h-36" />)}
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
            <EmptyState
              icone={Search}
              titre="Aucun partenaire trouvé"
              description="Essayez d'autres mots-clés ou réinitialisez les filtres."
              action={<Button variant="outline" onClick={reinitialiser}>Réinitialiser les filtres</Button>}
            />
          )}
          {!requete.isLoading && !requete.isError && partenaires.length > 0 && (
            <>
              <RevealGroup className="vt-grid-4 vt-mt" direction="left">
                {partenaires.map((partenaire) => (
                  <RevealItem key={partenaire.id} className="h-full">
                    <CartePartenaire partenaire={partenaire} />
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
