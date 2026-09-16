// src/components/forms/wizard/Wizard.tsx
import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { WizardProgressBar } from "@/components/forms/wizard/WizardProgressBar"

interface WizardProps {
  etapes: { titre: string; contenu: ReactNode; validerPourContinuer?: boolean }[]
  onTermine: () => void
  enCours?: boolean
}

export function Wizard({ etapes, onTermine, enCours }: WizardProps) {
  const [etapeActive, setEtapeActive] = useState(0)
  const derniereEtape = etapeActive === etapes.length - 1

  const suivant = () => {
    if (derniereEtape) {
      onTermine()
    } else {
      setEtapeActive((e) => e + 1)
    }
  }

  const precedent = () => setEtapeActive((e) => Math.max(0, e - 1))

  return (
    <div className="flex flex-col gap-6">
      <WizardProgressBar etapes={etapes.map((e) => e.titre)} etapeActive={etapeActive} />

      <div className="min-h-48">{etapes[etapeActive].contenu}</div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={precedent} disabled={etapeActive === 0 || enCours}>
          Precedent
        </Button>
        <Button
          type="button"
          onClick={suivant}
          disabled={etapes[etapeActive].validerPourContinuer === false || enCours}
        >
          {derniereEtape ? "Terminer" : "Suivant"}
        </Button>
      </div>
    </div>
  )
}