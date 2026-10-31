// src/components/shared/ForbiddenPage.tsx
import { ShieldAlert } from "lucide-react"

export function ForbiddenPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <ShieldAlert size={48} className="text-muted-foreground" />
      <h1 className="font-heading text-xl font-semibold">Acces refuse</h1>
      <p className="text-muted-foreground">
        Vous n'avez pas les droits necessaires pour consulter cette page.
      </p>
    </div>
  )
}