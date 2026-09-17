// src/features/synthese/pages/SynthesePage.tsx
import { useState } from "react"
import { SyntheseCompteurs } from "@/features/synthese/components/SyntheseCompteurs"
import { SyntheseFormulaireNarratif } from "@/features/synthese/components/SyntheseFormulaireNarratif"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSynthese } from "@/features/synthese/api/useSynthese"

export function SynthesePage() {
  const anneeActuelle = new Date().getFullYear()
  const etablissementId = ""
  const [annee, setAnnee] = useState(anneeActuelle)

  const { data: synthese, isLoading } = useSynthese({ etablissement_id: etablissementId, annee })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-foreground">Synthese annuelle</h1>
        <Select value={String(annee)} onValueChange={(v) => setAnnee(Number(v))}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[anneeActuelle, anneeActuelle - 1, anneeActuelle - 2].map((a) => (
              <SelectItem key={a} value={String(a)}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!etablissementId ? (
        <p className="text-sm text-muted-foreground">Selectionnez un etablissement pour afficher sa synthese.</p>
      ) : isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement...</p>
      ) : synthese ? (
        <>
          <SyntheseCompteurs synthese={synthese} />
          <SyntheseFormulaireNarratif
            etablissementId={etablissementId}
            annee={annee}
            items={synthese.items_narratifs}
          />
        </>
      ) : null}
    </div>
  )
}