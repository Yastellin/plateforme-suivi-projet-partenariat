// src/features/espace-public/pages/PublicPartenairesListePage.tsx
// Liste des partenaires publics : recherche, filtres Pays et Type, grille 4/2/1 colonnes.
import { useMemo, useState } from "react"
import { Handshake, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { usePublicTousPartenaires } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CartePartenaire } from "@/features/espace-public/components/CartesPubliques"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"

const TOUS = "tous"

function uniques(valeurs: string[]): string[] {
  return [...new Set(valeurs.filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr"))
}

export function PublicPartenairesListePage() {
  const requete = usePublicTousPartenaires()
  const partenaires = useMemo(() => requete.data ?? [], [requete.data])
  const [recherche, setRecherche] = useState("")
  const rechercheDifferee = useDebounce(recherche, 250)
  const [pays, setPays] = useState(TOUS)
  const [type, setType] = useState(TOUS)

  const pays_ = useMemo(() => uniques(partenaires.map((p) => p.pays)), [partenaires])
  const types = useMemo(() => uniques(partenaires.map((p) => p.type)), [partenaires])

  const affiches = useMemo(() => {
    const terme = rechercheDifferee.trim().toLowerCase()
    return partenaires.filter((p) => {
      if (pays !== TOUS && p.pays !== pays) return false
      if (type !== TOUS && p.type !== type) return false
      return !terme || `${p.nom} ${p.pays} ${p.type}`.toLowerCase().includes(terme)
    })
  }, [partenaires, rechercheDifferee, pays, type])

  const reinitialiser = () => {
    setRecherche("")
    setPays(TOUS)
    setType(TOUS)
  }

  return (
    <div>
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Partenariats" }]} />
      </div>
      <PageHeaderPublique
        etiquette="Partenariats"
        icone={Handshake}
        titre="Nos partenariats"
        description="Les entreprises, institutions et universités qui travaillent avec l'université."
      />

      <section className="vt-section" aria-label="Liste des partenariats">
        <div className="vt-wrap">
          <div className="vt-filter-bar">
            <div className="vt-search">
              <Search size={16} aria-hidden="true" />
              <label htmlFor="recherche-partenariats" className="sr-only">
                Rechercher un partenaire
              </label>
              <Input
                id="recherche-partenariats"
                type="search"
                placeholder="Rechercher un partenaire"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
              />
            </div>
            <label className="vt-select-wrap">
              <span>Pays</span>
              <select className="vt-select" value={pays} onChange={(e) => setPays(e.target.value)}>
                <option value={TOUS}>Tous les pays</option>
                {pays_.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </label>
            <label className="vt-select-wrap">
              <span>Type</span>
              <select className="vt-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value={TOUS}>Tous les types</option>
                {types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {requete.isLoading && (
            <div className="vt-grid-4 vt-mt">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))}
            </div>
          )}

          {requete.isError && (
            <EmptyState
              icone={Handshake}
              titre="Les partenaires n'ont pas pu être chargés"
              description="Vérifiez votre connexion puis réessayez."
              action={
                <Button variant="outline" onClick={() => requete.refetch()}>
                  Réessayer
                </Button>
              }
            />
          )}

          {!requete.isLoading && !requete.isError && affiches.length === 0 && (
            <EmptyState
              icone={Search}
              titre="Aucun partenaire trouvé"
              description="Essayez d'autres mots-clés ou réinitialisez les filtres."
              action={
                <Button variant="outline" onClick={reinitialiser}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          )}

          {affiches.length > 0 && (
            <div className="vt-grid-4 vt-mt">
              {affiches.map((partenaire) => (
                <CartePartenaire key={partenaire.id} partenaire={partenaire} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
