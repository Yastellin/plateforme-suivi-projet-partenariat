// src/features/projets/activites/components/ActiviteForm.tsx
import { useForm } from "react-hook-form"
import { LoaderCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCreateActivite } from "@/features/projets/activites/api/useCreateActivite"
import { useActivites } from "@/features/projets/activites/api/useActivites"

interface FormValues {
  intitule: string
  date_echeance?: string
}

export function ActiviteForm({ projetId }: { projetId: string }) {
  const { data: activites } = useActivites(projetId)
  const creation = useCreateActivite(projetId)

  const { register, handleSubmit, reset } = useForm<FormValues>({ mode: "onChange" })

  const onSubmit = (valeurs: FormValues) => {
    creation.mutate(
      { intitule: valeurs.intitule, ordre: (activites?.length ?? 0) + 1, date_echeance: valeurs.date_echeance },
      { onSuccess: () => reset() }
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2" noValidate>
      <div className="flex-1">
        <Input placeholder="Nouvelle activite..." {...register("intitule", { required: true })} />
      </div>
      <Input type="date" className="w-40" {...register("date_echeance")} />
      <Button type="submit" size="icon" disabled={creation.isPending}>
        {creation.isPending ? <LoaderCircle className="animate-spin" /> : <Plus size={16} />}
      </Button>
    </form>
  )
}