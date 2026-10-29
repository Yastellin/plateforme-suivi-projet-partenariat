// @vitest-environment jsdom
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it } from "vitest"
import { PageIntrouvable } from "@/features/espace-public/components/PageIntrouvable"

function rendrePage(props: Parameters<typeof PageIntrouvable>[0] = {}) {
  return renderToStaticMarkup(
    createElement(MemoryRouter, null, createElement(PageIntrouvable, props)),
  )
}

describe("PageIntrouvable", () => {
  it("affiche le message public par défaut et les liens de réorientation", () => {
    const html = rendrePage()
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html

    expect(conteneur.querySelector(".vt-page-introuvable .vt-404-icon svg")).not.toBeNull()
    expect(conteneur.querySelector(".vt-404-card h1")?.textContent).toBe("Oups, cette page est introuvable")
    expect(conteneur.querySelector(".vt-404-btn[href='/']")?.textContent).toContain("Retour à l'accueil")
    expect(Array.from(conteneur.querySelectorAll(".vt-404-liens a")).map((lien) => lien.getAttribute("href"))).toEqual([
      "/actualites",
      "/projets",
      "/partenaires",
      "/contact",
    ])
  })

  it("accepte un titre et une description propres à la ressource absente", () => {
    const html = rendrePage({
      titre: "Publication introuvable",
      description: "Cette publication n'existe pas ou a été retirée.",
    })
    const conteneur = document.createElement("div")
    conteneur.innerHTML = html

    expect(conteneur.querySelector(".vt-404-card h1")?.textContent).toBe("Publication introuvable")
    expect(conteneur.querySelector(".vt-404-card > p")?.textContent).toBe("Cette publication n'existe pas ou a été retirée.")
  })
})
