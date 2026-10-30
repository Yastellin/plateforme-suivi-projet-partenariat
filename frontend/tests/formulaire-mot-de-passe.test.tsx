// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { MemoryRouter } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { FormulaireMotDePasse } from "@/features/comptes/components/FormulaireMotDePasse"

const { mutate, toastSucces, toastErreur } = vi.hoisted(() => ({
  mutate: vi.fn(),
  toastSucces: vi.fn(),
  toastErreur: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: { success: toastSucces, error: toastErreur },
}))

vi.mock("@/features/comptes/api/useChangerMotDePasse", () => ({
  useChangerMotDePasse: () => ({ isPending: false, mutate }),
}))

vi.mock("framer-motion", async () => {
  const React = await import("react")
  const Formulaire = React.forwardRef<HTMLFormElement, any>(
    ({ animate: _animate, transition: _transition, ...props }, ref) =>
      React.createElement("form", { ...props, ref }),
  )
  return { motion: { form: Formulaire }, useReducedMotion: () => false }
})

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let conteneur: HTMLDivElement
let racine: Root

beforeEach(() => {
  mutate.mockClear()
  toastSucces.mockClear()
  toastErreur.mockClear()
  conteneur = document.createElement("div")
  document.body.appendChild(conteneur)
  racine = createRoot(conteneur)
})

afterEach(async () => {
  await act(async () => racine.unmount())
  conteneur.remove()
})

async function monterFormulaire() {
  await act(async () => {
    racine.render(
      createElement(MemoryRouter, null, createElement(FormulaireMotDePasse)),
    )
  })
}

async function saisir(champ: HTMLInputElement, valeur: string) {
  const definirValeur = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )!.set!
  await act(async () => {
    definirValeur.call(champ, valeur)
    champ.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

describe("formulaire de changement de mot de passe", () => {
  it("masque les trois champs, expose les instructions et permet le basculement", async () => {
    await monterFormulaire()
    const champs = conteneur.querySelectorAll<HTMLInputElement>("input")

    expect(champs).toHaveLength(3)
    expect(Array.from(champs).map((champ) => champ.type)).toEqual([
      "password",
      "password",
      "password",
    ])

    const boutonsAfficher = conteneur.querySelectorAll<HTMLButtonElement>(
      'button[aria-label="Afficher le mot de passe"]',
    )
    expect(boutonsAfficher).toHaveLength(3)
    expect(
      Array.from(boutonsAfficher).every((bouton) => bouton.type === "button"),
    ).toBe(true)

    await act(async () => boutonsAfficher[0].click())
    expect(champs[0].type).toBe("text")
    expect(
      conteneur.querySelectorAll(
        'button[aria-label="Masquer le mot de passe"]',
      ),
    ).toHaveLength(1)
    await act(async () =>
      conteneur
        .querySelector<HTMLButtonElement>(
          'button[aria-label="Masquer le mot de passe"]',
        )!
        .click(),
    )
    expect(champs[0].type).toBe("password")

    expect(conteneur.textContent).toContain(
      "Au moins 8 caractères, une majuscule, une minuscule et un chiffre.",
    )
    expect(conteneur.textContent).toContain(
      "Les deux mots de passe doivent être identiques.",
    )
    expect(
      conteneur.querySelector<HTMLAnchorElement>("a")?.getAttribute("href"),
    ).toBe("/mot-de-passe-oublie")
    for (const champ of champs) {
      const descriptions =
        champ.getAttribute("aria-describedby")?.split(" ") ?? []
      expect(descriptions.length).toBeGreaterThan(0)
      for (const id of descriptions)
        expect(document.getElementById(id)).not.toBeNull()
    }
  })

  it("affiche les erreurs puis réinitialise les champs et leur visibilité après succès", async () => {
    await monterFormulaire()
    const [actuel, nouveau, confirmation] = Array.from(
      conteneur.querySelectorAll<HTMLInputElement>("input"),
    )
    await saisir(actuel, "AncienMotDePasse1")
    await saisir(nouveau, "Court1")
    await saisir(confirmation, "Court1")

    expect(nouveau.getAttribute("aria-invalid")).toBe("true")
    expect(conteneur.textContent).toContain("au moins 8 caractères")

    await saisir(nouveau, "NouveauMotDePasse1")
    await saisir(confirmation, "AutreMotDePasse2")
    expect(confirmation.getAttribute("aria-invalid")).toBe("true")
    expect(conteneur.textContent).toContain(
      "Les deux mots de passe doivent être identiques.",
    )

    await saisir(confirmation, "NouveauMotDePasse1")
    await act(async () =>
      conteneur
        .querySelector<HTMLButtonElement>(
          'button[aria-label="Afficher le mot de passe"]',
        )!
        .click(),
    )
    const soumettre = Array.from(
      conteneur.querySelectorAll<HTMLButtonElement>("button"),
    ).find((bouton) =>
      bouton.textContent?.includes("Modifier le mot de passe"),
    )!
    expect(soumettre.disabled).toBe(false)
    await act(async () => soumettre.click())

    expect(mutate).toHaveBeenCalledOnce()
    const options = mutate.mock.calls[0][1] as { onSuccess: () => void }
    await act(async () => options.onSuccess())

    expect(toastSucces).toHaveBeenCalledWith("Mot de passe modifié avec succès")
    expect(
      Array.from(conteneur.querySelectorAll<HTMLInputElement>("input")).map(
        (champ) => champ.value,
      ),
    ).toEqual(["", "", ""])
    expect(
      Array.from(conteneur.querySelectorAll<HTMLInputElement>("input")).map(
        (champ) => champ.type,
      ),
    ).toEqual(["password", "password", "password"])
  })
})
