// src/components/shared/NotFoundPage.tsx
import { FileQuestion } from "lucide-react"

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <FileQuestion size={48} className="text-muted-foreground" />
      <h1 className="font-heading text-xl font-semibold">Page introuvable</h1>
      <p className="text-muted-foreground">
        La page que vous cherchez n'existe pas ou a ete deplacee.
      </p>
    </div>
  )
}