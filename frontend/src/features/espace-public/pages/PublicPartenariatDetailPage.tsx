// src/features/espace-public/pages/PublicPartenariatDetailPage.tsx
import { Link, useParams } from "react-router-dom"
import { ArrowLeft, CalendarDays, Handshake, Landmark } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { formaterPeriode } from "@/features/espace-public/lib/publique"
import { formaterDate } from "@/lib/format"
import { usePublicPartenariatsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { FilAriane } from "@/features/espace-public/components/FilAriane"

export function PublicPartenariatDetailPage() {
  const { id } = useParams()
  const requete = usePublicPartenariatsPublies()

  if (requete.isLoading) {
    return (
      <div className="vt-wrap vt-section" aria-busy="true">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-64 w-full" />
      </div>
    )
  }

  if (requete.isError) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyState
          icone={Handshake}
          titre="Le partenariat n'a pas pu être chargé"
          description="Vérifiez votre connexion puis réessayez."
          action={<button type="button" className="vt-btn vt-btn-ghost" onClick={() => requete.refetch()}>Réessayer</button>}
        />
      </div>
    )
  }

  const partenariat = requete.data?.find((item) => item.id === id)
  if (!partenariat) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyState
          icone={Handshake}
          titre="Partenariat introuvable"
          description="Ce partenariat n'est pas publié ou n'existe pas."
          action={
            <Link to="/partenariats" className="vt-btn vt-btn-ghost">
              <ArrowLeft size={14} aria-hidden="true" /> Retour aux partenariats
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div>
      <div className="vt-wrap vt-pad-top">
        <FilAriane etapes={[
          { libelle: "Accueil", to: "/" },
          { libelle: "Partenariats", to: "/partenariats" },
          { libelle: partenariat.intitule },
        ]} />
      </div>
      <section className="vt-wrap vt-detail-head">
        <div>
          <span className="vt-badge vt-badge-info">{partenariat.domaine}</span>
          <h1>{partenariat.intitule}</h1>
          {partenariat.objet && <p className="vt-lead">{partenariat.objet}</p>}
        </div>
      </section>
      <section className="vt-wrap vt-detail-grid">
        <div className="vt-detail-main">
          {partenariat.objet && (
            <div className="vt-panel">
              <h2>Objet de la coopération</h2>
              <p>{partenariat.objet}</p>
            </div>
          )}
          <div className="vt-panel">
            <h2><Landmark size={18} aria-hidden="true" /> Établissements associés</h2>
            {partenariat.etablissements.length > 0 ? (
              <ul className="vt-list">
                {partenariat.etablissements.map((etablissement) => (
                  <li key={etablissement.id}>
                    <span>{etablissement.sigle ? `${etablissement.sigle} — ` : ""}{etablissement.nom}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="vt-muted">Aucun établissement public n'est associé à cette fiche.</p>}
          </div>
          <div className="vt-panel">
            <h2><Handshake size={18} aria-hidden="true" /> Partenaires associés</h2>
            {partenariat.partenaires.length > 0 ? (
              <ul className="vt-list">
                {partenariat.partenaires.map((partenaire) => (
                  <li key={partenaire.id}>
                    <Link to={`/partenaires/${partenaire.id}`}>{partenaire.nom}</Link>
                  </li>
                ))}
              </ul>
            ) : <p className="vt-muted">Aucun partenaire public n'est associé à cette fiche.</p>}
          </div>
        </div>
        <aside className="vt-detail-side">
          <div className="vt-panel">
            <h2><CalendarDays size={18} aria-hidden="true" /> Période</h2>
            <p>{partenariat.date_fin ? formaterPeriode(partenariat.date_debut, partenariat.date_fin) : `Depuis ${formaterDate(partenariat.date_debut)}`}</p>
          </div>
        </aside>
      </section>
    </div>
  )
}
