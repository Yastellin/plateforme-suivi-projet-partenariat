// src/features/documents/pages/DocumentUploadPage.tsx
import { useNavigate } from "react-router-dom"

import { DocumentDropzone } from "@/features/documents/components/DocumentDropzone"
import { Button } from "@/components/ui/button"

export function DocumentUploadPage() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-foreground">Televerser un document</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ajoutez un document PDF ou Word associe a un projet ou une convention.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          Retour
        </Button>
      </div>

      <div className="max-w-xl">
        <DocumentDropzone />
      </div>
    </div>
  )
}
