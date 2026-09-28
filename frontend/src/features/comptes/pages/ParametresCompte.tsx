// src/features/comptes/pages/ParametresCompte.tsx
import { Settings, Lock } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"

export function ParametresCompte() {
  const { utilisateur } = useAuth()

  const roles = { PRESIDENCE: "Presidence", ETABLISSEMENT: "Etablissement", DECIDEUR: "Decideur" }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Parametres du compte</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerez vos informations personnelles et la securite de votre compte.</p>
      </div>

      <div className="rounded-xl border border-border p-5">
        <div className="mb-3 flex items-center gap-2">
          <Settings size={16} className="text-muted-foreground" />
          <h2 className="font-heading text-sm font-semibold">Informations du compte</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Email</span>
            <p className="font-medium">{utilisateur?.email ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Role</span>
            <p className="font-medium">{roles[utilisateur?.role ?? "PRESIDENCE"] ?? "—"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Etablissement</span>
            <p className="font-medium">{utilisateur?.etablissement_nom ?? "Non defini"}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Identifiant</span>
            <p className="font-data text-muted-foreground">{utilisateur?.id ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lock size={16} className="text-muted-foreground" />
          <h2 className="font-heading text-sm font-semibold">Securite</h2>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
          <Badge variant="outline" className="text-[10px]">Bientot</Badge>
          <p className="text-sm text-muted-foreground">Le changement de mot de passe sera disponible prochainement.</p>
        </div>
      </div>
    </div>
  )
}