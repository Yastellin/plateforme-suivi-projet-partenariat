// src/features/tableau-de-bord/components/GraphiqueStatuts.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import type { CompteursTableauDeBord } from "@/types/api"

export function GraphiqueStatuts({ compteurs }: { compteurs: CompteursTableauDeBord }) {
  const donnees = Object.entries(compteurs.projets_par_statut).map(([statut, total]) => ({ statut, total }))

  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="mb-3 font-heading text-sm font-semibold">Projets par statut</h3>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={donnees}>
          <XAxis dataKey="statut" fontSize={11} />
          <YAxis allowDecimals={false} fontSize={11} />
          <Tooltip />
          <Bar dataKey="total" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}