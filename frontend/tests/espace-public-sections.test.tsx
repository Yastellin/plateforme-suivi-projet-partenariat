// @vitest-environment jsdom
import { createElement } from "react"
import type { ComponentType } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

const donnees = vi.hoisted(() => ({
  accueil: { data: undefined as any, isLoading: false, isError: false },
  partenaires: { data: undefined as any, isLoading: false, isError: false },
  partenariats: { data: [] as any[], isLoading: false, isError: false, refetch: vi.fn() },
  projets: { data: { data: [] as any[], meta: { page: 1, limit: 100, total: 0, totalPages: 1 } }, isLoading: false, isError: false, refetch: vi.fn() },
  publications: { data: { data: [] as any[], meta: { page: 1, limit: 9, total: 0, totalPages: 1 } }, isLoading: false, isError: false, refetch: vi.fn() },
}))

vi.mock("@/hooks/useDebounce", () => ({ useDebounce: (valeur: unknown) => valeur }))
vi.mock("@/lib/ecran", () => ({ useMediaQuery: () => false }))
vi.mock("@/features/espace-public/api/usePublicAccueil", () => ({
  usePublicAccueil: () => donnees.accueil,
}))
vi.mock("@/features/espace-public/api/usePublicPartenaires", () => ({
  usePublicPartenaires: () => donnees.partenaires,
}))
vi.mock("@/features/espace-public/api/usePublicProjets", () => ({
  usePublicProjets: () => donnees.projets,
}))
vi.mock("@/features/espace-public/api/usePublicPublications", () => ({
  usePublicPublications: () => donnees.publications,
}))
vi.mock("@/features/espace-public/api/usePublicEtablissements", () => ({
  usePublicEtablissements: () => ({ data: { data: [] }, isLoading: false }),
}))
vi.mock("@/features/espace-public/api/usePublicDonneesDetail", () => ({
  usePublicPartenariatsPublies: () => donnees.partenariats,
  usePublicTousPartenaires: () => ({ data: donnees.partenaires.data?.data ?? [], isLoading: false }),
}))

import { AccueilPage } from "@/features/espace-public/pages/AccueilPage"
import { ActualitesPage } from "@/features/espace-public/pages/ActualitesPage"
import { PublicPartenairesListePage } from "@/features/espace-public/pages/PublicPartenairesListePage"
import { PublicPartenariatsListePage } from "@/features/espace-public/pages/PublicPartenariatsListePage"
import { PublicProjetsListePage } from "@/features/espace-public/pages/PublicProjetsListePage"
import { ProjetsPartenariatsPubliquePage } from "@/features/espace-public/pages/ProjetsPartenariatsPubliquePage"

const PAGES_LISTES_PUBLIQUES: [string, ComponentType][] = [
  ["Actualités", ActualitesPage],
  ["Projets", PublicProjetsListePage],
  ["Partenariats", PublicPartenariatsListePage],
  ["Partenaires", PublicPartenairesListePage],
]

function creerPublication(index: number) {
  return {
    id: `publication-${index}`,
    titre: `Actualité ${index}`,
    description_publique: `Résumé ${index}`,
    date_publication: "2026-10-20",
    resultats: null,
    projet_id: `projet-${index}`,
    projet: {
      id: `projet-${index}`,
      nom: `Projet source ${index}`,
      intitule_officiel: null,
      etablissement: { id: "etab-1", nom: "Faculté", sigle: "FLSH", logo_url: null },
    },
    image_couverture_url: index === 1 ? "/images/couverture-demo.jpg" : null,
    photo_url: `/images/galerie-${index}.jpg`,
    photos: index === 3 ? [] : [{
      id: `photo-${index}`,
      url_fichier: `/images/galerie-${index}.jpg`,
      legende: `Légende ${index}`,
      ordre: 0,
    }],
  }
}

function creerProjet(index: number) {
  return {
    id: `projet-${index}`,
    nom: `Projet ${index}`,
    intitule_officiel: null,
    type: "RECHERCHE",
    domaine: "Recherche",
    statut: "EN_COURS",
    date_debut: "2026-01-01",
    date_fin_prevue: "2027-01-01",
    description: `Description du projet ${index}`,
    publication_id: `publication-projet-${index}`,
    etablissement: { id: "etab-1", nom: "Faculté", sigle: "FLSH", logo_url: null },
    partenaires: [],
  }
}

function creerPartenaire(index: number) {
  return {
    id: `partenaire-${index}`,
    nom: `Partenaire ${index}`,
    type: "Université",
    pays: "Madagascar",
    description: null,
    logo_url: `/logos/partenaire-${index}.png`,
    site_web: null,
    est_strategique: false,
  }
}

function creerPartenariat(index: number) {
  return {
    id: `partenariat-${index}`,
    intitule: `Coopération ${index}`,
    objet: `Objet ${index}`,
    domaine: "FORMATION",
    date_debut: "2026-01-01",
    date_fin: "2027-01-01",
    etablissements: [{ id: "etab-1", nom: "Faculté", sigle: "FLSH", logo_url: null }],
    partenaires: [{ id: `partenaire-${index}`, nom: `Partenaire ${index}`, logo_url: null }],
  }
}

function rendreAccueil() {
  return renderToStaticMarkup(createElement(MemoryRouter, null, createElement(AccueilPage)))
}

function definirNombreElementsAccueil(nombre: number) {
  donnees.accueil.data = {
    ...donnees.accueil.data,
    dernieres_publications: Array.from({ length: nombre }, (_, index) => creerPublication(index + 1)),
    projets_a_la_une: Array.from({ length: nombre }, (_, index) => creerProjet(index + 1)),
  }
  donnees.partenariats.data = Array.from({ length: nombre }, (_, index) => creerPartenariat(index + 1))
}

beforeEach(() => {
  donnees.accueil = {
    data: {
      dernieres_publications: Array.from({ length: 4 }, (_, index) => creerPublication(index + 1)),
      projets_a_la_une: Array.from({ length: 4 }, (_, index) => creerProjet(index + 1)),
      partenaires_a_la_une: [],
      compteurs: {
        nombre_etablissements: 3,
        nombre_partenaires: 4,
        nombre_pays_partenaires: 2,
        nombre_projets_actifs: 4,
        nombre_publications: 4,
      },
    },
    isLoading: false,
    isError: false,
  }
  donnees.partenaires = {
    data: { data: Array.from({ length: 4 }, (_, index) => creerPartenaire(index + 1)), meta: { page: 1, limit: 100, total: 4, totalPages: 1 } },
    isLoading: false,
    isError: false,
  }
  donnees.partenariats = {
    data: Array.from({ length: 4 }, (_, index) => creerPartenariat(index + 1)),
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }
  donnees.projets = {
    data: { data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 1 } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }
  donnees.publications = {
    data: {
      data: [1, 2, 3].map((index) => ({
        ...creerPublication(index),
        date_publication: `2026-10-${String(index + 17).padStart(2, "0")}`,
      })),
      meta: { page: 1, limit: 100, total: 3, totalPages: 1 },
    },
    isLoading: false,
    isError: false,
  }
})

describe("sections de la page d'accueil publique", () => {
  it.each(PAGES_LISTES_PUBLIQUES)("applique l'enveloppe blanche et la zone de résultats à %s", (_nom, Page) => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Page)),
    )
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html
    const zoneBlanche = conteneur.querySelector(".vt-top-section")
    const zoneResultats = conteneur.querySelector(".vt-content-area")

    expect(zoneBlanche?.querySelector(".vt-breadcrumb nav")?.getAttribute("aria-label")).toBe("Fil d'Ariane")
    expect(zoneBlanche?.querySelector(".vt-subtitle")?.textContent).toBeTruthy()
    expect(zoneBlanche?.querySelector("h1.vt-page-title")?.textContent).toBeTruthy()
    expect(zoneBlanche?.querySelector(".vt-page-desc")?.textContent).toBeTruthy()
    expect(zoneBlanche?.querySelector(".vt-search-wrapper")).not.toBeNull()
    expect(zoneResultats?.querySelector(".vt-results-count")?.textContent).toMatch(/^\d+ résultats trouvés$/)
    expect(html).not.toMatch(/Affichage de \d+ sur \d+/i)
  })

  it("respecte l'ordre des quatre sections éditoriales", () => {
    const html = rendreAccueil()
    const ordre = ["actualites", "partenariats", "projets", "partenaires"].map((id) => html.indexOf(`id="${id}"`))

    expect(ordre.every((position) => position >= 0)).toBe(true)
    expect([...ordre].sort((a, b) => a - b)).toEqual(ordre)
  })

  it("affiche les quatre états vides contextualisés à l'accueil", () => {
    donnees.accueil.data.dernieres_publications = []
    donnees.accueil.data.projets_a_la_une = []
    donnees.partenaires.data.data = []
    donnees.partenariats.data = []

    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()
    const etatsVides = Array.from(conteneur.querySelectorAll(".vt-empty-state-card"))

    expect(etatsVides).toHaveLength(4)
    expect(etatsVides.map((etat) => etat.querySelector("h3")?.textContent)).toEqual([
      "Aucune actualité pour le moment",
      "Les partenariats seront bientôt en ligne",
      "Aucun projet publié actuellement",
      "La liste des partenaires arrive bientôt",
    ])
    expect(conteneur.querySelector('#actualites .vt-empty-btn[href="/actualites"]')?.textContent).toBe("Voir les actualités")
    expect(conteneur.querySelector('#partenariats .vt-empty-btn[href="/contact"]')?.textContent).toBe("Devenir partenaire")
    expect(conteneur.querySelector('#projets .vt-empty-btn[href="/contact"]')?.textContent).toBe("Proposer un projet")
    expect(conteneur.querySelector('#partenaires .vt-empty-btn[href="/partenariats"]')?.textContent).toBe("Découvrir nos partenariats")
  })

  it("affiche les quatre compteurs publics sur la ligne de temps", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()
    const section = conteneur.querySelector(".vt-horizontal-timeline")

    expect(Array.from(section?.querySelectorAll(".vt-timeline-number") ?? []).map((item) => item.textContent)).toEqual([
      "3",
      "4",
      "4",
      "2",
    ])
    expect(Array.from(section?.querySelectorAll(".vt-timeline-label") ?? []).map((item) => item.textContent)).toEqual([
      "Établissements",
      "Partenaire",
      "Projet",
      "Pays partenaire",
    ])
    expect(section?.querySelectorAll(".vt-timeline-sublabel")).toHaveLength(0)
    expect(section?.querySelectorAll(".vt-timeline-stat")).toHaveLength(4)
    expect(section?.querySelectorAll(".vt-timeline-dot")).toHaveLength(4)
    expect(section?.querySelector(".vt-asymmetric-stats, .vt-stat-small-card, .vt-stat-big-main")).toBeNull()
    expect(section?.textContent).not.toMatch(/publication|projet publié|convention|document/i)
  })

  it("uniformise les titres, sous-titres et boutons des quatre sections", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    const titres = ["Nos Actualités", "Nos Partenariats", "Nos Projets", "Nos Partenaires"]
    const boutons = [
      "Voir toutes les actualités",
      "Voir tous les partenariats",
      "Voir tous les projets",
      "Voir tous les partenaires",
    ]
    const entetes = Array.from(
      conteneur.querySelectorAll(".vt-accueil-section-head"),
    )

    expect(entetes).toHaveLength(4)
    expect(entetes.map((entete) => entete.querySelector(".vt-accueil-section-copy h2")?.textContent)).toEqual(titres)
    expect(entetes.every((entete) => entete.querySelector(".vt-section-eyebrow"))).toBe(true)
    expect(entetes.every((entete) => entete.querySelector(".vt-accueil-section-copy > p")?.textContent)).toBe(true)
    expect(
      Array.from(conteneur.querySelectorAll(".vt-btn-circle-arrow"))
        .map((bouton) => bouton.textContent?.trim()),
    ).toEqual(boutons)
    expect(
      Array.from(conteneur.querySelectorAll(".vt-btn-circle-arrow"))
        .map((bouton) => (bouton as HTMLAnchorElement).getAttribute("href")),
    ).toEqual(["/actualites", "/partenariats", "/projets", "/partenaires"])
    expect(entetes.every((entete) => entete.querySelector(".vt-arrow-circle svg[aria-hidden='true']"))).toBe(true)
    expect(conteneur.querySelector(".vt-accueil-section-action, .vt-btn-voir-tout")).toBeNull()
    expect(conteneur.textContent).not.toMatch(/à la une|en vedette|mis en avant/i)
  })

  it("limite actualités, projets et partenariats à quatre cartes maximum", () => {
    definirNombreElementsAccueil(6)
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    expect(conteneur.querySelectorAll("#actualites .vt-pub")).toHaveLength(4)
    expect(conteneur.querySelectorAll("#actualites .vt-news-list-content")).toHaveLength(0)
    expect(conteneur.querySelectorAll("#projets .vt-time-card")).toHaveLength(4)
    expect(conteneur.querySelectorAll("#partenariats .vt-timeline-card")).toHaveLength(4)
    expect(conteneur.querySelector("#actualites .vt-accueil-card-grid")?.classList.contains("vt-card-grid-4")).toBe(true)
    expect(conteneur.querySelector("#projets .vt-projects-list-home")).not.toBeNull()
    expect(conteneur.querySelector("#partenariats .vt-timeline")).not.toBeNull()
  })

  it("garde la grille des actualités et applique les présentations dédiées à un élément", () => {
    definirNombreElementsAccueil(1)
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    expect(conteneur.querySelectorAll("#actualites .vt-card-featured > .vt-pub")).toHaveLength(1)
    expect(conteneur.querySelector("#partenariats .vt-timeline-item")).not.toBeNull()
    expect(conteneur.querySelectorAll("#partenariats .vt-card-featured")).toHaveLength(0)
    expect(conteneur.querySelector("#projets .vt-projects-list-home .vt-time-card-home")).not.toBeNull()
    expect(conteneur.querySelectorAll("#projets .vt-card-featured")).toHaveLength(0)
    expect(conteneur.querySelector("#projets")?.textContent).not.toMatch(/avancement|progression|%/i)
  })

  it.each([2, 3])("conserve les présentations multi-cartes pour %i éléments", (nombre) => {
    definirNombreElementsAccueil(nombre)
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    const grilleActualites = conteneur.querySelector("#actualites .vt-accueil-card-grid")
    expect(grilleActualites?.classList.contains(`vt-card-grid-${nombre}`)).toBe(true)
    expect(grilleActualites?.querySelectorAll(".vt-card-standard")).toHaveLength(nombre)
    expect(grilleActualites?.querySelectorAll(".vt-card-featured")).toHaveLength(0)
    expect(conteneur.querySelectorAll("#partenariats .vt-timeline-item")).toHaveLength(nombre)
    expect(conteneur.querySelectorAll("#projets .vt-project-time-item")).toHaveLength(nombre)
    expect(conteneur.querySelectorAll("#projets .vt-card-featured")).toHaveLength(0)
  })

  it("centre trois actualités dans une grille commune en gardant le tri décroissant", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(ActualitesPage)),
    )
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html
    const grille = conteneur.querySelector(".vt-news-list")

    expect(grille?.children).toHaveLength(3)
    expect(Array.from(grille?.children ?? []).every((carte) => carte.classList.contains("vt-news-list-reveal"))).toBe(true)
    expect(Array.from(grille?.querySelectorAll("a[href^='/actualites/']") ?? [])
      .map((lien) => lien.getAttribute("href")))
      .toEqual([
        "/actualites/publication-3",
        "/actualites/publication-2",
        "/actualites/publication-1",
      ])
  })

  it("affiche les onglets publics Projets, Partenariats, Partenaires et Publications", () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        { initialEntries: ["/projets-partenariats?onglet=partenariats"] },
        createElement(ProjetsPartenariatsPubliquePage),
      ),
    )
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html
    const onglets = Array.from(conteneur.querySelectorAll('[role="tab"]')).map((onglet) => onglet.textContent?.trim())

    expect(onglets).toEqual(["Projets", "Partenariats", "Partenaires", "Publications"])
  })

  it("place les CTA circulaires dans l’en-tête avant le contenu des sections", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    for (const [section, selecteur] of [
      ["actualites", ".vt-accueil-card-grid"],
      ["projets", ".vt-projects-list-home"],
      ["partenariats", ".vt-timeline"],
      ["partenaires", ".vt-partner-grid"],
    ]) {
      const entete = conteneur.querySelector(`#${section} .vt-accueil-section-head`)
      const bouton = entete?.querySelector(".vt-btn-circle-arrow")
      const contenu = conteneur.querySelector(`#${section} ${selecteur}`)
      expect(entete).not.toBeNull()
      expect(bouton).not.toBeNull()
      expect(contenu).not.toBeNull()
      expect(entete!.compareDocumentPosition(contenu!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    }
    expect(conteneur.querySelector(".vt-accueil-section-action, .vt-btn-voir-tout")).toBeNull()
    expect(conteneur.querySelector("#projets .vt-projects-list-home")?.classList.contains("vt-hscroll")).toBe(false)
  })

  it("présente les partenaires en grille de logos avec leur nom et leur pays", () => {
    donnees.partenaires.data.data[1].logo_url = null
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(PublicPartenairesListePage)),
    )
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html
    const tuiles = conteneur.querySelectorAll(".vt-logo-tile")

    expect(conteneur.querySelector(".vt-logo-grid")?.children).toHaveLength(4)
    expect(tuiles).toHaveLength(4)
    expect(tuiles[1].querySelector(".vt-partenaire-logo-image")).toBeNull()
    expect(tuiles[1].querySelector("img")).toBeNull()
    expect(tuiles[1].querySelector("svg")).toBeNull()
    expect(tuiles[1].querySelector("strong")?.textContent).toBe("Partenaire 2")
    expect(tuiles[1].querySelector(".vt-partenaire-pays")?.textContent).toBe("Madagascar")
  })

  it("privilégie la couverture, puis la première photo de galerie, avec un repli neutre", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    expect(conteneur.querySelector('#actualites img[src="/images/couverture-demo.jpg"]')).not.toBeNull()
    expect(conteneur.querySelector('#actualites img[src="/images/galerie-1.jpg"]')).toBeNull()
    expect(conteneur.querySelector('#actualites img[src="/images/galerie-2.jpg"]')).not.toBeNull()
    expect(conteneur.querySelector('#actualites img[src="/images/icone_aucune_image.jpg"]')).not.toBeNull()
  })

  it("relie les CTA et les cartes aux routes canoniques", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    expect(conteneur.querySelector('a[href="/partenaires"]')?.textContent).toContain("Nos partenaires")
    expect(conteneur.querySelector('a[href="/contact"]')?.textContent).toContain("Nous contacter")
    expect(conteneur.querySelector('#actualites a[href="/actualites"]')?.textContent).toContain("Voir toutes les actualités")
    expect(conteneur.querySelector('#partenaires a[href="/partenaires"]')?.textContent).toContain("Voir tous les partenaires")
    expect(conteneur.querySelector('#projets a[href="/projets"]')?.textContent).toContain("Voir tous les projets")
    expect(conteneur.querySelector('#partenariats a[href="/partenariats"]')?.textContent).toContain("Voir tous les partenariats")
    expect(conteneur.querySelectorAll('#actualites a[href^="/actualites/"]')).toHaveLength(4)
    expect(conteneur.querySelectorAll('#projets a[href^="/projets/"]')).toHaveLength(4)
    expect(conteneur.querySelectorAll('#partenariats a[href^="/partenariats/"]')).toHaveLength(4)
  })

  it("rend les fiches de partenariats sans dates ni périodes internes", () => {
    donnees.partenariats.data[0].date_fin = "2020-12-31"
    donnees.partenariats.data[1].date_debut = "2027-01-01"
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PublicPartenariatsListePage)))
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html

    expect(conteneur.querySelectorAll(".vt-partenariats-grid .vt-pub")).toHaveLength(4)
    expect(conteneur.querySelector(".vt-period-note")).toBeNull()
    expect(conteneur.querySelector(".vt-results-count")?.textContent).toBe("4 résultats trouvés")
    expect(conteneur.textContent).not.toMatch(/Période calculée|Depuis 2020|2027/i)
  })

  it("rend la liste publique en time-cards responsives sans avancement", () => {
    donnees.projets.data.data = [creerProjet(1), creerProjet(2), creerProjet(3)]
    donnees.projets.data.meta = { page: 1, limit: 100, total: 3, totalPages: 1 }
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PublicProjetsListePage)))
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html

    expect(conteneur.querySelectorAll(".vt-projects-list-page .vt-time-card-list")).toHaveLength(3)
    expect(conteneur.querySelectorAll(".vt-time-card-list .vt-time-date-block")).toHaveLength(0)
    expect(conteneur.querySelectorAll(".vt-time-card-list .vt-card-action")).toHaveLength(3)
    expect(conteneur.querySelectorAll(".vt-time-card-list .vt-time-meta")).toHaveLength(3)
    expect(conteneur.querySelectorAll(".vt-time-card-list")[0].textContent).not.toMatch(/avancement|progression|%|2026|En cours/i)
    expect(conteneur.querySelector(".vt-results-count")?.textContent).toBe("3 résultats trouvés")
    expect(conteneur.querySelector(".vt-content-area")).not.toBeNull()
    expect(conteneur.querySelector(".vt-project-filter-status-group")).not.toBeNull()
    expect(conteneur.querySelector(".vt-project-filter-domain-group")).not.toBeNull()
    expect(conteneur.querySelector(".vt-project-filter-establishment-group")).toBeNull()
  })

  it("utilise le même état vide contextualisé dans les pages de liste", () => {
    donnees.publications.data.data = []
    let conteneur = document.createElement("div")
    conteneur.innerHTML = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ActualitesPage)))
    expect(conteneur.querySelector(".vt-empty-state-card h3")?.textContent).toBe("Aucune actualité pour le moment")
    expect(conteneur.querySelector(".vt-empty-state-card .vt-empty-btn")).toBeNull()

    donnees.partenaires.data.data = []
    conteneur = document.createElement("div")
    conteneur.innerHTML = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PublicPartenairesListePage)))
    expect(conteneur.querySelector(".vt-empty-state-card h3")?.textContent).toBe("La liste des partenaires arrive bientôt")

    donnees.projets.data.data = []
    conteneur = document.createElement("div")
    conteneur.innerHTML = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PublicProjetsListePage)))
    expect(conteneur.querySelector(".vt-empty-state-card h3")?.textContent).toBe("Aucun projet public pour le moment")

    donnees.partenariats.data = []
    conteneur = document.createElement("div")
    conteneur.innerHTML = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(PublicPartenariatsListePage)))
    expect(conteneur.querySelector(".vt-empty-state-card h3")?.textContent).toBe("Les partenariats seront bientôt en ligne")
  })

  it("rend les actualités en magazine avec articles sans archives internes", () => {
    const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(ActualitesPage)))
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html

    expect(conteneur.querySelector(".vt-news-layout")).not.toBeNull()
    expect(conteneur.querySelectorAll(".vt-news-list-item")).toHaveLength(3)
    expect(conteneur.querySelectorAll(".vt-news-recent-list li")).toHaveLength(3)
    expect(conteneur.querySelector(".vt-news-archive-list")).toBeNull()
    expect(conteneur.querySelectorAll(".vt-news-list-item a[href^='/actualites/']")).toHaveLength(3)
  })

  it("rend les logos des partenaires cliquables vers leur fiche", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()
    const destinations = new Set(
      Array.from(conteneur.querySelectorAll<HTMLAnchorElement>('#partenaires a[href^="/partenaires/"]'))
        .map((lien) => lien.getAttribute("href")),
    )

    expect(destinations).toEqual(new Set(["/partenaires/partenaire-1", "/partenaires/partenaire-2", "/partenaires/partenaire-3", "/partenaires/partenaire-4"]))
  })
})
