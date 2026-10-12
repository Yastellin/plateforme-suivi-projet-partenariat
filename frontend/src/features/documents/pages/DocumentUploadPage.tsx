// src/features/documents/pages/DocumentUploadPage.tsx

import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { DocumentDropzone } from "@/features/documents/components/DocumentDropzone"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProjets } from "@/features/projets/api/useProjets"
import { useConventions } from "@/features/conventions/api/useConventions"

type Cible = "projet" | "convention"

export function DocumentUploadPage() {
  const navigate = useNavigate()
  const [cible, setCible] = useState<Cible>("projet")
  const [idSelectionne, setIdSelectionne] = useState<string>("")

  const { data: projets, isLoading: projetsEnChargement } = useProjets({ page: 1, limit: 100 })
  const { data: conventions, isLoading: conventionsEnChargement } = useConventions({
    page: 1,
    limit: 100,
  })

  const options =
    cible === "projet"
      ? (projets?.data ?? []).map((p) => ({ id: p.id, libelle: p.nom }))
      : (conventions?.data ?? []).map((c) => ({ id: c.id, libelle: `${c.reference} — ${c.titre}` }))

  const enChargement = cible === "projet" ? projetsEnChargement : conventionsEnChargement

  return (
    <div>
      <PageHeader
        titre="Téléverser un document"
        description="Ajoutez un document PDF ou Word associé à un projet ou une convention."
        actions={
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
          >
            Retour
          </button>
        }
      />

      <Panel className="max-w-xl">
        <PanelBody className="flex flex-col gap-5">
          <Tabs
            value={cible}
            onValueChange={(valeur) => {
              setCible(valeur as Cible)
              setIdSelectionne("")
            }}
          >
            <TabsList>
              <TabsTrigger value="projet">Projet</TabsTrigger>
              <TabsTrigger value="convention">Convention</TabsTrigger>
            </TabsList>

            <TabsContent value="projet" className="mt-4">
              <SelectCible
                libelle="Projet concerné"
                id={idSelectionne}
                onChange={setIdSelectionne}
                options={options}
                chargement={enChargement}
                messageVide="Aucun projet disponible"
              />
            </TabsContent>

            <TabsContent value="convention" className="mt-4">
              <SelectCible
                libelle="Convention concernée"
                id={idSelectionne}
                onChange={setIdSelectionne}
                options={options}
                chargement={enChargement}
                messageVide="Aucune convention disponible"
              />
            </TabsContent>
          </Tabs>

          {idSelectionne ? (
            <DocumentDropzone
              {...(cible === "projet"
                ? { projetId: idSelectionne }
                : { conventionId: idSelectionne })}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sélectionnez d'abord un projet ou une convention : tout document doit être rattaché à
              l'un des deux.
            </p>
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}

function SelectCible({
  libelle,
  id,
  onChange,
  options,
  chargement,
  messageVide,
}: {
  libelle: string
  id: string
  onChange: (id: string) => void
  options: { id: string; libelle: string }[]
  chargement: boolean
  messageVide: string
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="cible" requis>{libelle}</Label>
      <Select value={id} onValueChange={onChange} disabled={chargement}>
        <SelectTrigger id="cible">
          <SelectValue placeholder={chargement ? "Chargement..." : "Choisir..."} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 && !chargement ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">{messageVide}</p>
          ) : (
            options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.libelle}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
