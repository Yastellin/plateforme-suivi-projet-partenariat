// src/features/publications/pages/PublicationEditPage.tsx
import { useParams } from "react-router-dom"
import { PublicationEditeur } from "@/features/publications/components/PublicationEditeur"

export function PublicationEditPage() {
  const { projetId } = useParams<{ projetId: string }>()

  if (!projetId) {
    return <p className="p-6 text-muted-foreground">Projet non specifie.</p>
  }

  return (
    <div className="p-6">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-foreground">Publication</h1>
      <PublicationEditeur projetId={projetId} />
    </div>
  )
}