// src/features/partenariats/pages/PartenariatsListePage.tsx
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
import { PartenariatForm } from "@/features/partenariats/components/PartenariatForm"
import { usePartenariats } from "@/features/partenariats/api/usePartenariats"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

const LIMITE_PAR_PAGE = 20

export function PartenariatsListePage() {
  
  const [recherche, setRecherche] = useState("")
  const [statut, setStatut] = useState<string[]>([])
  const [type, setType] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [dialogueOuvert, setDialogueOuvert] = useState(false)

  const rechercheDebouncee = useDebounce(recherche, 300)

  const filtres = useMemo(
    () => ({
      page,
      limit: LIMITE_PAR_PAGE,
      nom: rechercheDebouncee || undefined,
      statut: statut.length === 1 ? statut[0] : undefined,
      type: type.length === 1 ? type[0] : undefined,
    }),
    [page, rechercheDebouncee, statut, type]
  )

  const { data, isLoading } = usePartenariats(filtres)

  const changementFiltres = (valeurs: {
    recherche: string
    statut: string[]
    type: string[]
  }) => {
    setRecherche(valeurs.recherche)
    setStatut(valeurs.statut)
    setType(valeurs.type)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Partenariats</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${data.meta.total} partenariat${data.meta.total > 1 ? "s" : ""} reference${data.meta.total > 1 ? "s" : ""}`
              : "Chargement..."}
          </p>
        </div>
        <Button onClick={() => setDialogueOuvert(true)}>
          <Plus />
          Nouveau partenariat
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <ConventionFiltres
            valeurs={{ recherche, statut, etablissement: type }}
            onChangement={(vals) => changementFiltres({ recherche: vals.recherche, statut: vals.statut, type: vals.etablissement })}
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
              {data.data.map((partenariat) => (
                <div
                  key={partenariat.id}
                  className="rounded-md border border-border p-4 hover:bg-sidebar-accent transition-colors"
                >
                  <h3 className="font-heading text-sm font-semibold truncate">
                    {partenariat.intitule}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {partenariat.domaine}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={recherche || statut.length > 0 || type.length > 0 ? Plus : UserPlus}
              titre={
                recherche || statut.length > 0 || type.length > 0
                  ? "Aucun partenariat ne correspond aux filtres"
                  : "Aucun partenariat pour le moment"
              }
              message={
                recherche || statut.length > 0 || type.length > 0
                  ? "Essayez de modifier la recherche ou de reinitialiser les filtres."
                  : "Enregistrez votre premier partenariat avant de le créer."
              }
              action={
                !recherche && statut.length === 0 && type.length === 0 ? (
                  <Button onClick={() => setDialogueOuvert(true)}>
                    <Plus />
                    Nouveau partenariat
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
            <DialogTitle>Nouveau partenariat</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour créer un nouveau partenariat.
            </DialogDescription>
          </DialogHeader>
          <PartenariatForm
            onSucces={() => {
              setDialogueOuvert(false)
              toast.success("Partenariat créé")
            }}
            onAnnuler={() => setDialogueOuvert(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}