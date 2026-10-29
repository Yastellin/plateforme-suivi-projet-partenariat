// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ConventionForm } from "@/features/conventions/components/ConventionForm"

const { creerConvention } = vi.hoisted(() => ({ creerConvention: vi.fn() }))

vi.mock("@/features/conventions/api/useCreateConvention", () => ({
  useCreateConvention: () => ({ isPending: false, mutate: creerConvention }),
}))
vi.mock("@/features/conventions/api/useUpdateConvention", () => ({
  useUpdateConvention: () => ({ isPending: false, mutate: vi.fn() }),
}))
vi.mock("@/features/partenariats/api/usePartenariats", () => ({
  usePartenariats: () => ({ data: { data: [] }, isLoading: false }),
}))
vi.mock("@/features/projets/api/useProjets", () => ({
  useProjets: () => ({
    data: { data: [{ id: "projet-test", nom: "Projet test" }] },
    isLoading: false,
  }),
}))
vi.mock("@/features/cotutelles/api/useCotutelles", () => ({
  useCotutelles: () => ({ data: { data: [] }, isLoading: false }),
}))
vi.mock("@/features/documents/api/useUploadDocument", () => ({
  useUploadDocument: () => ({ isPending: false, mutate: vi.fn(), mutateAsync: vi.fn() }),
}))

vi.mock("@/components/ui/button", async () => {
  const React = await import("react")
  return {
    Button: ({ children, variant: _variant, ...props }: any) =>
      React.createElement("button", props, children),
  }
})
vi.mock("@/components/ui/input", async () => {
  const React = await import("react")
  return { Input: (props: any) => React.createElement("input", props) }
})
vi.mock("@/components/ui/label", async () => {
  const React = await import("react")
  return {
    Label: ({ children, requis: _requis, ...props }: any) =>
      React.createElement("label", props, children),
  }
})
vi.mock("@/components/ui/textarea", async () => {
  const React = await import("react")
  return { Textarea: (props: any) => React.createElement("textarea", props) }
})
vi.mock("@/components/ui/select", async () => {
  const React = await import("react")
  return {
    Select: ({ value, onValueChange, disabled, children }: any) =>
      React.createElement(
        "select",
        {
          value,
          disabled,
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
            onValueChange(event.currentTarget.value),
        },
        children,
      ),
    SelectTrigger: () => null,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => React.createElement(React.Fragment, null, children),
    SelectItem: ({ value, children }: any) =>
      React.createElement("option", { value }, children),
  }
})

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

let conteneur: HTMLDivElement
let racine: Root

beforeEach(() => {
  creerConvention.mockClear()
  conteneur = document.createElement("div")
  document.body.appendChild(conteneur)
  racine = createRoot(conteneur)
})

afterEach(async () => {
  await act(async () => racine.unmount())
  conteneur.remove()
})

describe("formulaire de convention", () => {
  it("laisse soumettre un formulaire invalide pour afficher les erreurs", async () => {
    await act(async () => {
      racine.render(
        createElement(ConventionForm, {
          onSucces: vi.fn(),
          onAnnuler: vi.fn(),
        }),
      )
    })

    const selectProjet = conteneur.querySelectorAll("select")[2]
    await act(async () => {
      selectProjet.value = "projet-test"
      selectProjet.dispatchEvent(new Event("change", { bubbles: true }))
    })

    const boutonCreer = Array.from(conteneur.querySelectorAll("button")).find(
      (bouton) => bouton.textContent?.includes("Créer la convention"),
    )
    expect(boutonCreer).toBeDefined()
    expect((boutonCreer as HTMLButtonElement).disabled).toBe(false)

    await act(async () => (boutonCreer as HTMLButtonElement).click())

    expect(conteneur.textContent).toContain("Le titre doit contenir au moins 3 caractères")
    expect(creerConvention).not.toHaveBeenCalled()
  })

  it("envoie la convention quand les champs requis sont valides", async () => {
    await act(async () => {
      racine.render(
        createElement(ConventionForm, {
          onSucces: vi.fn(),
          onAnnuler: vi.fn(),
        }),
      )
    })

    const champTitre = conteneur.querySelector<HTMLInputElement>("#titre")!
    const definirValeur = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!
    await act(async () => {
      definirValeur.call(champTitre, "Convention de test")
      champTitre.dispatchEvent(new Event("input", { bubbles: true }))
    })

    const selectProjet = conteneur.querySelectorAll("select")[2]
    await act(async () => {
      selectProjet.value = "projet-test"
      selectProjet.dispatchEvent(new Event("change", { bubbles: true }))
    })

    const boutonCreer = Array.from(conteneur.querySelectorAll("button")).find(
      (bouton) => bouton.textContent?.includes("Créer la convention"),
    ) as HTMLButtonElement
    await act(async () => boutonCreer.click())

    expect(creerConvention).toHaveBeenCalledOnce()
    expect(creerConvention.mock.calls[0][0]).toMatchObject({
      titre: "Convention de test",
      projet_id: "projet-test",
    })
  })
})
