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
import type { LigneArchive, ModeArchives, TypeArchive } from "@/types/api"

const CHAMP_TITRE: Record<TypeArchive, string> = {
  partenaires: "nom",
  partenariats: "intitule",
  projets: "nom",
  conventions: "titre",
  cotutelles: "nom_doctorant",
  documents: "nom_fichier",
}

const LABEL_TYPE: Record<TypeArchive, string> = {
  partenaires: "Partenaire",
  partenariats: "Partenariat",
  projets: "Projet",
  conventions: "Convention",
  cotutelles: "Cotutelle",
  documents: "Document",
}

function titreArchive(item: Record<string, unknown>, type: TypeArchive): string {
  return String(item[CHAMP_TITRE[type]] ?? "Sans titre")
}

function dateArchive(item: Record<string, unknown>): string {
  const brut = item.updated_at ?? item.created_at
  if (!brut) return "—"
  return new Date(String(brut)).toLocaleDateString("fr-FR")
}

export function ArchivesPage() {
  const { utilisateur } = useAuth()
  const [mode, setMode] = useState<ModeArchives>("tous")
  const [recherche, setRecherche] = useState("")
  const rechercheDebouncee = useDebounce(recherche, 300)

  const cheminBase =
    utilisateur?.role === "PRESIDENCE"
      ? "/presidence"
      : utilisateur?.role === "ETABLISSEMENT"
        ? "/etablissement"
        : "/decideur"

  const { data, isLoading } = useArchives(mode, {
    recherche: rechercheDebouncee || undefined,
  })

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
          enfants={<ArchivesFiltres mode={mode} onChangementMode={setMode} />}
        />

        <PanelBody>
          {isLoading ? (
            <p className="text-[13px] text-[var(--color-text-secondary)]">Chargement…</p>
          ) : !data || data.data.length === 0 ? (
            <EmptyState
              icone={Archive}
              titre="Aucun élément archivé"
              description={
                mode === "tous"
                  ? "Aucun élément n'a été archivé pour l'instant."
                  : "Rien n'a été archivé dans cette catégorie pour l'instant."
              }
            />
          ) : mode === "tous" ? (
            <div className="flex flex-col gap-2">
              {(data.data as LigneArchive[]).map((item) => {
                const id = item.id as string
                const type = item._type
                const titre = titreArchive(item, type)
                return (
                  <Link
                    key={`${type}-${id}`}
                    to={`${cheminBase}/archives/${type}/${id}`}
                    className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 text-[13px] transition-colors hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
                  >
                    <span className="rounded-full bg-[var(--color-page-bg)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
                      {LABEL_TYPE[type]}
                    </span>
                    <span className="font-semibold">{titre}</span>
                    <span className="ml-auto text-[11.5px] text-[var(--color-text-secondary)]">
                      Archivé le {dateArchive(item)}
                    </span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {data.data.map((item) => {
                const id = item.id as string
                const titre = titreArchive(item, mode as TypeArchive)
                return (
                  <Link
                    key={id}
                    to={`${cheminBase}/archives/${mode}/${id}`}
                    className="flex items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] p-3 text-[13px] transition-colors hover:bg-[var(--color-page-bg)] hover:text-[var(--color-brand)]"
                  >
                    <span className="font-semibold">{titre}</span>
                    <span className="ml-auto text-[11.5px] text-[var(--color-text-secondary)]">
                      Archivé le {dateArchive(item)}
                    </span>
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