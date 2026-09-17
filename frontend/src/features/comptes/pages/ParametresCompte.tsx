// src/features/comptes/pages/ParametresCompte.tsx
import { FormulaireMotDePasse } from "@/features/comptes/components/FormulaireMotDePasse"
import { useCompte } from "@/features/comptes/api/useCompte"

export function ParametresCompte() {
  const { data: compte, isLoading } = useCompte()

  return (
    <div className="p-6">
      <h1 className="mb-6 font-heading text-2xl font-semibold text-foreground">Parametres du compte</h1>

      <div className="mb-8 max-w-md rounded-md border border-border p-4">
        <h2 className="mb-2 font-heading text-sm font-semibold">Informations</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">Email : {compte?.email}</p>
            <p className="text-sm text-muted-foreground">Role : {compte?.role}</p>
          </>
        )}
      </div>

      <div>
        <h2 className="mb-3 font-heading text-sm font-semibold">Changer le mot de passe</h2>
        <FormulaireMotDePasse />
      </div>
    </div>
  )
}