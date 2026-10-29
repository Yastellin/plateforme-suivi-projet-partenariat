// src/features/espace-public/pages/ProjetsPartenariatsPubliquePage.tsx
// Page unique de la vitrine publique regroupant tous les projets, partenaires
// et publications de l'Universite (onglets, recherche et pagination).
import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Briefcase, Building2, FolderOpen, Handshake, Newspaper, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDebounce } from "@/hooks/useDebounce"
import type { MetaPagination } from "@/types/api"
import { PageHeaderPublique } from "@/features/espace-public/components/PageHeaderPublique"
import { CarteProjet, CartePartenaire, CartePublication } from "@/features/espace-public/components/CartesPubliques"
import { ListePartenariatsPubliques } from "@/features/espace-public/components/ListePartenariatsPubliques"
import { usePublicProjets } from "@/features/espace-public/api/usePublicProjets"
import { usePublicPartenaires } from "@/features/espace-public/api/usePublicPartenaires"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { usePublicEtablissements } from "@/features/espace-public/api/usePublicEtablissements"
import { RevealGroup, RevealItem } from "@/features/espace-public/components/Reveal"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"

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
  return <div className="vt-card-list">{children}</div>
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
        <EmptyStateSection
          icone={<FolderOpen aria-hidden="true" />}
          titre="Aucun projet publié actuellement"
          description={recherche.trim() || etablissementId
            ? "Aucun résultat ne correspond à votre recherche ou au filtre d'établissement. Essayez d'autres critères."
            : "De nouvelles collaborations sont en cours de finalisation. Les fiches détaillées de nos projets seront disponibles prochainement."}
        />
      ) : (
        <>
          <RevealGroup className="vt-card-list" direction="up">
            {projets.map((projet) => (
              <RevealItem key={projet.id} className="vt-card-list-item">
                <CarteProjet projet={projet} />
              </RevealItem>
            ))}
          </RevealGroup>
          <Pagination meta={data?.meta} onChange={setPage} />
        </>
      )}
    </div>
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
        <EmptyStateSection
          icone={<Building2 aria-hidden="true" />}
          titre="La liste des partenaires arrive bientôt"
          description={recherche.trim()
            ? "Aucun résultat ne correspond à votre recherche. Essayez avec le nom du partenaire, son pays ou son type."
            : "Notre équipe met actuellement à jour les logos et les fiches de nos organisations partenaires pour vous offrir une expérience optimale."}
        />
      ) : (
        <>
          <RevealGroup className="vt-card-list" direction="left">
            {partenaires.map((partenaire) => (
              <RevealItem key={partenaire.id} className="vt-card-list-item">
                <CartePartenaire partenaire={partenaire} />
              </RevealItem>
            ))}
          </RevealGroup>
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
        <EmptyStateSection
          icone={<Newspaper aria-hidden="true" />}
          titre="Aucune actualité pour le moment"
          description={recherche.trim()
            ? "Aucun résultat ne correspond à votre recherche. Essayez avec un mot du titre ou le nom d'un projet."
            : "Nous préparons de nouveaux articles et communiqués. Revenez très bientôt pour découvrir les dernières nouvelles de l'université."}
        />
      ) : (
        <>
          <RevealGroup className="vt-card-list" direction="up">
            {publications.map((publication) => (
              <RevealItem key={publication.id} className="vt-card-list-item">
                <CartePublication publication={publication} />
              </RevealItem>
            ))}
          </RevealGroup>
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
    <div className="vt-liste-page pb-24">
      <PageHeaderPublique
        etiquette="Écosystème"
        icone={Briefcase}
        titre="Projets, partenariats et partenaires"
        description="Les projets, relations de coopération, partenaires et publications de l'Université de Fianarantsoa."
      />

      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6 lg:px-8">
        <Tabs value={onglet} onValueChange={changerOnglet} className="flex flex-col gap-10">
          <TabsList className="mx-auto h-auto flex-wrap justify-center gap-2 bg-transparent p-0">
            <TabsTrigger value="projets" className="rounded-full border px-5 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Briefcase size={14} /> Projets
            </TabsTrigger>
            <TabsTrigger value="partenariats" className="rounded-full border px-5 py-2 data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Handshake size={14} /> Partenariats
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
            <ListePartenariatsPubliques />
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
