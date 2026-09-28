// src/features/referentiels/pages/ReferentielsPage.tsx
import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { DestructiveConfirmDialog } from "@/components/shared/DestructiveConfirmDialog"
import { useDebounce } from "@/hooks/useDebounce"

import { usePorteurs } from "@/features/referentiels/api/usePorteurs"
import { useCreatePorteur } from "@/features/referentiels/api/useCreatePorteur"
import { useUpdatePorteur } from "@/features/referentiels/api/useUpdatePorteur"
import { useDeletePorteur } from "@/features/referentiels/api/useDeletePorteur"
import { useBailleurs } from "@/features/referentiels/api/useBailleurs"
import { useCreateBailleur } from "@/features/referentiels/api/useCreateBailleur"
import { useUpdateBailleur } from "@/features/referentiels/api/useUpdateBailleur"
import { useDeleteBailleur } from "@/features/referentiels/api/useDeleteBailleur"
import { useBeneficiaires } from "@/features/referentiels/api/useBeneficiaires"
import { useCreateBeneficiaire } from "@/features/referentiels/api/useCreateBeneficiaire"
import { useUpdateBeneficiaire } from "@/features/referentiels/api/useUpdateBeneficiaire"
import { useDeleteBeneficiaire } from "@/features/referentiels/api/useDeleteBeneficiaire"
import { useSites } from "@/features/referentiels/api/useSites"
import { useCreateSite } from "@/features/referentiels/api/useCreateSite"
import { useUpdateSite } from "@/features/referentiels/api/useUpdateSite"
import { useDeleteSite } from "@/features/referentiels/api/useDeleteSite"

interface LigneTableau {
  id: string
  nom: string
}

interface TableauReferentielProps {
  donnees: LigneTableau[] | undefined
  isLoading: boolean
  onCreer: (nom: string, extra?: string) => void
  onModifier: (id: string, nom: string, extra?: string) => void
  onSupprimer: (id: string) => void
  champExtra?: { label: string; key: string; get: (el: LigneTableau) => string }
}

function TableauReferentiel({
  donnees,
  isLoading,
  onCreer,
  onModifier,
  onSupprimer,
  champExtra,
}: TableauReferentielProps) {
  const [recherche, setRecherche] = useState("")
  const [dialogueOuvert, setDialogueOuvert] = useState(false)
  const [elementSelectionne, setElementSelectionne] = useState<LigneTableau | null>(null)
  const [suppressionId, setSuppressionId] = useState<string | null>(null)
  const [nomForm, setNomForm] = useState("")
  const [extraForm, setExtraForm] = useState("")

  const rechercheDebouncee = useDebounce(recherche, 300)

  const filtered = donnees?.filter((d) =>
    d.nom.toLowerCase().includes(rechercheDebouncee.toLowerCase()),
  )

  function ouvrirCreation() {
    setElementSelectionne(null)
    setNomForm("")
    setExtraForm("")
    setDialogueOuvert(true)
  }

  function ouvrirModification(element: LigneTableau) {
    setElementSelectionne(element)
    setNomForm(element.nom)
    setExtraForm(champExtra?.get(element) ?? "")
    setDialogueOuvert(true)
  }

  function gererSoumission() {
    if (!nomForm.trim()) return
    if (elementSelectionne) {
      onModifier(elementSelectionne.id, nomForm.trim(), extraForm.trim())
    } else {
      onCreer(nomForm.trim(), extraForm.trim())
    }
    setDialogueOuvert(false)
  }

  if (isLoading) {
    return <p className="p-4 text-sm text-muted-foreground">Chargement...</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher..."
          className="h-9 max-w-sm text-[13px]"
        />
        <Button onClick={ouvrirCreation} className="h-9">
          <Plus size={14} className="mr-1" />
          Ajouter
        </Button>
      </div>

      {!filtered || filtered.length === 0 ? (
        <EmptyState
          icon={Plus}
          titre={recherche ? "Aucun résultat" : "Aucun élément"}
          message={recherche ? "Essayez de modifier la recherche." : "Ajoutez un élément pour commencer."}
        />
      ) : (
        <div className="rounded-xl border border-border">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Nom</th>
                {champExtra && <th className="px-4 py-3 font-semibold">{champExtra.label}</th>}
                <th className="w-24 px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((element) => (
                <tr key={element.id} className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{element.nom}</td>
                  {champExtra && (
                    <td className="px-4 py-3 text-muted-foreground">
                      {champExtra.get(element) || "—"}
                    </td>
                  )}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => ouvrirModification(element)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => setSuppressionId(element.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={dialogueOuvert} onOpenChange={setDialogueOuvert}>
        <DialogContent className="sm:max-w-[430px]">
          <DialogHeader>
            <DialogTitle>{elementSelectionne ? "Modifier" : "Ajouter"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nom-ref">Nom</Label>
              <Input id="nom-ref" value={nomForm} onChange={(e) => setNomForm(e.target.value)} placeholder="Nom..." autoFocus />
            </div>
            {champExtra && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="extra-ref">{champExtra.label}</Label>
                <Input id="extra-ref" value={extraForm} onChange={(e) => setExtraForm(e.target.value)} placeholder={champExtra.label} />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogueOuvert(false)}>Annuler</Button>
              <Button onClick={gererSoumission} disabled={!nomForm.trim()}>
                {elementSelectionne ? "Enregistrer" : "Créer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DestructiveConfirmDialog
        ouvert={suppressionId !== null}
        onFermer={() => setSuppressionId(null)}
        onConfirmer={() => {
          if (suppressionId) onSupprimer(suppressionId)
          setSuppressionId(null)
          toast.success("Élément supprimé")
        }}
        titre="Supprimer cet élément"
        description="Cette action est irréversible."
        texteConfirmation="SUPPRIMER"
        libelleBouton="Supprimer"
      />
    </div>
  )
}

function PorteursTab() {
  const { data, isLoading } = usePorteurs()
  const createPorteur = useCreatePorteur()
  const updatePorteur = useUpdatePorteur()
  const deletePorteur = useDeletePorteur()

  return (
    <TableauReferentiel
      donnees={data?.data}
      isLoading={isLoading}
      onCreer={(nom, extra) => createPorteur.mutate({ nom, institution_rattachement: extra })}
      onModifier={(id, nom, extra) => updatePorteur.mutate({ id, donnees: { nom, institution_rattachement: extra } }, { onSuccess: () => toast.success("Porteur modifié") })}
      onSupprimer={(id) => deletePorteur.mutate(id)}
      champExtra={{ label: "Institution", key: "institution_rattachement", get: (el) => String((el as any).institution_rattachement ?? "") }}
    />
  )
}

function BailleursTab() {
  const { data, isLoading } = useBailleurs()
  const createBailleur = useCreateBailleur()
  const updateBailleur = useUpdateBailleur()
  const deleteBailleur = useDeleteBailleur()

  return (
    <TableauReferentiel
      donnees={data?.data}
      isLoading={isLoading}
      onCreer={(nom, extra) => createBailleur.mutate({ nom, description: extra })}
      onModifier={(id, nom, extra) => updateBailleur.mutate({ id, donnees: { nom, description: extra } }, { onSuccess: () => toast.success("Bailleur modifié") })}
      onSupprimer={(id) => deleteBailleur.mutate(id)}
      champExtra={{ label: "Description", key: "description", get: (el) => String((el as any).description ?? "") }}
    />
  )
}

function BeneficiairesTab() {
  const { data, isLoading } = useBeneficiaires()
  const createBeneficiaire = useCreateBeneficiaire()
  const updateBeneficiaire = useUpdateBeneficiaire()
  const deleteBeneficiaire = useDeleteBeneficiaire()

  return (
    <TableauReferentiel
      donnees={data?.data}
      isLoading={isLoading}
      onCreer={(nom, extra) => createBeneficiaire.mutate({ nom, categorie: extra })}
      onModifier={(id, nom, extra) => updateBeneficiaire.mutate({ id, donnees: { nom, categorie: extra } }, { onSuccess: () => toast.success("Bénéficiaire modifié") })}
      onSupprimer={(id) => deleteBeneficiaire.mutate(id)}
      champExtra={{ label: "Catégorie", key: "categorie", get: (el) => String((el as any).categorie ?? "") }}
    />
  )
}

function SitesTab() {
  const { data, isLoading } = useSites()
  const createSite = useCreateSite()
  const updateSite = useUpdateSite()
  const deleteSite = useDeleteSite()

  return (
    <TableauReferentiel
      donnees={data?.data}
      isLoading={isLoading}
      onCreer={(nom, extra) => createSite.mutate({ nom, description: extra })}
      onModifier={(id, nom, extra) => updateSite.mutate({ id, donnees: { nom, description: extra } }, { onSuccess: () => toast.success("Site modifié") })}
      onSupprimer={(id) => deleteSite.mutate(id)}
      champExtra={{ label: "Description", key: "description", get: (el) => String((el as any).description ?? "") }}
    />
  )
}

export function ReferentielsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">Référentiels</h1>
      <Tabs defaultValue="porteurs">
        <TabsList>
          <TabsTrigger value="porteurs">Porteurs</TabsTrigger>
          <TabsTrigger value="bailleurs">Bailleurs</TabsTrigger>
          <TabsTrigger value="beneficiaires">Bénéficiaires</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
        </TabsList>
        <TabsContent value="porteurs" className="mt-4"><PorteursTab /></TabsContent>
        <TabsContent value="bailleurs" className="mt-4"><BailleursTab /></TabsContent>
        <TabsContent value="beneficiaires" className="mt-4"><BeneficiairesTab /></TabsContent>
        <TabsContent value="sites" className="mt-4"><SitesTab /></TabsContent>
      </Tabs>
    </div>
  )
}
