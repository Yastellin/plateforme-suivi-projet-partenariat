// src/features/publications/pages/PublicationEditPage.tsx

import { useParams } from "react-router-dom"
import { PublicationEditeur } from "@/features/publications/components/PublicationEditeur"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"

export function PublicationEditPage() {
  const { projetId } = useParams<{ projetId: string }>()

  if (!projetId) {
    return <p className="text-[13.5px] text-[var(--color-text-secondary)]">Projet non spécifié.</p>
  }

  return (
    <div>
      <PageHeader
        titre="Publication"
        description="Créez ou modifiez la publication du projet."
      />

      <Panel>
        <PanelBody>
          <PublicationEditeur projetId={projetId} />
        </PanelBody>
      </Panel>
    </div>
  )
}
