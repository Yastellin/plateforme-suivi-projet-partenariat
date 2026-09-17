// src/features/projets/chronogramme/components/ChronogrammeForm.tsx
import { useForm } from "react-hook-form"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useChronogramme } from "@/features/projets/chronogramme/api/useChronogramme"
import { useCreateEntreeChronogramme } from "@/features/projets/chronogramme/api/useCreateEntreeChronogramme"

interface FormValues {
  annee: number
  trimestre: number
  mois: number
  nombre_jours: number
}

export function ChronogrammeForm({ activiteId }: { activiteId: string }) {
  const { data: entrees } = useChronogramme(activiteId)
  const creation = useCreateEntreeChronogramme(activiteId)

  const { register, handleSubmit, reset } = useForm<FormValues>({ mode: "onChange" })

  return (
    <div className="flex flex-col gap-3">
      <form
        onSubmit={handleSubmit((valeurs) => creation.mutate(valeurs, { onSuccess: () => reset() }))}
        className="grid grid-cols-5 gap-2"
        noValidate
      >
        <Input type="number" placeholder="Annee" {...register("annee", { valueAsNumber: true, required: true })} />
        <Input type="number" placeholder="Trimestre" min={1} max={4} {...register("trimestre", { valueAsNumber: true, required: true })} />
        <Input type="number" placeholder="Mois" min={1} max={12} {...register("mois", { valueAsNumber: true, required: true })} />
        <Input type="number" step="0.5" placeholder="Jours" {...register("nombre_jours", { valueAsNumber: true, required: true })} />
        <Button type="submit" disabled={creation.isPending}>
          {creation.isPending && <LoaderCircle className="animate-spin" />}
          Ajouter
        </Button>
      </form>

      {entrees && entrees.length > 0 && (
        <div className="flex flex-col gap-1">
          {entrees.map((e) => (
            <div key={e.id} className="flex justify-between text-sm text-muted-foreground">
              <Label>{e.mois}/{e.annee} (T{e.trimestre})</Label>
              <span className="font-mono">{e.nombre_jours} j</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}