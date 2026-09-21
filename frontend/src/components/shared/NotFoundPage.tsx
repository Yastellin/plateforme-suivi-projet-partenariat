// src/components/shared/NotFoundPage.tsx
import { Link } from "react-router-dom"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <FileQuestion size={36} className="text-muted-foreground" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Page introuvable</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        La page que vous cherchez n'existe pas ou a ete deplacee.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/">Retour a l'accueil</Link>
      </Button>
    </div>
  )
}