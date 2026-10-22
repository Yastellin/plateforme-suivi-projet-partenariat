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
import { useCotutelles } from "@/features/cotutelles/api/useCotutelles"
import { usePartenariats } from "@/features/partenariats/api/usePartenariats"

type Cible = "projet" | "convention" | "cotutelle" | "partenariat"

const CONFIGURATION_CIBLES: Record<Cible, { onglet: string; libelle: string; vide: string }> = {
  projet: { onglet: "Projet", libelle: "Projet concerné", vide: "Aucun projet disponible" },
  convention: { onglet: "Convention", libelle: "Convention concernée", vide: "Aucune convention disponible" },
  cotutelle: { onglet: "Cotutelle", libelle: "Cotutelle concernée", vide: "Aucune cotutelle disponible" },
  partenariat: { onglet: "Partenariat", libelle: "Partenariat concerné", vide: "Aucun partenariat disponible" },
}

export function DocumentUploadPage() {
  const navigate = useNavigate()
  const [cible, setCible] = useState<Cible>("projet")
  const [idSelectionne, setIdSelectionne] = useState("")

  const projets = useProjets({ page: 1, limit: 100 })
  const conventions = useConventions({ page: 1, limit: 100 })
  const cotutelles = useCotutelles({ page: 1, limit: 100 })
  const partenariats = usePartenariats({ page: 1, limit: 100 })

  const sources = {
    projet: {
      options: (projets.data?.data ?? []).map((item) => ({ id: item.id, libelle: item.nom })),
      chargement: projets.isLoading,
    },
    convention: {
      options: (conventions.data?.data ?? []).map((item) => ({ id: item.id, libelle: `${item.reference} — ${item.titre}` })),
      chargement: conventions.isLoading,
    },
    cotutelle: {
      options: (cotutelles.data?.data ?? []).map((item) => ({ id: item.id, libelle: `Thèse de ${item.nom_doctorant}` })),
      chargement: cotutelles.isLoading,
    },
    partenariat: {
      options: (partenariats.data?.data ?? []).map((item) => ({ id: item.id, libelle: item.intitule })),
      chargement: partenariats.isLoading,
    },
  } satisfies Record<Cible, { options: { id: string; libelle: string }[]; chargement: boolean }>

  const configuration = CONFIGURATION_CIBLES[cible]
  const source = sources[cible]

  const cibleDocument = idSelectionne
    ? cible === "projet"
      ? { projetId: idSelectionne }
      : cible === "convention"
        ? { conventionId: idSelectionne }
        : cible === "cotutelle"
          ? { cotutelleId: idSelectionne }
          : { partenariatId: idSelectionne }
    : null

  return (
    <div>
      <PageHeader
        titre="Téléverser un document"
        description="Ajoutez un document PDF ou Word et rattachez-le à l'entité concernée."
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

      <Panel className="max-w-2xl">
        <PanelBody className="flex flex-col gap-5">
          <Tabs
            value={cible}
            onValueChange={(valeur) => {
              setCible(valeur as Cible)
              setIdSelectionne("")
            }}
          >
            <TabsList className="flex h-auto flex-wrap">
              {(Object.keys(CONFIGURATION_CIBLES) as Cible[]).map((cle) => (
                <TabsTrigger key={cle} value={cle}>{CONFIGURATION_CIBLES[cle].onglet}</TabsTrigger>
              ))}
            </TabsList>

            {(Object.keys(CONFIGURATION_CIBLES) as Cible[]).map((cle) => (
              <TabsContent key={cle} value={cle} className="mt-4">
                <SelectCible
                  libelle={configuration.libelle}
                  id={idSelectionne}
                  onChange={setIdSelectionne}
                  options={source.options}
                  chargement={source.chargement}
                  messageVide={configuration.vide}
                />
              </TabsContent>
            ))}
          </Tabs>

          {cibleDocument ? (
            <DocumentDropzone {...cibleDocument} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Sélectionnez l'entité à laquelle le document doit être rattaché.
            </p>
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}

function SelectCible({ libelle, id, onChange, options, chargement, messageVide }: {
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
          <SelectValue placeholder={chargement ? "Chargement…" : "Choisir…"} />
        </SelectTrigger>
        <SelectContent>
          {options.length === 0 && !chargement ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">{messageVide}</p>
          ) : options.map((option) => (
            <SelectItem key={option.id} value={option.id}>{option.libelle}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
