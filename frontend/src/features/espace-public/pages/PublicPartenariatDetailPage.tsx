import { Link, useParams } from "react-router-dom"
import { FileText, Handshake, Landmark } from "lucide-react"
import { EmptyState } from "@/components/shared/EmptyState"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicPartenariatsPublies } from "@/features/espace-public/api/usePublicDonneesDetail"
import { BadgeCategorie } from "@/features/espace-public/components/BadgeCategorie"
import { CarteLaterale } from "@/features/espace-public/components/CarteLaterale"
import { DetailLayout } from "@/features/espace-public/components/DetailLayout"
import { FilAriane } from "@/features/espace-public/components/FilAriane"
import { PartageSocial } from "@/features/espace-public/components/PartageSocial"
import { EmptyStateSection } from "@/features/espace-public/components/EmptyStateSection"

export function PublicPartenariatDetailPage() {
  const { id } = useParams()
  const requete = usePublicPartenariatsPublies()

  if (requete.isLoading) {
    return <div className="vt-wrap vt-section" aria-busy="true"><Skeleton className="h-10 w-2/3" /><Skeleton className="mt-6 h-64 w-full" /></div>
  }

  if (requete.isError) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyState icone={Handshake} titre="Le partenariat n'a pas pu être chargé" description="Vérifiez votre connexion puis réessayez." action={<button type="button" className="vt-btn vt-btn-ghost" onClick={() => requete.refetch()}>Réessayer</button>} />
      </div>
    )
  }

  const partenariat = requete.data?.find((item) => item.id === id)
  if (!partenariat) {
    return (
      <div className="vt-wrap vt-section">
        <EmptyStateSection
          icone={<FileText aria-hidden="true" />}
          titre="Partenariat introuvable"
          description="Cet élément n'existe pas ou a été retiré."
        />
      </div>
    )
  }

  return (
    <div className="vt-detail-page">
      <div className="vt-wrap vt-detail-breadcrumb">
        <FilAriane etapes={[{ libelle: "Accueil", to: "/" }, { libelle: "Partenariats", to: "/partenariats" }, { libelle: partenariat.intitule }]} />
      </div>
      <header className="vt-wrap vt-detail-hero vt-detail-hero-compact">
        <div className="vt-detail-hero-content">
          <span className="vt-surtitre">Partenariat</span>
          <div className="vt-detail-meta"><BadgeCategorie>{partenariat.domaine}</BadgeCategorie></div>
          <h1>{partenariat.intitule}</h1>
          {partenariat.objet && <p className="vt-detail-intro">{partenariat.objet}</p>}
        </div>
      </header>

      <DetailLayout
        className="vt-detail-partenariat-layout"
        labelSidebar="Informations sur le partenariat"
        sidebar={(
          <>
            <CarteLaterale titre="Partenaires associés" icone={Handshake}>
              {partenariat.partenaires.length > 0 ? (
                <ul className="vt-detail-link-list">
                  {partenariat.partenaires.map((partenaire) => (
                    <li key={partenaire.id}><Link to={`/partenaires/${partenaire.id}`}>{partenaire.nom}</Link></li>
                  ))}
                </ul>
              ) : <p className="vt-muted">Aucun partenaire public n'est associé à cette fiche.</p>}
            </CarteLaterale>
            <PartageSocial />
          </>
        )}
      >
        {partenariat.objet && (
          <section className="vt-detail-section">
            <h2>Objet de la coopération</h2>
            <p className="vt-detail-prose">{partenariat.objet}</p>
          </section>
        )}
        <section className="vt-detail-section">
          <h2><Landmark size={20} aria-hidden="true" /> Établissements associés</h2>
          {partenariat.etablissements.length > 0 ? (
            <ul className="vt-detail-entity-grid">
              {partenariat.etablissements.map((etablissement) => (
                <li key={etablissement.id}>
                  {etablissement.logo_url && <img src={etablissement.logo_url} alt="" loading="lazy" decoding="async" />}
                  <span>{etablissement.sigle ? `${etablissement.sigle} — ` : ""}{etablissement.nom}</span>
                </li>
              ))}
            </ul>
          ) : <p className="vt-muted">Aucun établissement public n'est associé à cette fiche.</p>}
        </section>
      </DetailLayout>
    </div>
  )
}
