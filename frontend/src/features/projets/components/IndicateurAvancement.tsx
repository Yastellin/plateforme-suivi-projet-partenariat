// src/features/projets/components/IndicateurAvancement.tsx
import { useAvancement } from "@/features/projets/api/useAvancement"

export function IndicateurAvancement({ projetId }: { projetId: string }) {
  const { data, isLoading } = useAvancement(projetId)

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Calcul de l'avancement...</p>
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Avancement</span>
        <span className="font-mono font-medium">{Math.round(data.pourcentage)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min(100, Math.max(0, data.pourcentage))}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        {data.activites_terminees} / {data.activites_total} activites terminees
      </p>
    </div>
  )
}