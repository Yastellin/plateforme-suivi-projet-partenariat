// src/features/espace-public/components/SectionPublicationsAlaUne.tsx
// "Projets et partenariats" de l'accueil (maquette) : publications publiees par la
// Presidence, filtrables par etablissement porteur. Aucune publication n'est ajoutee
// ni modifiee cote interface.
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPublications } from "@/features/espace-public/api/usePublicPublications"
import { CartePublication } from "@/features/espace-public/components/CartesPubliques"
import type { PublicationPublique } from "@/types/api"

const TOUS = "tous"

export function SectionPublicationsAlaUne() {
  const { data, isLoading } = usePublicPublications({ limit: 12 })
  const publications: PublicationPublique[] = useMemo(() => data?.data ?? [], [data])
  const [filtre, setFiltre] = useState(TOUS)

  // Filtres construits a partir des etablissements effectivement presents dans les donnees.
  const etablissements = useMemo(() => {
    const vus = new Map<string, string>()
    for (const p of publications) {
      const etab = p.projet.etablissement
      if (etab && !vus.has(etab.id)) vus.set(etab.id, etab.sigle ?? etab.nom)
    }
    return [...vus.entries()]
  }, [publications])

  const affichees = publications.filter((p) => filtre === TOUS || p.projet.etablissement?.id === filtre)

  if (!isLoading && publications.length === 0) return null

  return (
    <section className="vt-section" id="projets">
      <div className="vt-wrap">
        <div className="vt-head">
          <div>
            <h2>Projets et partenariats</h2>
            <p>Les réalisations publiées par la Présidence de l'université et ses établissements.</p>
          </div>
          <Link to="/projets-partenariats" className="vt-btn vt-btn-ghost">
            Tous les projets
          </Link>
        </div>

        {etablissements.length > 1 && (
          <div className="vt-filters" role="group" aria-label="Filtrer par établissement">
            <button type="button" className="vt-chip" aria-pressed={filtre === TOUS} onClick={() => setFiltre(TOUS)}>
              Tous
            </button>
            {etablissements.map(([id, libelle]) => (
              <button
                key={id}
                type="button"
                className="vt-chip"
                aria-pressed={filtre === id}
                onClick={() => setFiltre(id)}
              >
                {libelle}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="vt-grid-p">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            <div className="vt-grid-p">
              {affichees.map((publication) => (
                <CartePublication key={publication.id} publication={publication} />
              ))}
            </div>
            {affichees.length === 0 && (
              <div className="vt-empty vt-show">
                <h3>Aucune publication pour cet établissement</h3>
                <p>Choisissez un autre filtre ou revenez plus tard.</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
