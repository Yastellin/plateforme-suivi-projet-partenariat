// src/features/publications/pages/PublicationEditPage.tsx

import { useParams } from "react-router-dom"
import { PublicationEditeur } from "@/features/publications/components/PublicationEditeur"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"

// Les identifiants de projet sont generes par randomUUID() cote backend
// (colonnes en text mais contenu UUID), d'ou ce motif strict.
const PATTERN_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function PublicationEditPage() {
  const { projetId } = useParams<{ projetId: string }>()

  if (!projetId) {
    return <p className="text-[13.5px] text-[var(--color-text-secondary)]">Projet non spécifié.</p>
  }

  // Garde-fou : refuse les valeurs non-UUID (ex. "nouveau") pour ne jamais
  // les transmettre comme projet_id au backend.
  if (!PATTERN_UUID.test(projetId)) {
    return <p className="text-[13.5px] text-[var(--color-text-secondary)]">Identifiant de projet invalide.</p>
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
