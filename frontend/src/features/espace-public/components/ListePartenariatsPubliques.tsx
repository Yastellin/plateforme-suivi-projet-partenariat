// Liste publique des partenariats avec filtres, cartes et pagination.
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, FileText, Handshake, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { usePublicPartenariatsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CartePartenariat } from "@/features/espace-public/components/CartesPubliques"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { periodeCalculeePartenariat, type PeriodeCalculeePartenariat } from "@/features/espace-public/lib/publique"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"

const PAR_PAGE = 9
const TOUS = "tous"
type FiltrePeriode = "tous" | "actif" | "termine" | "a-venir"

function normaliser(texte: string): string {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
}

function libellerDomaine(domaine: string): string {
  const valeur = normaliser(domaine)
  if (valeur.includes("recherche")) return "Recherche"
  if (valeur.includes("formation")) return "Formation"
  if (valeur.includes("innovation")) return "Innovation"
  return domaine
}

const LIBELLES_PERIODE: Record<FiltrePeriode, string> = {
  tous: "Toutes les périodes",
  actif: "En cours",
  termine: "Terminées",
  "a-venir": "À venir",
}

function correspondPeriode(periode: PeriodeCalculeePartenariat, filtre: FiltrePeriode): boolean {
  return filtre === TOUS || periode === filtre
}

export function ListePartenariatsPubliques() {
  const { data = [], isLoading, isError, refetch } = usePublicPartenariatsPublies()
  const [recherche, setRecherche] = useState("")
  const [domaine, setDomaine] = useState(TOUS)
  const [periode, setPeriode] = useState<FiltrePeriode>(TOUS)
  const [page, setPage] = useState(1)
  const rechercheDifferee = useDebounce(recherche, 250)
  const domaines = useMemo(() => [...new Set(data.map((item) => item.domaine).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr")), [data])

  const filtres = useMemo(() => {
    const terme = normaliser(rechercheDifferee.trim())
    return data.filter((partenariat) => {
      const periodeCourante = periodeCalculeePartenariat(partenariat.date_debut, partenariat.date_fin)
      if (domaine !== TOUS && partenariat.domaine !== domaine) return false
      if (!correspondPeriode(periodeCourante, periode)) return false
      if (!terme) return true
      const texte = [
        partenariat.intitule,
        partenariat.objet ?? "",
        partenariat.domaine,
        ...partenariat.etablissements.map((etablissement) => `${etablissement.nom} ${etablissement.sigle ?? ""}`),
        ...partenariat.partenaires.map((partenaire) => partenaire.nom),
      ].join(" ")
      return normaliser(texte).includes(terme)
    })
  }, [data, rechercheDifferee, domaine, periode])

  const nombrePages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE))
  const pageCourante = Math.min(page, nombrePages)
  const visibles = filtres.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE)

  function reinitialiserPage() {
    setPage(1)
  }

  return (
    <div className="vt-public-list">
      <div className="vt-filter-bar-sticky">
        <div className="vt-partnership-filter-bar">
          <div className="vt-partnership-filter-groups">
            <div className="vt-filter-group" role="group" aria-label="Filtrer par domaine">
              <button type="button" className="vt-filter-pill" aria-pressed={domaine === TOUS} onClick={() => { setDomaine(TOUS); reinitialiserPage() }}>Tous</button>
              {domaines.map((valeur) => (
                <button key={valeur} type="button" className="vt-filter-pill" aria-pressed={domaine === valeur} onClick={() => { setDomaine(valeur); reinitialiserPage() }}>{libellerDomaine(valeur)}</button>
              ))}
            </div>
            <div className="vt-filter-group vt-filter-group-period" role="group" aria-label="Filtrer par période calculée à partir des dates">
              {(Object.keys(LIBELLES_PERIODE) as FiltrePeriode[]).map((valeur) => (
                <button key={valeur} type="button" className="vt-filter-pill" aria-pressed={periode === valeur} onClick={() => { setPeriode(valeur); reinitialiserPage() }}>{LIBELLES_PERIODE[valeur]}</button>
              ))}
            </div>
          </div>
          <div className="vt-search vt-partnership-search">
            <Search size={16} aria-hidden="true" />
            <label htmlFor="recherche-partenariats-publics" className="sr-only">Rechercher un partenariat</label>
            <Input id="recherche-partenariats-publics" type="search" placeholder="Rechercher un partenariat" value={recherche} onChange={(event) => { setRecherche(event.target.value); reinitialiserPage() }} />
          </div>
        </div>
      </div>
      <p className="vt-period-note">Les périodes affichées sont calculées à partir des dates publiques et ne constituent pas un statut officiel du partenariat.</p>

      {isLoading && (
        <div className="vt-partenariats-grid vt-mt" aria-busy="true" aria-label="Chargement des partenariats">
          {[...Array(3)].map((_, index) => <Skeleton key={index} className="h-96 rounded-xl" />)}
        </div>
      )}
      {isError && (
        <EmptyState icone={Handshake} titre="Les partenariats n'ont pas pu être chargés" description="Vérifiez votre connexion puis réessayez." action={<Button variant="outline" onClick={() => refetch()}>Réessayer</Button>} />
      )}
      {!isLoading && !isError && filtres.length === 0 && (
        <EmptyStateSection
          icone={<FileText aria-hidden="true" />}
          titre="Les partenariats seront bientôt en ligne"
          description={recherche.trim() || domaine !== TOUS || periode !== TOUS
            ? "Aucun résultat ne correspond à votre recherche ou aux filtres sélectionnés. Essayez d'autres critères."
            : "Nous finalisons actuellement les accords et les détails des coopérations en cours. Cette section sera mise à jour très prochainement."}
        />
      )}
      {!isLoading && !isError && visibles.length > 0 && (
        <>
          <p className="vt-results-count" aria-live="polite">Affichage de {visibles.length} partenariats sur {filtres.length}</p>
          <RevealGroup className="vt-partenariats-grid" direction="left">
            {visibles.map((partenariat) => (
              <RevealItem key={partenariat.id} className="vt-partenariat-grid-item">
                <CartePartenariat partenariat={partenariat} periodeCalculee={periodeCalculeePartenariat(partenariat.date_debut, partenariat.date_fin)} />
              </RevealItem>
            ))}
          </RevealGroup>
          {nombrePages > 1 && (
            <nav className="vt-pager" aria-label="Pagination des partenariats">
              <Button variant="outline" size="sm" disabled={pageCourante <= 1} onClick={() => setPage(pageCourante - 1)}><ChevronLeft size={16} /> Précédent</Button>
              {[...Array(nombrePages)].map((_, index) => (
                <button key={index} type="button" className="vt-pager-num" aria-current={pageCourante === index + 1 ? "page" : undefined} aria-label={`Page ${index + 1}`} onClick={() => setPage(index + 1)}>{index + 1}</button>
              ))}
              <Button variant="outline" size="sm" disabled={pageCourante >= nombrePages} onClick={() => setPage(pageCourante + 1)}>Suivant <ChevronRight size={16} /></Button>
            </nav>
          )}
        </>
      )}
    </div>
  )
}
