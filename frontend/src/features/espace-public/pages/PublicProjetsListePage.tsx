// src/features/espace-public/pages/PublicProjetsListePage.tsx
// Liste des projets publies : recherche, filtres Domaine et Statut, grille de cartes.
// Sur mobile, les filtres sont dans un tiroir du bas (Reinitialiser / Appliquer).
import { useMemo, useState } from "react"
import { FolderKanban, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import type { ProjetPublic } from "@/types/api"
import { usePublicProjetsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { CarteProjet } from "@/features/espace-public/components/CartesPubliques"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { libelleStatutProjet } from "@/features/espace-public/lib/publique"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"

const TOUS = "tous"
const VIDE = ""

interface Filtres {
  recherche: string
  domaine: string
  statut: string
}

function FiltresProjets({
  filtres,
  domaines,
  statuts,
  onChange,
  idPrefixe,
}: {
  filtres: Filtres
  domaines: string[]
  statuts: string[]
  onChange: (f: Filtres) => void
  idPrefixe: string
}) {
  return (
    <div className="vt-filter-bar">
      <div className="vt-search">
        <Search size={16} aria-hidden="true" />
        <label htmlFor={`${idPrefixe}-recherche`} className="sr-only">
          Rechercher un projet
        </label>
        <Input
          id={`${idPrefixe}-recherche`}
          type="search"
          placeholder="Rechercher un projet"
          value={filtres.recherche}
          onChange={(e) => onChange({ ...filtres, recherche: e.target.value })}
        />
      </div>
      <label className="vt-select-wrap">
        <span>Domaine</span>
        <select
          className="vt-select"
          value={filtres.domaine}
          onChange={(e) => onChange({ ...filtres, domaine: e.target.value })}
        >
          <option value={TOUS}>Tous les domaines</option>
          {domaines.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </label>
      <label className="vt-select-wrap">
        <span>Statut</span>
        <select className="vt-select" value={filtres.statut} onChange={(e) => onChange({ ...filtres, statut: e.target.value })}>
          <option value={TOUS}>Tous les statuts</option>
          {statuts.map((s) => (
            <option key={s} value={s}>
              {libelleStatutProjet(s as ProjetPublic["statut"])}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}

export function PublicProjetsListePage() {
  const requete = usePublicProjetsPublies()
  const projets = useMemo(() => requete.data ?? [], [requete.data])
  const [filtres, setFiltres] = useState<Filtres>({ recherche: VIDE, domaine: TOUS, statut: TOUS })
  const [tiroirOuvert, setTiroirOuvert] = useState(false)
  const rechercheDifferee = useDebounce(filtres.recherche, 250)

  const domaines = useMemo(
    () => [...new Set(projets.map((p) => p.domaine).filter((d): d is string => Boolean(d)))].sort((a, b) => a.localeCompare(b, "fr")),
    [projets],
  )
  const statuts = useMemo(() => [...new Set(projets.map((p) => p.statut))], [projets])

  const affiches = useMemo(() => {
    const terme = rechercheDifferee.trim().toLowerCase()
    return projets.filter((p) => {
      if (filtres.domaine !== TOUS && p.domaine !== filtres.domaine) return false
      if (filtres.statut !== TOUS && p.statut !== filtres.statut) return false
      if (!terme) return true
      return `${p.nom} ${p.intitule_officiel ?? ""} ${p.domaine ?? ""}`.toLowerCase().includes(terme)
    })
  }, [projets, rechercheDifferee, filtres.domaine, filtres.statut])

  const reinitialiser = () => setFiltres({ recherche: VIDE, domaine: TOUS, statut: TOUS })

  return (
    <div>
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Projets" }]} />
      </div>
      <PageHeaderPublique
        etiquette="Projets"
        icone={FolderKanban}
        titre="Nos projets"
        description="Les projets publics de l'université, avec leurs partenaires, leur domaine et leur statut."
      />

      <section className="vt-section" aria-label="Liste des projets">
        <div className="vt-wrap">
          <div className="vt-only-desktop">
            <FiltresProjets filtres={filtres} domaines={domaines} statuts={statuts} onChange={setFiltres} idPrefixe="bureau" />
          </div>
          <div className="vt-only-mobile">
            <Dialog open={tiroirOuvert} onOpenChange={setTiroirOuvert}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full">
                  Filtres
                </Button>
              </DialogTrigger>
              <DialogContent className="vt-sheet">
                <DialogTitle>Filtrer les projets</DialogTitle>
                <DialogDescription>Choisissez un domaine ou un statut, puis appliquez.</DialogDescription>
                <FiltresProjets filtres={filtres} domaines={domaines} statuts={statuts} onChange={setFiltres} idPrefixe="tiroir" />
                <div className="vt-sheet-actions">
                  <Button variant="outline" onClick={reinitialiser}>
                    Réinitialiser
                  </Button>
                  <Button onClick={() => setTiroirOuvert(false)}>Appliquer</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {requete.isLoading && (
            <div className="vt-grid-p vt-mt">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          )}

          {requete.isError && (
            <EmptyState
              icone={FolderKanban}
              titre="Les projets n'ont pas pu être chargés"
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
              titre="Aucun projet trouvé"
              description="Essayez d'autres mots-clés ou réinitialisez les filtres."
              action={
                <Button variant="outline" onClick={reinitialiser}>
                  Réinitialiser les filtres
                </Button>
              }
            />
          )}

          {affiches.length > 0 && (
            <RevealGroup className="vt-grid-p vt-mt" direction="right">
              {affiches.map((projet) => (
                <RevealItem key={projet.id} className="h-full">
                  <CarteProjet projet={projet} lien={`/projets/${projet.id}`} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </div>
      </section>
    </div>
  )
}
