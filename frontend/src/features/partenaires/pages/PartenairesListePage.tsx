// src/features/partenaires/pages/PartenairesListePage.tsx
import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Plus, UserPlus, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { SkeletonCard } from "@/components/shared/SkeletonCard"
import { PartenaireCard } from "@/features/partenaires/components/PartenaireCard"
import { PartenaireFiltres } from "@/features/partenaires/components/PartenaireFiltres"
import { PartenaireForm } from "@/features/partenaires/components/PartenaireForm"
import { usePartenaires } from "@/features/partenaires/api/usePartenaires"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

const LIMITE_PAR_PAGE = 20

export function PartenairesListePage() {
  const navigate = useNavigate()
  const [recherche, setRecherche] = useState("")
  const [statut, setStatut] = useState<string[]>([])
  const [visibilite, setVisibilite] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [dialogueOuvert, setDialogueOuvert] = useState(false)

  const rechercheDebouncee = useDebounce(recherche, 300)

  const filtres = useMemo(
    () => ({
      page,
      limit: LIMITE_PAR_PAGE,
      nom: rechercheDebouncee || undefined,
      statut: statut.length === 1 ? statut[0] : undefined,
      visibilite: visibilite.length === 1 ? visibilite[0] : undefined,
    }),
    [page, rechercheDebouncee, statut, visibilite]
  )

  const { data, isLoading } = usePartenaires(filtres)

  const changementFiltres = (valeurs: { recherche: string; statut: string[]; visibilite: string[] }) => {
    setRecherche(valeurs.recherche)
    setStatut(valeurs.statut)
    setVisibilite(valeurs.visibilite)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Partenaires</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${data.meta.total} partenaire${data.meta.total > 1 ? "s" : ""} reference${data.meta.total > 1 ? "s" : ""}`
              : "Chargement..."}
          </p>
        </div>
        <Button onClick={() => setDialogueOuvert(true)}>
          <Plus />
          Nouveau partenaire
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <PartenaireFiltres
            valeurs={{ recherche, statut, visibilite }}
            onChangement={changementFiltres}
          />
        </aside>

        <div className="min-w-0 flex-1">
          {isLoading && !data ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : data && data.data.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {data.data.map((partenaire) => (
                <PartenaireCard
                  key={partenaire.id}
                  partenaire={partenaire}
                  onClic={() => navigate(`/presidence/partenaires-partenariats/partenaires/${partenaire.id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={recherche || statut.length > 0 || visibilite.length > 0 ? Users : UserPlus}
              titre={
                recherche || statut.length > 0 || visibilite.length > 0
                  ? "Aucun partenaire ne correspond aux filtres"
                  : "Aucun partenaire pour le moment"
              }
              message={
                recherche || statut.length > 0 || visibilite.length > 0
                  ? "Essayez de modifier la recherche ou de reinitialiser les filtres."
                  : "Enregistrez votre premier partenaire avant de creer un partenariat ou un projet."
              }
              action={
                !recherche && statut.length === 0 && visibilite.length === 0 ? (
                  <Button onClick={() => setDialogueOuvert(true)}>
                    <Plus />
                    Nouveau partenaire
                  </Button>
                ) : undefined
              }
            />
          )}

          {data && data.meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-end gap-2 text-sm text-muted-foreground">
              <Button variant="outline" size="icon-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft />
              </Button>
              <span>
                Page {data.meta.page} sur {data.meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={page >= data.meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogueOuvert} onOpenChange={setDialogueOuvert}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau partenaire</DialogTitle>
            <DialogDescription>
              Le partenaire sera automatiquement rattache a votre etablissement.
            </DialogDescription>
          </DialogHeader>
          <PartenaireForm
            onSucces={() => {
              setDialogueOuvert(false)
              toast.success("Partenaire cree")
            }}
            onAnnuler={() => setDialogueOuvert(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
