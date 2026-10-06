// src/features/documents/pages/DocumentUploadPage.tsx

import { useNavigate } from "react-router-dom"

import { DocumentDropzone } from "@/features/documents/components/DocumentDropzone"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"

export function DocumentUploadPage() {
  const navigate = useNavigate()

  return (
    <div>
      <PageHeader
        titre="Téléverser un document"
        description="Ajoutez un document PDF ou Word associé à un projet ou une convention."
        actions={
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-[var(--radius-sm)] border border-[var(--color-chrome-border)] px-3.5 py-2 text-[13px] font-semibold text-[var(--color-text-primary)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
          >
            Retour
          </button>
        }
      />

      <Panel className="max-w-xl">
        <PanelBody>
          <DocumentDropzone />
        </PanelBody>
      </Panel>
    </div>
  )
}
