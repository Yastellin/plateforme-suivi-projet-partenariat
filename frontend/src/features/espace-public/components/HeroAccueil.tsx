// src/features/espace-public/components/HeroAccueil.tsx
// Hero de la vitrine (maquette) : carrousel "A la une" et chiffres cles.
// Les diapositives sont construites a partir de l'API (publication de la
// Presidence, projet et partenaire a la une). Les illustrations sont
// decoratives : aucun texte ni donnee fictive n'est code en dur.
import { useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft, ChevronRight, FolderKanban, Handshake, Newspaper, Pause, Play } from "lucide-react"
import { usePublicAccueil } from "@/features/espace-public/api/usePublicAccueil"
import { resumePartenaire, resumeProjet, resumePublication } from "@/features/espace-public/lib/publique"
import { Illustration, type TypeIllustration } from "@/features/espace-public/components/Illustrations"
import type { AccueilPublic } from "@/types/api"

interface Diapositive {
  cle: string
  etiquette: string
  icone: typeof Newspaper
  titre: string
  texte: string
  photo: string | null
  illustration: TypeIllustration
  cta: { to: string; libelle: string }
}

const DUREE_DIAPOSITIVE_MS = 6500

function construireDiapositives(donnees: AccueilPublic | undefined): Diapositive[] {
  if (!donnees) return []
  const diapos: Diapositive[] = []

  const publication = donnees.dernieres_publications?.[0]
  if (publication) {
    diapos.push({
      cle: `publication-${publication.id}`,
      etiquette: "Actualité de la Présidence",
      icone: Newspaper,
      titre: publication.titre,
      texte: resumePublication(publication),
      photo: publication.photo_url,
      illustration: "montagne",
      cta: { to: `/projets-partenariats/publication/${publication.id}`, libelle: "Lire l'actualité" },
    })
  }

  const projet = donnees.projets_a_la_une?.[0]
  if (projet) {
    diapos.push({
      cle: `projet-${projet.id}`,
      etiquette: "Projet à la une",
      icone: FolderKanban,
      titre: projet.nom,
      texte: resumeProjet(projet),
      photo: null,
      illustration: "reseau",
      cta: projet.publication_id
        ? { to: `/projets-partenariats/publication/${projet.publication_id}`, libelle: "Lire le projet" }
        : { to: "/projets-partenariats?onglet=projets", libelle: "Voir les projets" },
    })
  }

  const partenaire = donnees.partenaires_a_la_une?.[0]
  if (partenaire) {
    diapos.push({
      cle: `partenaire-${partenaire.id}`,
      etiquette: "Partenaire à la une",
      icone: Handshake,
      titre: partenaire.nom,
      texte: resumePartenaire(partenaire),
      photo: null,
      illustration: "cotutelle",
      cta: { to: "/projets-partenariats?onglet=partenaires", libelle: "Voir les partenaires" },
    })
  }

  return diapos
}

function preferenceReduction(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

// Compteur qui s'anime une seule fois, a l'entree dans l'ecran.
function CompteurAnime({ valeur }: { valeur: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [affiche, setAffiche] = useState(valeur)

  useEffect(() => {
    const element = ref.current
    if (!element || preferenceReduction() || !("IntersectionObserver" in window)) return
    let frame = 0
    const observateur = new IntersectionObserver(
      (entrees) => {
        if (!entrees.some((e) => e.isIntersecting)) return
        observateur.disconnect()
        setAffiche(0)
        const debut = performance.now()
        const pas = (t: number) => {
          const p = Math.min((t - debut) / 1100, 1)
          setAffiche(Math.round(valeur * (1 - Math.pow(1 - p, 3))))
          if (p < 1) frame = requestAnimationFrame(pas)
        }
        frame = requestAnimationFrame(pas)
      },
      { threshold: 0.6 },
    )
    observateur.observe(element)
    return () => {
      observateur.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [valeur])

  return <span ref={ref}>{affiche.toLocaleString("fr-FR")}</span>
}

export function HeroAccueil() {
  const { data, isLoading } = usePublicAccueil()
  const compteurs = data?.compteurs
  const diapositives = useMemo(() => construireDiapositives(data), [data])

  const [index, setIndex] = useState(0)
  const [pauseManuelle, setPauseManuelle] = useState(false)
  const [survol, setSurvol] = useState(false)
  const reduction = preferenceReduction()
  const enPause = pauseManuelle || survol || reduction

  // Defilement automatique, suspendu au survol, au focus, par bouton ou sur demande.
  useEffect(() => {
    if (enPause || diapositives.length < 2) return
    const minuteur = window.setInterval(() => {
      setIndex((i) => (i + 1) % diapositives.length)
    }, DUREE_DIAPOSITIVE_MS)
    return () => window.clearInterval(minuteur)
  }, [enPause, diapositives.length])

  const total = diapositives.length
  const position = total > 0 ? index % total : 0

  const chiffres = [
    { valeur: compteurs?.nombre_partenaires, libelle: "partenaires actifs" },
    { valeur: compteurs?.nombre_projets_actifs, libelle: "projets actifs" },
    { valeur: compteurs?.nombre_etablissements, libelle: "établissements" },
    { valeur: compteurs?.nombre_pays_partenaires, libelle: "pays partenaires" },
  ]

  return (
    <>
      <section className="vt-hero" aria-label="À la une">
        <div className="vt-wrap">
          <div
            className="vt-car"
            role="region"
            aria-roledescription="carrousel"
            aria-label="Les dernières nouvelles de l'université"
            onMouseEnter={() => setSurvol(true)}
            onMouseLeave={() => setSurvol(false)}
            onFocus={() => setSurvol(true)}
            onBlur={() => setSurvol(false)}
          >
            {isLoading && (
              <div className="vt-slide" data-on="true" aria-busy="true">
                <div>
                  <span className="vt-tag">Chargement</span>
                </div>
                <div className="vt-art" aria-hidden="true" />
              </div>
            )}

            {!isLoading && total === 0 && (
              <div className="vt-slide" data-on="true">
                <div>
                  <span className="vt-tag">Université de Fianarantsoa</span>
                  <h1>Les partenariats de l'université, suivis au grand jour</h1>
                  <p className="vt-lead">
                    Projets, partenariats et actualités de l'Université, réunis sur une seule plateforme.
                  </p>
                  <div className="vt-cta">
                    <Link to="/projets-partenariats" className="vt-btn vt-btn-primary">Projets et partenariats</Link>
                  </div>
                </div>
                <div className="vt-art">
                  <Illustration type="montagne" />
                </div>
              </div>
            )}

            {diapositives.map((d, i) => {
              const Icone = d.icone
              return (
                <div
                  key={d.cle}
                  className="vt-slide"
                  data-on={i === position}
                  role="group"
                  aria-roledescription="diapositive"
                  aria-label={`${i + 1} sur ${total}`}
                  aria-hidden={i !== position}
                >
                  <div>
                    <span className="vt-tag">
                      <Icone aria-hidden="true" />
                      {d.etiquette}
                    </span>
                    <h1>{d.titre}</h1>
                    <p className="vt-lead">{d.texte}</p>
                    <div className="vt-cta">
                      <Link to={d.cta.to} className="vt-btn vt-btn-primary" tabIndex={i === position ? 0 : -1}>
                        {d.cta.libelle}
                      </Link>
                    </div>
                  </div>
                  <div className="vt-art">
                    {d.photo ? (
                      <img src={d.photo} alt="" className="vt-art-img" loading={i === 0 ? "eager" : "lazy"} decoding="async" />
                    ) : (
                      <Illustration type={d.illustration} />
                    )}
                  </div>
                </div>
              )
            })}

            {total > 1 && (
              <div className="vt-car-ctl">
                <button
                  type="button"
                  className="vt-icon-btn"
                  aria-label="Diapositive précédente"
                  onClick={() => setIndex((position - 1 + total) % total)}
                >
                  <ChevronLeft size={18} aria-hidden="true" />
                </button>
                <div className="vt-dots" role="tablist" aria-label="Choisir une diapositive">
                  {diapositives.map((d, i) => (
                    <button
                      key={d.cle}
                      type="button"
                      className="vt-dot"
                      role="tab"
                      aria-label={`Diapositive ${i + 1}`}
                      aria-selected={i === position}
                      onClick={() => setIndex(i)}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  className="vt-icon-btn"
                  aria-label="Diapositive suivante"
                  onClick={() => setIndex((position + 1) % total)}
                >
                  <ChevronRight size={18} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="vt-icon-btn"
                  aria-label={pauseManuelle ? "Reprendre le défilement" : "Mettre le défilement en pause"}
                  aria-pressed={pauseManuelle}
                  onClick={() => setPauseManuelle((p) => !p)}
                >
                  {pauseManuelle ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="vt-woven" aria-hidden="true" />
        <div className="vt-wrap vt-hero-ctas">
          <Link to="/partenariats" className="vt-btn vt-btn-primary">Découvrir nos partenaires</Link>
          <Link to="/contact" className="vt-btn vt-btn-ghost">Nous contacter</Link>
        </div>
      </section>

      <section className="vt-stats" aria-label="Chiffres clés">
        <div className="vt-wrap">
          <ul className="vt-stats-grid">
            {chiffres.map((c) => (
              <li key={c.libelle} className="vt-stat">
                <div className="vt-stat-value">
                  {c.valeur === undefined ? "—" : <CompteurAnime valeur={c.valeur} />}
                </div>
                <div className="vt-stat-label">{c.libelle}</div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}
