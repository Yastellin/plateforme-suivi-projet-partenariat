// src/features/cotutelles/pages/CotutellesListePage.tsx
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
import { CotutelleForm } from "@/features/cotutelles/components/CotutelleForm"
import { useCotutelles } from "@/features/cotutelles/api/useCotutelles"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

const LIMITE_PAR_PAGE = 20

export function CotutellesListePage() {
  
  const [recherche, setRecherche] = useState("")
  const [page, setPage] = useState(1)
  const [dialogueOuvert, setDialogueOuvert] = useState(false)

  const rechercheDebouncee = useDebounce(recherche, 300)

  const filtres = useMemo(
    () => ({
      page,
      limit: LIMITE_PAR_PAGE,
      nom: rechercheDebouncee || undefined,
    }),
    [page, rechercheDebouncee]
  )

  const { data, isLoading } = useCotutelles(filtres)

  const changementFiltres = (valeurs: { recherche: string }) => {
    setRecherche(valeurs.recherche)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Cotutelles</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${data.meta.total} cotutelle${data.meta.total > 1 ? "s" : ""} reference${data.meta.total > 1 ? "s" : ""}`
              : "Chargement..."}
          </p>
        </div>
        <Button onClick={() => setDialogueOuvert(true)}>
          <Plus />
          Nouvelle cotutelle
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <ConventionFiltres
            valeurs={{ recherche, statut: [], etablissement: [] }}
            onChangement={(vals) => changementFiltres({ recherche: vals.recherche })}
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
              {data.data.map((cotutelle) => (
                <div
                  key={cotutelle.id}
                  className="rounded-md border border-border p-4 hover:bg-sidebar-accent transition-colors"
                >
                  <h3 className="font-heading text-sm font-semibold truncate">
                    {cotutelle.nom}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Non rattaché à un établissement spécifique
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={recherche ? Plus : UserPlus}
              titre={
                recherche ? "Aucune cotutelle ne correspond aux filtres"
                : "Aucune cotutelle pour le moment"
              }
              message={
                recherche
                  ? "Essayez de modifier la recherche ou de reinitialiser les filtres."
                  : "Enregistrez votre première cotutelle avant de la créer."
              }
              action={
                !recherche ? (
                  <Button onClick={() => setDialogueOuvert(true)}>
                    <Plus />
                    Nouvelle cotutelle
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
            <DialogTitle>Nouvelle cotutelle</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour créer une nouvelle cotutelle.
            </DialogDescription>
          </DialogHeader>
          <CotutelleForm
            onSucces={() => {
              setDialogueOuvert(false)
              toast.success("Cotutelle créée")
            }}
            onAnnuler={() => setDialogueOuvert(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}