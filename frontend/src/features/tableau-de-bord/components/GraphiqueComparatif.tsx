// src/features/tableau-de-bord/components/GraphiqueComparatif.tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useComparatifEtablissements } from "@/features/tableau-de-bord/api/useComparatifEtablissements"

export function GraphiqueComparatif() {
  const { data, isLoading } = useComparatifEtablissements()

  if (isLoading || !data) {
    return <p className="text-sm text-muted-foreground">Chargement...</p>
  }

  return (
    <div className="rounded-md border border-border p-4">
      <h3 className="mb-3 font-heading text-sm font-semibold">Comparatif par etablissement</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <XAxis dataKey="etablissement_nom" fontSize={11} />
          <YAxis allowDecimals={false} fontSize={11} />
          <Tooltip />
          <Legend />
          <Bar dataKey="nombre_projets" name="Projets" fill="var(--color-primary)" />
          <Bar dataKey="nombre_partenaires" name="Partenaires" fill="var(--color-chart-2)" />
          <Bar dataKey="nombre_conventions" name="Conventions" fill="var(--color-chart-3)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}