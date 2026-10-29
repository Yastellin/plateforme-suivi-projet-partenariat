import { useNavigate, useParams } from "react-router-dom"
import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { Skeleton } from "@/components/ui/skeleton"
import { ConventionForm } from "@/features/conventions/components/ConventionForm"
import { useConvention } from "@/features/conventions/api/useConvention"
import { FileText } from "lucide-react"

export function ConventionEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: convention, isLoading } = useConvention(id)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full rounded-[var(--radius)]" />
      </div>
    )
  }

  if (!convention) {
    return (
      <EmptyState
        icone={FileText}
        titre="Convention introuvable"
        description="Cette convention n'existe pas ou a été supprimée."
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <PageHeader
        titre="Modifier la convention"
        description={convention.reference}
      />
      <Panel>
        <PanelBody className="p-5 sm:p-6">
          <ConventionForm
            convention={convention}
            onSucces={() => navigate("/presidence/conventions")}
            onAnnuler={() => navigate("/presidence/conventions")}
          />
        </PanelBody>
      </Panel>
    </div>
  )
}
