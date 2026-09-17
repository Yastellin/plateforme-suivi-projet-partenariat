// src/features/synthese/components/SyntheseFormulaireNarratif.tsx
import { useForm } from "react-hook-form"
import { LoaderCircle, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCreateSyntheseItem } from "@/features/synthese/api/useCreateSyntheseItem"
import type { SyntheseItem } from "@/types/api"

const TYPES_NARRATIFS = [
  { value: "DOMAINE_PRINCIPAL", label: "Domaine principal" },
  { value: "DEFI_MAJEUR", label: "Defi majeur" },
  { value: "PRIORITE_FUTURE", label: "Priorite future" },
]

interface FormValues {
  type: string
  valeur: string
}

export function SyntheseFormulaireNarratif({
  etablissementId,
  annee,
  items,
}: {
  etablissementId: string
  annee: number
  items: SyntheseItem[]
}) {
  const creation = useCreateSyntheseItem()
  const { register, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: { type: "DOMAINE_PRINCIPAL", valeur: "" },
  })

  const onSubmit = (valeurs: FormValues) => {
    creation.mutate(
      { etablissement_id: etablissementId, annee, ...valeurs },
      {
        onSuccess: () => {
          toast.success("Element narratif ajoute")
          reset({ type: valeurs.type, valeur: "" })
        },
      }
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {TYPES_NARRATIFS.map((t) => (
        <div key={t.value}>
          <h3 className="mb-1 font-heading text-sm font-semibold">{t.label}</h3>
          <ul className="mb-2 flex flex-col gap-1">
            {items.filter((i) => i.type === t.value).map((i) => (
              <li key={i.id} className="text-sm text-muted-foreground">— {i.valeur}</li>
            ))}
          </ul>
        </div>
      ))}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2" noValidate>
        <Select value={watch("type")} onValueChange={(v) => reset({ ...watch(), type: v })}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPES_NARRATIFS.map((t) => (
              <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea placeholder="Nouvel element..." {...register("valeur", { required: true })} />
        <Button type="submit" disabled={creation.isPending} className="self-start">
          {creation.isPending ? <LoaderCircle className="animate-spin" /> : <Plus size={16} />}
          Ajouter
        </Button>
      </form>
    </div>
  )
}