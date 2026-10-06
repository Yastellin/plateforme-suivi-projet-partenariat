// src/features/archives/pages/ArchivesPage.tsx

import { useState } from "react"
import { Archive } from "lucide-react"
import { Link } from "react-router-dom"

import { EmptyState } from "@/components/shared/EmptyState"
import { PageHeader } from "@/components/shared/PageHeader"
import { Panel, PanelBody } from "@/components/shared/Panel"
import { TableToolbar } from "@/components/shared/TableToolbar"
import { ArchivesFiltres } from "@/features/archives/components/ArchivesFiltres"
import { useArchives } from "@/features/archives/api/useArchives"
import { useDebounce } from "@/hooks/useDebounce"
import { useAuth } from "@/hooks/useAuth"
import type { TypeArchive } from "@/types/api"

const CHAMP_TITRE: Record<TypeArchive, string> = {
  partenaires: "nom",
  partenariats: "intitule",
  projets: "nom",
  conventions: "titre",
  cotutelles: "nom_doctorant",
}

export function ArchivesPage() {
  const { utilisateur } = useAuth()
  const [type, setType] = useState<TypeArchive>("partenaires")
  const [recherche, setRecherche] = useState("")
  const rechercheDebouncee = useDebounce(recherche, 300)

  const role = utilisateur?.role
  const cheminBase = role === 'PRESIDENCE' ? '/presidence' : role === 'ETABLISSEMENT' ? '/etablissement' : '/decideur'

  const { data, isLoading } = useArchives<Record<string, unknown>>(type, { recherche: rechercheDebouncee || undefined })

  return (
    <div>
      <PageHeader
        titre="Archives"
        description="Consultez les éléments archivés de la plateforme."
      />

      <Panel>
        <TableToolbar
          valeurRecherche={recherche}
          onRechercheChange={setRecherche}
          placeholderRecherche="Rechercher dans les archives…"
          enfants={
            <ArchivesFiltres
              type={type}
              onChangementType={setType}
            />
          }
        />

        <PanelBody>
          {isLoading ? (
            <p className="text-[13px] text-[var(--color-text-secondary)]">Chargement…</p>
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icone={Archive}
              titre="Aucun élément archivé"
              description="Rien n'a été archivé dans cette catégorie pour l'instant."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {data.data.map((item) => {
                const id = item.id as string
                const titre = String(item[CHAMP_TITRE[type]] ?? "Sans titre")
                return (
                  <Link
                    key={id}
                    to={`${cheminBase}/${type}/${id}`}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 text-[13px] font-semibold transition-colors hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
                  >
                    {titre}
                  </Link>
                )
              })}
            </div>
          )}
        </PanelBody>
      </Panel>
    </div>
  )
}
