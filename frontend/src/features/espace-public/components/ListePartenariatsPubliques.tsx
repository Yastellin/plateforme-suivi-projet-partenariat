// src/features/espace-public/components/ListePartenariatsPubliques.tsx
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Handshake, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { usePublicPartenariatsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CartePartenariat } from "@/features/espace-public/components/CartesPubliques"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

const PAR_PAGE = 9

export function ListePartenariatsPubliques() {
  const { data = [], isLoading, isError, refetch } = usePublicPartenariatsPublies()
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDifferee = useDebounce(recherche, 250)
  const filtres = useMemo(() => {
    const terme = rechercheDifferee.trim().toLocaleLowerCase("fr")
    if (!terme) return data
    return data.filter((partenariat) => {
      const texte = [
        partenariat.intitule,
        partenariat.objet ?? "",
        partenariat.domaine,
        ...partenariat.etablissements.map((etablissement) => `${etablissement.nom} ${etablissement.sigle ?? ""}`),
        ...partenariat.partenaires.map((partenaire) => partenaire.nom),
      ].join(" ").toLocaleLowerCase("fr")
      return texte.includes(terme)
    })
  }, [data, rechercheDifferee])
  const nombrePages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE))
  const pageCourante = Math.min(page, nombrePages)
  const visibles = filtres.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE)

  function changerRecherche(valeur: string) {
    setRecherche(valeur)
    setPage(1)
  }

  return (
    <div className="vt-public-list">
      <div className="vt-search">
        <Search size={16} aria-hidden="true" />
        <label htmlFor="recherche-partenariats-publics" className="sr-only">Rechercher un partenariat</label>
        <Input
          id="recherche-partenariats-publics"
          type="search"
          placeholder="Rechercher un partenariat"
          value={recherche}
          onChange={(event) => changerRecherche(event.target.value)}
        />
      </div>

      {isLoading && (
        <div className="vt-grid-p vt-mt" aria-busy="true" aria-label="Chargement des partenariats">
          {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-72" />)}
        </div>
      )}

      {isError && (
        <EmptyState
          icone={Handshake}
          titre="Les partenariats n'ont pas pu être chargés"
          description="Vérifiez votre connexion puis réessayez."
          action={<Button variant="outline" onClick={() => refetch()}>Réessayer</Button>}
        />
      )}

      {!isLoading && !isError && filtres.length === 0 && (
        <EmptyState
          icone={Handshake}
          titre={recherche.trim() ? "Aucun partenariat trouvé" : "Aucun partenariat publié"}
          description={recherche.trim() ? "Essayez d'autres mots-clés." : "Les partenariats publiés apparaîtront ici."}
        />
      )}

      {!isLoading && !isError && visibles.length > 0 && (
        <>
          <RevealGroup className="vt-grid-p vt-mt" direction="left">
            {visibles.map((partenariat) => (
              <RevealItem key={partenariat.id} className="h-full">
                <CartePartenariat partenariat={partenariat} />
              </RevealItem>
            ))}
          </RevealGroup>
          {nombrePages > 1 && (
            <nav className="vt-pager" aria-label="Pagination des partenariats">
              <Button variant="outline" size="sm" disabled={pageCourante <= 1} onClick={() => setPage(pageCourante - 1)}>
                <ChevronLeft size={16} /> Précédent
              </Button>
              <span className="text-sm">Page {pageCourante} sur {nombrePages}</span>
              <Button variant="outline" size="sm" disabled={pageCourante >= nombrePages} onClick={() => setPage(pageCourante + 1)}>
                Suivant <ChevronRight size={16} />
              </Button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
