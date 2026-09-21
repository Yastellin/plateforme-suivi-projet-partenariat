// src/components/shared/ForbiddenPage.tsx
import { Link } from "react-router-dom"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert size={36} className="text-destructive" />
      </div>
      <h1 className="font-heading text-2xl font-bold text-foreground">Acces refuse</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Vous n'avez pas les droits necessaires pour consulter cette page.
        Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur.
      </p>
      <Button asChild variant="outline" className="mt-2">
        <Link to="/">Retour a l'accueil</Link>
      </Button>
    </div>
  )
}