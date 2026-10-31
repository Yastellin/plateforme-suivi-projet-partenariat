// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { Breadcrumbs } from "@/components/layout/Breadcrumbs"

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let conteneur: HTMLDivElement
let racine: Root

beforeEach(() => {
  conteneur = document.createElement("div")
  document.body.appendChild(conteneur)
  racine = createRoot(conteneur)
})

afterEach(async () => {
  await act(async () => racine.unmount())
  conteneur.remove()
})

describe("fil d’Ariane des partenaires", () => {
  it("masque le segment de regroupement tout en gardant le lien parent correct", async () => {
    await act(async () => {
      racine.render(
        createElement(
          MemoryRouter,
          {
            initialEntries: [
              "/presidence/partenaires-partenariats/partenaires/12345678-1234-1234-1234-123456789abc",
            ],
          },
          createElement(Breadcrumbs),
        ),
      )
    })

    const navigation = conteneur.querySelector<HTMLElement>(
      'nav[aria-label="Fil d\'Ariane"]',
    )!

    expect(navigation.textContent).toContain("Partenaires")
    expect(navigation.textContent).not.toContain("Partenaires & Partenariats")
    expect(
      navigation.querySelector<HTMLAnchorElement>(
        'a[href="/presidence/partenaires-partenariats/partenaires"]',
      ),
    ).not.toBeNull()
  })
})
