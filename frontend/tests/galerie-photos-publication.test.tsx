// @vitest-environment jsdom
import { act, createElement, type ReactNode } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mutations = vi.hoisted(() => ({
  modifier: vi.fn(),
  supprimer: vi.fn(),
}))

vi.mock("framer-motion", () => ({
  Reorder: {
    Group: ({ children }: { children: ReactNode }) =>
      createElement("div", null, children),
    Item: ({ children }: { children: ReactNode }) =>
      createElement("div", null, children),
  },
}))

vi.mock("@/features/publications/api/usePhotosPublication", () => ({
  useModifierPhoto: () => ({
    mutateAsync: mutations.modifier,
    isPending: false,
  }),
  useSupprimerPhoto: () => ({
    mutate: mutations.supprimer,
    isPending: false,
  }),
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { GaleriePhotosReordonnable } from "@/features/publications/components/GaleriePhotosReordonnable"

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

function saisir(entree: HTMLInputElement, valeur: string) {
  const definirValeur = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set
  definirValeur?.call(entree, valeur)
  entree.dispatchEvent(new Event("input", { bubbles: true }))
}

describe("gestion des photos d'une publication", () => {
  let conteneur: HTMLDivElement
  let racine: Root

  beforeEach(() => {
    mutations.modifier.mockReset()
    mutations.modifier.mockResolvedValue({})
    mutations.supprimer.mockReset()
    conteneur = document.createElement("div")
    document.body.appendChild(conteneur)
    racine = createRoot(conteneur)
  })

  afterEach(async () => {
    await act(async () => racine.unmount())
    conteneur.remove()
  })

  it("rend la légende facultative et l'ordre réellement modifiables", async () => {
    await act(async () => {
      racine.render(
        createElement(GaleriePhotosReordonnable, {
          photos: [
            {
              id: "photo-1",
              publication_id: "publication-1",
              url_fichier: "/uploads/publications/publication-1/atelier.webp",
              legende: null,
              ordre: 0,
            },
          ],
        }),
      )
    })

    const entrees = conteneur.querySelectorAll<HTMLInputElement>("input")
    expect(entrees).toHaveLength(2)
    expect(conteneur.textContent).toContain("Légende facultative")
    expect(conteneur.textContent).toContain("Ordre")

    await act(async () => {
      saisir(
        entrees[0],
        "Atelier avec les chercheurs de l'Université de Mahajanga",
      )
      saisir(entrees[1], "3")
    })

    const bouton = conteneur.querySelector<HTMLButtonElement>(
      'button[aria-label="Enregistrer les informations de la photo 4"]',
    )
    expect(bouton).not.toBeNull()
    await act(async () => bouton?.click())

    expect(mutations.modifier).toHaveBeenCalledWith({
      photoId: "photo-1",
      valeurs: {
        legende: "Atelier avec les chercheurs de l'Université de Mahajanga",
        ordre: 3,
      },
    })
  })
})
