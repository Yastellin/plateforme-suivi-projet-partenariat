// src/features/comptes/pages/ParametresCompte.tsx

import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelHeader, PanelBody } from "@/components/shared/Panel"

export function ParametresCompte() {
  const { utilisateur } = useAuth()

  const roles: Record<string, string> = {
    PRESIDENCE: "Présidence",
    ETABLISSEMENT: "Établissement",
    DECIDEUR: "Décideur",
  }

  return (
    <div>
      <PageHeader
        titre="Paramètres du compte"
        description="Gérez vos informations personnelles et la sécurité de votre compte."
      />

      <div className="flex flex-col gap-4">
        <Panel>
          <PanelHeader titre="Informations du compte" />
          <PanelBody>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">E-mail</dt>
                <dd className="mt-1 text-[13.5px]">{utilisateur?.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Rôle</dt>
                <dd className="mt-1 text-[13.5px]">{roles[utilisateur?.role ?? ""] ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Établissement</dt>
                <dd className="mt-1 text-[13.5px]">{utilisateur?.etablissement_nom ?? "Non défini"}</dd>
              </div>
              <div>
                <dt className="text-[11.5px] font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">Identifiant</dt>
                <dd className="mt-1 font-mono text-[12.5px] text-[var(--color-text-secondary)]">{utilisateur?.id ?? "—"}</dd>
              </div>
            </dl>
          </PanelBody>
        </Panel>

        <Panel>
          <PanelHeader titre="Sécurité" />
          <PanelBody>
            <div className="flex items-center gap-3 rounded-[var(--radius-sm)] bg-[var(--color-page-bg)] p-4">
              <Badge variant="outline" className="text-[10px]">Bientôt</Badge>
              <p className="text-[13px] text-[var(--color-text-secondary)]">
                Le changement de mot de passe sera disponible prochainement.
              </p>
            </div>
          </PanelBody>
        </Panel>
      </div>
    </div>
  )
}
