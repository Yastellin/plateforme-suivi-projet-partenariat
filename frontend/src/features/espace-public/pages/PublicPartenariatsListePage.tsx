// Liste publique des partenariats avec filtres, cartes et pagination.
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, FileText, Handshake, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import { usePublicPartenariatsPublies, type PartenariatPublic } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CartePartenariat } from "@/features/espace-public/components/CartesPubliques"
import { PageListePublique } from "@/features/espace-public/components/PageListePublique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"
import { periodeCalculeePartenariat } from "@/features/espace-public/lib/publique"

const PAR_PAGE = 9
const TOUS = "tous"
const STATUTS = [
  { valeur: TOUS, libelle: "Tous" },
  { valeur: "actif", libelle: "Actifs" },
  { valeur: "termine", libelle: "Terminés" },
]

function normaliser(texte: string): string {
  return texte.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("fr")
}

function libellerDomaine(domaine: string): string {
  const valeur = normaliser(domaine)
  if (valeur.includes("recherche")) return "Recherche"
  if (valeur.includes("formation")) return "Formation"
  if (valeur.includes("innovation")) return "Innovation"
  return domaine.replaceAll("_", " ")
}

function statutPublic(partenariat: PartenariatPublic): string {
  return periodeCalculeePartenariat(partenariat.date_debut, partenariat.date_fin)
}

function libelleStatut(partenariat: PartenariatPublic): string {
  const statut = statutPublic(partenariat)
  if (statut === "actif") return "Actif"
  if (statut === "termine") return "Terminé"
  if (statut === "a-venir") return "À venir"
  return "Période non renseignée"
}

function CartePartenariatAvecStatut({ partenariat }: { partenariat: PartenariatPublic }) {
  const statut = statutPublic(partenariat)
  return (
    <div className="vt-partenariat-liste-carte">
      <span className={`vt-partenariat-statut vt-partenariat-statut-${statut}`}>
        {libelleStatut(partenariat)}
      </span>
      <CartePartenariat partenariat={partenariat} className="vt-card-partenariat" />
    </div>
  )
}

export function PublicPartenariatsListePage() {
  const { data = [], isLoading, isError, refetch } = usePublicPartenariatsPublies()
  const [recherche, setRecherche] = useState("")
  const [domaine, setDomaine] = useState(TOUS)
  const [statut, setStatut] = useState(TOUS)
  const [page, setPage] = useState(1)
  const rechercheDifferee = useDebounce(recherche, 250)
  const domaines = useMemo(
    () => [...new Set(data.map((item) => item.domaine).filter(Boolean))].sort((a, b) => a.localeCompare(b, "fr")),
    [data],
  )

  const filtres = useMemo(() => {
    const terme = normaliser(rechercheDifferee.trim())
    return data.filter((partenariat) => {
      if (domaine !== TOUS && partenariat.domaine !== domaine) return false
      if (statut !== TOUS && statutPublic(partenariat) !== statut) return false
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
  }, [data, rechercheDifferee, domaine, statut])

  const nombrePages = Math.max(1, Math.ceil(filtres.length / PAR_PAGE))
  const pageCourante = Math.min(page, nombrePages)
  const visibles = filtres.slice((pageCourante - 1) * PAR_PAGE, pageCourante * PAR_PAGE)

  function changerPageFiltre() {
    setPage(1)
  }

  return (
    <PageListePublique
      filAriane={[{ label: "Accueil", href: "/" }, { label: "Partenariats" }]}
      surTitre="Coopérations"
      titre={<>Tous nos <span>Partenariats</span></>}
      description="Découvrez les coopérations publiques entre les établissements de l'université et leurs partenaires."
      filtres={(
        <div className="vt-partnership-list-filters">
          <div className="vt-filter-group" role="group" aria-label="Filtrer par domaine">
            <button type="button" className="vt-filter-btn" aria-pressed={domaine === TOUS} onClick={() => { setDomaine(TOUS); changerPageFiltre() }}>Tous les domaines</button>
            {domaines.map((valeur) => (
              <button key={valeur} type="button" className="vt-filter-btn" aria-pressed={domaine === valeur} onClick={() => { setDomaine(valeur); changerPageFiltre() }}>
                {libellerDomaine(valeur)}
              </button>
            ))}
          </div>
          <div className="vt-filter-group vt-partnership-status-filters" role="group" aria-label="Filtrer par statut">
            {STATUTS.map((option) => (
              <button key={option.valeur} type="button" className="vt-filter-btn" aria-pressed={statut === option.valeur} onClick={() => { setStatut(option.valeur); changerPageFiltre() }}>
                {option.libelle}
              </button>
            ))}
          </div>
        </div>
      )}
      recherche={(
        <>
          <Search size={17} aria-hidden="true" />
          <label htmlFor="recherche-partenariats-publics" className="sr-only">Rechercher un partenariat</label>
          <Input
            id="recherche-partenariats-publics"
            type="search"
            placeholder="Rechercher un partenariat..."
            value={recherche}
            onChange={(event) => { setRecherche(event.target.value); changerPageFiltre() }}
          />
        </>
      )}
      compteurResultats={!isLoading && !isError ? `${filtres.length} résultats trouvés` : undefined}
    >
      {isLoading && (
        <div className="vt-partenariats-grid vt-partnership-list-grid" aria-busy="true" aria-label="Chargement des partenariats">
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
          description={recherche.trim() || domaine !== TOUS || statut !== TOUS
            ? "Aucun résultat ne correspond à votre recherche ou aux filtres sélectionnés. Essayez d'autres critères."
            : "Découvrez les coopérations entre les établissements et leurs partenaires."}
        />
      )}
      {!isLoading && !isError && visibles.length > 0 && (
        <>
          <RevealGroup className="vt-partenariats-grid vt-partnership-list-grid" direction="left">
            {visibles.map((partenariat) => (
              <RevealItem key={partenariat.id} className="vt-partenariat-grid-item">
                <CartePartenariatAvecStatut partenariat={partenariat} />
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
    </PageListePublique>
  )
}
