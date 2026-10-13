// src/features/referentiels/pages/ReferentielsPage.tsx

import { useState } from "react"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { TableToolbar } from "@/components/shared/TableToolbar"
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

interface TableauReferentielProps {
  donnees: { id: string; nom: string }[] | undefined
  isLoading: boolean
  onCreer: (nom: string, extra?: string) => void
  onModifier: (id: string, nom: string, extra?: string) => void
  onSupprimer: (id: string) => void
  champExtra?: { label: string; key: string; get: (el: { id: string; nom: string }) => string }
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
  const [elementSelectionne, setElementSelectionne] = useState<{ id: string; nom: string } | null>(null)
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

  function ouvrirModification(element: { id: string; nom: string }) {
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

  return (
    <div>
      <TableToolbar
        valeurRecherche={recherche}
        onRechercheChange={setRecherche}
        placeholderRecherche="Rechercher…"
        action={
          <button
            type="button"
            onClick={ouvrirCreation}
            className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Ajouter
          </button>
        }
      />

      <PanelBody>
        {isLoading ? (
          <p className="text-[13px] text-[var(--color-text-secondary)]">Chargement…</p>
        ) : !filtered || filtered.length === 0 ? (
          <EmptyState
            icone={Plus}
            titre={recherche ? "Aucun résultat" : "Aucun élément"}
            description={recherche ? "Essayez de modifier la recherche." : "Ajoutez un élément pour commencer."}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">Nom</th>
                  {champExtra && (
                    <th scope="col" className="whitespace-nowrap border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px] text-left text-[11.5px] font-bold uppercase tracking-[.04em] text-[var(--color-text-secondary)]">{champExtra.label}</th>
                  )}
                  <th scope="col" className="w-24 border-b border-[var(--color-border)] bg-[var(--color-page-bg)] px-[18px] py-[11px]" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((element) => (
                  <tr key={element.id} className="hover:bg-[var(--color-page-bg)]">
                    <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] font-semibold">{element.nom}</td>
                    {champExtra && (
                      <td className="border-b border-[var(--color-border)] px-[18px] py-[13px] text-[var(--color-text-secondary)]">
                        {champExtra.get(element) || "—"}
                      </td>
                    )}
                    <td className="border-b border-[var(--color-border)] px-[18px] py-[13px]">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => ouvrirModification(element)}
                          aria-label={`Modifier ${element.nom}`}
                          className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--color-active-zone)] hover:text-[var(--color-brand-deep)]"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSuppressionId(element.id)}
                          aria-label={`Supprimer ${element.nom}`}
                          className="rounded p-1 text-[var(--color-text-secondary)] hover:bg-[var(--status-expire-bg)] hover:text-[var(--status-expire-fg)]"
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
      </PanelBody>

      <Dialog open={dialogueOuvert} onOpenChange={setDialogueOuvert}>
        <DialogContent className="sm:max-w-[430px]">
          <DialogHeader>
            <DialogTitle>{elementSelectionne ? "Modifier" : "Ajouter"}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nom-ref" requis>Nom</Label>
              <Input id="nom-ref" value={nomForm} onChange={(e) => setNomForm(e.target.value)} placeholder="Nom…" autoFocus />
            </div>
            {champExtra && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="extra-ref">{champExtra.label}</Label>
                <Input id="extra-ref" value={extraForm} onChange={(e) => setExtraForm(e.target.value)} placeholder={champExtra.label} />
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDialogueOuvert(false)}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3.5 py-2 text-[13px] font-semibold hover:bg-[var(--color-chrome-hover)]"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={gererSoumission}
                disabled={!nomForm.trim()}
                className="rounded-[var(--radius-sm)] bg-[var(--color-brand)] px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[var(--color-brand-deep)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {elementSelectionne ? "Enregistrer" : "Créer"}
              </button>
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
        nomCible={donnees?.find((d) => d.id === suppressionId)?.nom ?? "ÉLÉMENT"}
        libelleAction="Supprimer"
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
      champExtra={{ label: "Institution", key: "institution_rattachement", get: (el) => String((el as Record<string, unknown>).institution_rattachement ?? "") }}
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
      champExtra={{ label: "Description", key: "description", get: (el) => String((el as Record<string, unknown>).description ?? "") }}
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
      champExtra={{ label: "Catégorie", key: "categorie", get: (el) => String((el as Record<string, unknown>).categorie ?? "") }}
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
      champExtra={{ label: "Description", key: "description", get: (el) => String((el as Record<string, unknown>).description ?? "") }}
    />
  )
}

export function ReferentielsPage() {
  return (
    <div>
      <PageHeader
        titre="Référentiels"
        description="Gérez les porteurs, bailleurs, bénéficiaires et sites."
      />

      <Tabs defaultValue="porteurs">
        <TabsList>
          <TabsTrigger value="porteurs">Porteurs</TabsTrigger>
          <TabsTrigger value="bailleurs">Bailleurs</TabsTrigger>
          <TabsTrigger value="beneficiaires">Bénéficiaires</TabsTrigger>
          <TabsTrigger value="sites">Sites</TabsTrigger>
        </TabsList>
        <TabsContent value="porteurs" className="mt-4">
          <Panel><PorteursTab /></Panel>
        </TabsContent>
        <TabsContent value="bailleurs" className="mt-4">
          <Panel><BailleursTab /></Panel>
        </TabsContent>
        <TabsContent value="beneficiaires" className="mt-4">
          <Panel><BeneficiairesTab /></Panel>
        </TabsContent>
        <TabsContent value="sites" className="mt-4">
          <Panel><SitesTab /></Panel>
        </TabsContent>
      </Tabs>
    </div>
  )
}
