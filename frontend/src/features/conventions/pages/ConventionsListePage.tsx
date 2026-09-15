// src/features/conventions/pages/ConventionsListePage.tsx
import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Plus, UserPlus } from "lucide-react"
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
import { ConventionFiltres } from "@/features/conventions/components/ConventionFiltres"
import { ConventionForm } from "@/features/conventions/components/ConventionForm"
import { useConventions } from "@/features/conventions/api/useConventions"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

const LIMITE_PAR_PAGE = 20

export function ConventionsListePage() {
  
  const [recherche, setRecherche] = useState("")
  const [statut, setStatut] = useState<string[]>([])
  const [etablissement, setEtablissement] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [dialogueOuvert, setDialogueOuvert] = useState(false)

  const rechercheDebouncee = useDebounce(recherche, 300)

  const filtres = useMemo(
    () => ({
      page,
      limit: LIMITE_PAR_PAGE,
      nom: rechercheDebouncee || undefined,
      statut: statut.length === 1 ? statut[0] : undefined,
      etablissement: etablissement.length === 1 ? etablissement[0] : undefined,
    }),
    [page, rechercheDebouncee, statut, etablissement]
  )

  const { data, isLoading } = useConventions(filtres)

  const changementFiltres = (valeurs: {
    recherche: string
    statut: string[]
    etablissement: string[]
  }) => {
    setRecherche(valeurs.recherche)
    setStatut(valeurs.statut)
    setEtablissement(valeurs.etablissement)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Conventions</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${data.meta.total} convention${data.meta.total > 1 ? "s" : ""} reference${data.meta.total > 1 ? "s" : ""}`
              : "Chargement..."}
          </p>
        </div>
        <Button onClick={() => setDialogueOuvert(true)}>
          <Plus />
          Nouvelle convention
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <ConventionFiltres
            valeurs={{ recherche, statut, etablissement }}
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
              {data.data.map((convention) => (
                <div
                  key={convention.id}
                  className="rounded-md border border-border p-4 hover:bg-sidebar-accent transition-colors"
                >
                  <h3 className="font-heading text-sm font-semibold truncate">
                    {convention.nom}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {convention.etablissement_nom || "Non rattaché"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={recherche || statut.length > 0 || etablissement.length > 0 ? Plus : UserPlus}
              titre={
                recherche || statut.length > 0 || etablissement.length > 0
                  ? "Aucune convention ne correspond aux filtres"
                  : "Aucune convention pour le moment"
              }
              message={
                recherche || statut.length > 0 || etablissement.length > 0
                  ? "Essayez de modifier la recherche ou de reinitialiser les filtres."
                  : "Enregistrez votre première convention avant de créer un partenariat ou un projet."
              }
              action={
                !recherche && statut.length === 0 && etablissement.length === 0 ? (
                  <Button onClick={() => setDialogueOuvert(true)}>
                    <Plus />
                    Nouvelle convention
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
            <DialogTitle>Nouvelle convention</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour créer une nouvelle convention.
            </DialogDescription>
          </DialogHeader>
          <ConventionForm
            onSucces={() => {
              setDialogueOuvert(false)
              toast.success("Convention créée")
            }}
            onAnnuler={() => setDialogueOuvert(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}