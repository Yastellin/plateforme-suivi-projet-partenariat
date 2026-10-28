// @vitest-environment jsdom
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

const donnees = vi.hoisted(() => ({
  accueil: { data: undefined as any, isLoading: false, isError: false },
  partenaires: { data: undefined as any, isLoading: false, isError: false },
  partenariats: { data: [] as any[], isLoading: false, isError: false },
  publications: { data: { data: [] as any[], meta: { page: 1, limit: 9, total: 0, totalPages: 1 } }, isLoading: false, isError: false },
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
  usePublicProjets: () => ({ data: { data: [], meta: { page: 1, limit: 9, total: 0, totalPages: 1 } }, isLoading: false }),
}))
vi.mock("@/features/espace-public/api/usePublicPublications", () => ({
  usePublicPublications: () => donnees.publications,
}))
vi.mock("@/features/espace-public/api/usePublicEtablissements", () => ({
  usePublicEtablissements: () => ({ data: { data: [] }, isLoading: false }),
}))
vi.mock("@/features/espace-public/api/usePublicDonneesDetail", () => ({
  usePublicPartenariatsPublies: () => donnees.partenariats,
}))

import { AccueilPage } from "@/features/espace-public/pages/AccueilPage"
import { ActualitesPage } from "@/features/espace-public/pages/ActualitesPage"
import { ProjetsPartenariatsPubliquePage } from "@/features/espace-public/pages/ProjetsPartenariatsPubliquePage"

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
  it("respecte l'ordre des quatre sections éditoriales", () => {
    const html = rendreAccueil()
    const ordre = ["actualites", "partenaires", "projets", "partenariats"].map((id) => html.indexOf(`id="${id}"`))

    expect(ordre.every((position) => position >= 0)).toBe(true)
    expect([...ordre].sort((a, b) => a - b)).toEqual(ordre)
  })

  it("uniformise les titres, sous-titres et boutons des quatre sections", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    const titres = ["Actualités", "Partenaires", "Projets", "Partenariats"]
    const boutons = [
      "Voir toutes les actualités",
      "Voir tous les partenaires",
      "Voir tous les projets",
      "Voir tous les partenariats",
    ]
    const entetes = Array.from(
      conteneur.querySelectorAll(".vt-accueil-section-head"),
    )

    expect(entetes).toHaveLength(4)
    expect(entetes.map((entete) => entete.querySelector("h2")?.textContent)).toEqual(titres)
    expect(entetes.every((entete) => entete.querySelector("p")?.textContent)).toBe(true)
    expect(entetes.map((entete) => entete.querySelector("a")?.textContent?.trim())).toEqual(boutons)
    expect(conteneur.textContent).not.toMatch(/à la une|en vedette|mis en avant/i)
  })

  it("limite actualités, projets et partenariats à trois cartes", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    expect(conteneur.querySelectorAll("#actualites .vt-pub")).toHaveLength(3)
    expect(conteneur.querySelectorAll("#projets .vt-pub")).toHaveLength(3)
    expect(conteneur.querySelectorAll("#partenariats .vt-pub")).toHaveLength(3)
  })

  it("centre trois actualités dans une grille commune en gardant le tri décroissant", () => {
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(ActualitesPage)),
    )
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html
    const grille = conteneur.querySelector(".vt-card-list")

    expect(grille?.children).toHaveLength(3)
    expect(Array.from(grille?.children ?? []).every((carte) => carte.classList.contains("vt-card-list-item"))).toBe(true)
    expect(Array.from(grille?.querySelectorAll("a[href^='/projets-partenariats/publication/']") ?? [])
      .map((lien) => lien.getAttribute("href")))
      .toEqual([
        "/projets-partenariats/publication/publication-3",
        "/projets-partenariats/publication/publication-2",
        "/projets-partenariats/publication/publication-1",
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

  it("centre les grilles et garde les projets en une colonne sur mobile", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    for (const section of ["actualites", "projets", "partenariats"]) {
      expect(
        conteneur.querySelector(`#${section} .vt-accueil-card-grid`),
      ).not.toBeNull()
    }
    expect(
      conteneur.querySelector("#projets .vt-accueil-card-grid")?.classList.contains("vt-hscroll"),
    ).toBe(false)
    expect(conteneur.querySelector("#partenaires .vt-logos")).not.toBeNull()
  })

  it("privilégie la couverture, puis la première photo de galerie, avec un repli neutre", () => {
    const conteneur = document.createElement("div")
    conteneur.innerHTML = rendreAccueil()

    expect(conteneur.querySelector('#actualites img[src="/images/couverture-demo.jpg"]')).not.toBeNull()
    expect(conteneur.querySelector('#actualites img[src="/images/galerie-1.jpg"]')).toBeNull()
    expect(conteneur.querySelector('#actualites img[src="/images/galerie-2.jpg"]')).not.toBeNull()
    expect(conteneur.querySelector('#actualites [role="img"][aria-label="Illustration neutre de Actualité 3"]')).not.toBeNull()
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
    expect(conteneur.querySelectorAll('#actualites a[href^="/projets-partenariats/publication/"]')).toHaveLength(3)
    expect(conteneur.querySelectorAll('#projets a[href^="/projets-partenariats/publication/"]')).toHaveLength(3)
    expect(conteneur.querySelectorAll('#partenariats a[href^="/partenariats/"]')).toHaveLength(3)
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
