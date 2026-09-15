// src/features/projets/pages/ProjetsListePage.tsx
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
import { ProjetFiltres } from "@/features/projets/components/ProjetFiltres"
import { ProjetForm } from "@/features/projets/components/ProjetForm"
import { useProjets } from "@/features/projets/api/useProjets"
import { useDebounce } from "@/hooks/useDebounce"
import { toast } from "sonner"

const LIMITE_PAR_PAGE = 20

export function ProjetsListePage() {
  
  const [recherche, setRecherche] = useState("")
  const [statut, setStatut] = useState<string[]>([])
  const [bailleur, setBailleur] = useState<string[]>([])
  const [beneficiaire, setBeneficiaire] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [dialogueOuvert, setDialogueOuvert] = useState(false)

  const rechercheDebouncee = useDebounce(recherche, 300)

  const filtres = useMemo(
    () => ({
      page,
      limit: LIMITE_PAR_PAGE,
      nom: rechercheDebouncee || undefined,
      statut: statut.length === 1 ? statut[0] : undefined,
      bailleur: bailleur.length === 1 ? bailleur[0] : undefined,
      beneficiaire: beneficiaire.length === 1 ? beneficiaire[0] : undefined,
    }),
    [page, rechercheDebouncee, statut, bailleur, beneficiaire]
  )

  const { data, isLoading } = useProjets(filtres)

  const changementFiltres = (valeurs: {
    recherche: string
    statut: string[]
    bailleur: string[]
    beneficiaire: string[]
  }) => {
    setRecherche(valeurs.recherche)
    setStatut(valeurs.statut)
    setBailleur(valeurs.bailleur)
    setBeneficiaire(valeurs.beneficiaire)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Projets</h1>
          <p className="text-sm text-muted-foreground">
            {data
              ? `${data.meta.total} projet${data.meta.total > 1 ? "s" : ""} reference${data.meta.total > 1 ? "s" : ""}`
              : "Chargement..."}
          </p>
        </div>
        <Button onClick={() => setDialogueOuvert(true)}>
          <Plus />
          Nouveau projet
        </Button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <ProjetFiltres
            valeurs={{ recherche, statut, bailleur, beneficiaire }}
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
              {data.data.map((projet) => (
                // TODO: Remplacer par la carte de projet appropriée lorsqu'elle existe
                <div
                  key={projet.id}
                  className="group rounded-md border border-border p-4 hover:bg-sidebar-accent transition-colors"
                >
                  <h3 className="font-heading text-sm font-semibold truncate">
                    {projet.nom}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {projet.bailleur || projet.beneficiaire
                      ? `${projet.bailleur || ""} / ${projet.beneficiaire || ""}`
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={recherche || statut.length > 0 || bailleur.length > 0 || beneficiaire.length > 0 ? Plus : UserPlus}
              titre={
                recherche || statut.length > 0 || bailleur.length > 0 || beneficiaire.length > 0
                  ? "Aucun projet ne correspond aux filtres"
                  : "Aucun projet pour le moment"
              }
              message={
                recherche || statut.length > 0 || bailleur.length > 0 || beneficiaire.length > 0
                  ? "Essayez de modifier la recherche ou de reinitialiser les filtres."
                  : "Enregistrez votre premier projet avant de créer un partenariat ou un autre projet."
              }
              action={
                !recherche && statut.length === 0 && bailleur.length === 0 && beneficiaire.length === 0 ? (
                  <Button onClick={() => setDialogueOuvert(true)}>
                    <Plus />
                    Nouveau projet
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
            <DialogTitle>Nouveau projet</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire ci-dessous pour créer un nouveau projet.
            </DialogDescription>
          </DialogHeader>
          <ProjetForm
            onSucces={() => {
              setDialogueOuvert(false)
              toast.success("Projet créé")
            }}
            onAnnuler={() => setDialogueOuvert(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}