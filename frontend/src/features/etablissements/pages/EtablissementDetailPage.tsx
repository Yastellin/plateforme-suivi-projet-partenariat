// src/features/etablissements/pages/EtablissementDetailPage.tsx

import { useParams } from "react-router-dom"
import { Building2 } from "lucide-react"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel"
import { useEtablissement } from "@/features/etablissements/api/useEtablissement"
import { Skeleton } from "@/components/ui/skeleton"
import { useTitreBreadcrumb } from "@/contexts/TitreBreadcrumbContext"

export function EtablissementDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: etablissement, isLoading } = useEtablissement(id ?? "")
  useTitreBreadcrumb(etablissement?.nom)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    )
  }

  if (!etablissement) {
    return (
      <EmptyState
        icone={Building2}
        titre="Établissement introuvable"
        description="Cet établissement n'existe pas ou a été supprimé."
      />
    )
  }

  return (
    <div>
      <PageHeader
        titre={etablissement.nom}
        description={etablissement.sigle ?? undefined}
      />

      <Panel>
        <PanelHeader titre="Description" />
        <PanelBody>
          <p className="text-[13.5px] leading-relaxed text-[var(--color-text-secondary)]">
            {etablissement.description ?? "Aucune description renseignée."}
          </p>
        </PanelBody>
      </Panel>
    </div>
  )
}
