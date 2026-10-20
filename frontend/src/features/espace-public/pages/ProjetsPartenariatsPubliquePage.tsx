// src/features/espace-public/pages/ProjetsPartenariatsPubliquePage.tsx
// Page unique de la vitrine publique regroupant tous les projets, partenaires
// et publications de l'Universite (onglets, recherche et pagination).
import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Briefcase, Building2, Handshake, Newspaper, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/shared/EmptyState"
import { useDebounce } from "@/hooks/useDebounce"
import type { MetaPagination, Partenariat } from "@/types/api"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { StatusBadge } from "@/components/shared/StatusBadge"
import { CarteProjet, CartePartenaire, CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { usePublicProjets } from "@/features/espace-public/api/usePublicProjets"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { usePublicPartenariats } from "@/features/espace-public/api/usePublicPartenariats"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { usePublicEtablissements } from "@/features/espace-public/api/usePublicEtablissements"

type Onglet = "projets" | "partenariats" | "partenaires" | "publications"
const ONGLETS: Onglet[] = ["projets", "partenariats", "partenaires", "publications"]
const TAILLE_PAGE = 9

function ongletDepuisUrl(valeur: string | null): Onglet {
  return ONGLETS.includes(valeur as Onglet) ? (valeur as Onglet) : "projets"
}

// Pagination simple : precedent / suivant, avec le nombre de resultats.
function Pagination({ meta, onChange }: { meta: MetaPagination | undefined; onChange: (page: number) => void }) {
  if (!meta || meta.totalPages <= 1) return null
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" className="rounded-full" disabled={meta.page <= 1} onClick={() => onChange(meta.page - 1)}>
        <ChevronLeft size={16} /> Précédent
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {meta.page} sur {meta.totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={meta.page >= meta.totalPages}
        onClick={() => onChange(meta.page + 1)}
      >
        Suivant <ChevronRight size={16} />
      </Button>
    </nav>
  )
}

function Grille({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function Chargement() {
  return (
    <Grille>
      {[...Array(6)].map((_, i) => (
        <Skeleton key={i} className="h-72 rounded-2xl" />
      ))}
    </Grille>
  )
}

function BarreRecherche({ valeur, onChange, placeholder }: { valeur: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mx-auto max-w-xl">
      <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        aria-label={placeholder}
        value={valeur}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 rounded-full border-border/70 bg-background/80 pl-11 shadow-sm backdrop-blur"
      />
    </div>
  )
}

function ListeProjets() {
  const [recherche, setRecherche] = useState("")
  const [etablissementId, setEtablissementId] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebounced = useDebounce(recherche, 300)
  const { data: etablissementsData } = usePublicEtablissements({ limit: 100 })
  const { data, isLoading } = usePublicProjets({
    recherche: rechercheDebounced || undefined,
    etablissement_id: etablissementId || undefined,
    page,
    limit: TAILLE_PAGE,
  })

  const projets = data?.data ?? []
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <BarreRecherche
            valeur={recherche}
            onChange={(v) => {
              setRecherche(v)
              setPage(1)
            }}
            placeholder="Rechercher un projet…"
          />
        </div>
        <select
          aria-label="Filtrer par établissement"
          value={etablissementId}
          onChange={(e) => {
            setEtablissementId(e.target.value)
            setPage(1)
          }}
          className="h-12 rounded-full border border-border/70 bg-background/80 px-4 text-sm shadow-sm sm:w-64"
        >
          <option value="">Tous les établissements</option>
          {(etablissementsData?.data ?? []).map((e) => (
            <option key={e.id} value={e.id}>
              {e.nom}
              {e.sigle ? ` (${e.sigle})` : ""}
            </option>
          ))}
        </select>
      </div>
      {isLoading ? (
        <Chargement />
      ) : projets.length === 0 ? (
        <EmptyState
          icone={Briefcase}
          titre={recherche.trim() || etablissementId ? "Aucun projet trouvé" : "Aucun projet pour le moment"}
          description={
            recherche.trim() || etablissementId
              ? "Essayez d'autres termes ou retirez le filtre d'établissement."
              : "Les projets de l'Université apparaîtront ici dès leur publication."
          }
        />
      ) : (
        <>
          <Grille>
            {projets.map((projet) => (
              <CarteProjet key={projet.id} projet={projet} />
            ))}
          </Grille>
          <Pagination meta={data?.meta} onChange={setPage} />
        </>
      )}
    </div>
  )
}

// Partenariats publies par la Presidence (flux publie_le) : liste non paginee.
function ListePartenariats() {
  const [recherche, setRecherche] = useState("")
  const rechercheDebounced = useDebounce(recherche, 300)
  const { data, isLoading } = usePublicPartenariats()

  const partenariats = (data ?? []).filter((partenariat) => {
    if (!rechercheDebounced) return true
    const terme = rechercheDebounced.toLowerCase()
    return (
      partenariat.intitule.toLowerCase().includes(terme) ||
      (partenariat.objet ?? "").toLowerCase().includes(terme) ||
      partenariat.domaine.toLowerCase().includes(terme)
    )
  })

  return (
    <div className="flex flex-col gap-8">
      <BarreRecherche
        valeur={recherche}
        onChange={setRecherche}
        placeholder="Rechercher un partenariat…"
      />
      {isLoading ? (
        <Chargement />
      ) : partenariats.length === 0 ? (
        <EmptyState
          icone={Building2}
          titre={recherche.trim() ? "Aucun partenariat trouvé" : "Aucun partenariat pour le moment"}
          description={
            recherche.trim()
              ? "Essayez avec l'intitule, l'objet ou le domaine du partenariat."
              : "Les partenariats publiés par la Présidence apparaîtront ici."
          }
        />
      ) : (
        <Grille>
          {partenariats.map((partenariat) => (
            <CartePartenariat key={partenariat.id} partenariat={partenariat} />
          ))}
        </Grille>
      )}
    </div>
  )
}

// Carte d'un partenariat publie : intitule, domaine et etablissements rattaches.
function CartePartenariat({ partenariat }: { partenariat: Partenariat }) {
  return (
    <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10">
      <CardContent className="flex h-full flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading text-sm font-semibold text-foreground">
            {partenariat.intitule}
          </h3>
          <StatusBadge libelle="Publié" tonalite="actif" />
        </div>
        {partenariat.objet && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{partenariat.objet}</p>
        )}
        <div className="mt-auto pt-2 text-xs text-muted-foreground">
          <span className="font-medium">{partenariat.domaine}</span>
        </div>
        {partenariat.etablissements.length > 0 && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {partenariat.etablissements.slice(0, 3).map((etab) => (
              <span key={etab.id} className="flex items-center gap-1">
                <Building2 size={12} />
                {etab.nom}
              </span>
            ))}
            {partenariat.etablissements.length > 3 && (
              <span>+{partenariat.etablissements.length - 3}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ListePartenaires() {
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebounced = useDebounce(recherche, 300)
  const { data, isLoading } = usePublicPartenaires({
    recherche: rechercheDebounced || undefined,
    page,
    limit: TAILLE_PAGE,
  })
  const partenaires = data?.data ?? []

  return (
    <div className="flex flex-col gap-8">
      <BarreRecherche
        valeur={recherche}
        onChange={(v) => {
          setRecherche(v)
          setPage(1)
        }}
        placeholder="Rechercher un partenaire…"
      />
      {isLoading ? (
        <Chargement />
      ) : partenaires.length === 0 ? (
        <EmptyState
          icone={Handshake}
          titre={recherche.trim() ? "Aucun partenaire trouvé" : "Aucun partenaire pour le moment"}
          description={
            recherche.trim()
              ? "Essayez avec le nom du partenaire, son pays ou son type."
              : "Les partenaires visibles de l'Université apparaîtront ici."
          }
        />
      ) : (
        <>
          <Grille>
            {partenaires.map((partenaire) => (
              <CartePartenaire key={partenaire.id} partenaire={partenaire} />
            ))}
          </Grille>
          <Pagination meta={data?.meta} onChange={setPage} />
        </>
      )}
    </div>
  )
}

function ListePublications() {
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const rechercheDebounced = useDebounce(recherche, 300)
  const { data, isLoading } = usePublicPublications({
    recherche: rechercheDebounced || undefined,
    page,
    limit: TAILLE_PAGE,
  })
  const publications = data?.data ?? []

  return (
    <div className="flex flex-col gap-8">
      <BarreRecherche
        valeur={recherche}
        onChange={(v) => {
          setRecherche(v)
          setPage(1)
        }}
        placeholder="Rechercher une publication…"
      />
      {isLoading ? (
        <Chargement />
      ) : publications.length === 0 ? (
        <EmptyState
          icone={Newspaper}
          titre={recherche.trim() ? "Aucune publication trouvée" : "Aucune publication pour le moment"}
          description={
            recherche.trim()
              ? "Essayez avec un mot du titre ou le nom d'un projet."
              : "Les actualités publiées par la Présidence apparaîtront ici."
          }
        />
      ) : (
        <>
          <Grille>
            {publications.map((publication) => (
              <CartePublication key={publication.id} publication={publication} />
            ))}
          </Grille>
          <Pagination meta={data?.meta} onChange={setPage} />
        </>
      )}
    </div>
  )
}

export function ProjetsPartenariatsPubliquePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const onglet = ongletDepuisUrl(searchParams.get("onglet"))

  function changerOnglet(valeur: string) {
    setSearchParams(valeur === "projets" ? {} : { onglet: valeur }, { replace: true })
  }

  return (
    <div className="pb-24">
      <PageHeaderPublique
        etiquette="Écosystème"
        icone={Briefcase}
        titre="Projets & partenaires"
        description="Tous les projets, partenaires et publications de l'Université de Fianarantsoa, réunis au même endroit."
      />

      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Tabs value={onglet} onValueChange={changerOnglet} className="flex flex-col gap-10">
          <TabsList className="mx-auto h-auto flex-wrap justify-center gap-2 bg-transparent p-0">
            <TabsTrigger value="projets" className="rounded-full border px-5 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase size={14} /> Projets
            </TabsTrigger>
            <TabsTrigger value="partenariats" className="rounded-full border px-5 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Building2 size={14} /> Partenariats
            </TabsTrigger>
            <TabsTrigger value="partenaires" className="rounded-full border px-5 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Handshake size={14} /> Partenaires
            </TabsTrigger>
            <TabsTrigger value="publications" className="rounded-full border px-5 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Newspaper size={14} /> Publications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projets">
            <ListeProjets />
          </TabsContent>
          <TabsContent value="partenariats">
            <ListePartenariats />
          </TabsContent>
          <TabsContent value="partenaires">
            <ListePartenaires />
          </TabsContent>
          <TabsContent value="publications">
            <ListePublications />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
