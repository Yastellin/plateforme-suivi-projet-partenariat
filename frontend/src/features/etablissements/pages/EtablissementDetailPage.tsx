// src/features/etablissements/pages/EtablissementDetailPage.tsx
import { useParams } from "react-router-dom"
import { Building2 } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { useEtablissement } from "@/features/etablissements/api/useEtablissement"
import { Skeleton } from "@/components/ui/skeleton"

export function EtablissementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: etablissement, isLoading } = useEtablissement(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (!etablissement) {
    return (
      <div className="p-6">
        <EmptyState icon={Building2} titre="Établissement introuvable" message="Cet établissement n'existe pas ou a été supprimé." />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">{etablissement.nom}</h1>
        {etablissement.sigle && (
          <p className="mt-1 font-data text-sm text-muted-foreground">{etablissement.sigle}</p>
        )}
      </div>

      {etablissement.description && (
        <div className="rounded-xl border border-border p-5">
          <h2 className="mb-2 font-heading text-sm font-semibold">Description</h2>
          <p className="text-[13px] leading-relaxed text-muted-foreground">{etablissement.description}</p>
        </div>
      )}
    </div>
  )
}
