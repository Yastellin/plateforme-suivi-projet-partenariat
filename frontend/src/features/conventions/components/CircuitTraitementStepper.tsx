// src/features/conventions/components/CircuitTraitementStepper.tsx
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUpdateEtapeCircuit } from "@/features/conventions/api/useUpdateEtapeCircuit"
import type { Convention, EtapeCircuit } from "@/types/api"
import { toast } from "sonner"

const ETAPES: { value: EtapeCircuit; label: string }[] = [
  { value: "REDACTION", label: "Redaction" },
  { value: "TRANSMISSION", label: "Transmission" },
  { value: "VERIFICATION_DAJ", label: "Verification DAJ" },
  { value: "ATTENTE_SIGNATURE", label: "Attente signature" },
  { value: "SIGNEE", label: "Signee" },
]

export function CircuitTraitementStepper({ convention }: { convention: Convention }) {
  const majEtape = useUpdateEtapeCircuit(convention.id)
  const indexActuel = ETAPES.findIndex((e) => e.value === convention.etape_circuit)

  const passerEtapeSuivante = () => {
    const prochaine = ETAPES[indexActuel + 1]
    if (!prochaine) return
    majEtape.mutate(prochaine.value, {
      onSuccess: () => toast.success(`Etape mise a jour : ${prochaine.label}`),
      onError: (erreur) => toast.error(erreur.message),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center">
        {ETAPES.map((etape, index) => {
          const estFranchie = index < indexActuel
          const estActuelle = index === indexActuel

          return (
            <div key={etape.value} className="flex flex-1 items-center last:flex-none">
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium",
                  estFranchie && "border-primary bg-primary text-primary-foreground",
                  estActuelle && "border-primary text-primary",
                  !estFranchie && !estActuelle && "border-border text-muted-foreground"
                )}
              >
                {estFranchie ? <Check size={14} /> : index + 1}
              </div>
              {index < ETAPES.length - 1 && (
                <div className={cn("mx-1.5 h-0.5 flex-1", estFranchie ? "bg-primary" : "bg-border")} />
              )}
            </div>
          )
        })}
      </div>

      <p className="text-sm font-medium">Etape actuelle : {ETAPES[indexActuel]?.label}</p>
      {convention.date_derniere_etape && (
        <p className="text-xs text-muted-foreground">
          Derniere mise a jour le {new Date(convention.date_derniere_etape).toLocaleDateString("fr-FR")}
        </p>
      )}

      {indexActuel < ETAPES.length - 1 && (
        <button
          onClick={passerEtapeSuivante}
          disabled={majEtape.isPending}
          className="self-start text-sm text-primary underline"
        >
          Passer a l'etape suivante ({ETAPES[indexActuel + 1]?.label})
        </button>
      )}
    </div>
  )
}