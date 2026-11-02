// @vitest-environment jsdom
import { act, createElement } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ConventionForm } from "@/features/conventions/components/ConventionForm"

const { creerConvention, toastErreur } = vi.hoisted(() => ({
  creerConvention: vi.fn(),
  toastErreur: vi.fn(),
}))

vi.mock("sonner", () => ({
  toast: { error: toastErreur, success: vi.fn() },
}))

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
  toastErreur.mockClear()
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
      definirValeur.call(champTitre, "Convention 2")
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
      titre: "Convention 2",
      projet_id: "projet-test",
    })

    const optionsMutation = creerConvention.mock.calls[0][1]
    await act(async () => {
      optionsMutation.onError(new Error("titre must be longer than or equal to 3 characters"))
    })
    expect(toastErreur).toHaveBeenCalledWith(
      "Le titre doit contenir au moins 3 caractères.",
    )
  })

  it("soumet une convention indépendante sans rattachement", async () => {
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
      definirValeur.call(champTitre, "Convention indépendante")
      champTitre.dispatchEvent(new Event("input", { bubbles: true }))
      conteneur.querySelectorAll("select").forEach((select, index) => {
        if (index > 0) {
          select.value = "__aucun__"
          select.dispatchEvent(new Event("change", { bubbles: true }))
        }
      })
    })

    const boutonCreer = Array.from(conteneur.querySelectorAll("button")).find(
      (bouton) => bouton.textContent?.includes("Créer la convention"),
    ) as HTMLButtonElement
    await act(async () => boutonCreer.click())

    expect(creerConvention).toHaveBeenCalledOnce()
    expect(creerConvention.mock.calls[0][0]).toMatchObject({
      titre: "Convention indépendante",
      partenariat_id: "",
      projet_id: "",
      cotutelle_id: "",
    })
  })

  it("automatise le statut à la création puis le restaure si la date redevient future", async () => {
    await act(async () => {
      racine.render(
        createElement(ConventionForm, {
          onSucces: vi.fn(),
          onAnnuler: vi.fn(),
        }),
      )
    })

    const definirValeur = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!
    const dateSignature = conteneur.querySelector<HTMLInputElement>("#date_signature")!
    const aujourdhui = new Date()
    const dateAtteinte = [
      aujourdhui.getFullYear(),
      String(aujourdhui.getMonth() + 1).padStart(2, "0"),
      String(aujourdhui.getDate()).padStart(2, "0"),
    ].join("-")

    await act(async () => {
      definirValeur.call(dateSignature, dateAtteinte)
      dateSignature.dispatchEvent(new Event("input", { bubbles: true }))
    })

    const selectStatut = Array.from(conteneur.querySelectorAll("select")).find(
      (select) => Array.from(select.options).some((option) => option.value === "SIGNEE"),
    ) as HTMLSelectElement
    expect(selectStatut.value).toBe("SIGNEE")
    expect(conteneur.textContent).toContain("le statut passera automatiquement à « Signée »")

    const dateFuture = new Date(aujourdhui.getFullYear(), aujourdhui.getMonth(), aujourdhui.getDate() + 1)
    const dateFutureLocale = [
      dateFuture.getFullYear(),
      String(dateFuture.getMonth() + 1).padStart(2, "0"),
      String(dateFuture.getDate()).padStart(2, "0"),
    ].join("-")
    await act(async () => {
      definirValeur.call(dateSignature, dateFutureLocale)
      dateSignature.dispatchEvent(new Event("input", { bubbles: true }))
    })

    expect(selectStatut.value).toBe("BROUILLON")
    expect(conteneur.textContent).not.toContain("le statut passera automatiquement à « Signée »")
  })

  it("conserve le statut choisi manuellement même avec une date atteinte", async () => {
    await act(async () => {
      racine.render(
        createElement(ConventionForm, {
          onSucces: vi.fn(),
          onAnnuler: vi.fn(),
        }),
      )
    })

    const definirValeur = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!
    const selectStatut = Array.from(conteneur.querySelectorAll("select")).find(
      (select) => Array.from(select.options).some((option) => option.value === "EN_ATTENTE_SIGNATURE"),
    ) as HTMLSelectElement
    await act(async () => {
      selectStatut.value = "EN_ATTENTE_SIGNATURE"
      selectStatut.dispatchEvent(new Event("change", { bubbles: true }))
    })

    const aujourdhui = new Date()
    const dateLocale = [
      aujourdhui.getFullYear(),
      String(aujourdhui.getMonth() + 1).padStart(2, "0"),
      String(aujourdhui.getDate()).padStart(2, "0"),
    ].join("-")
    const dateSignature = conteneur.querySelector<HTMLInputElement>("#date_signature")!
    await act(async () => {
      definirValeur.call(dateSignature, dateLocale)
      dateSignature.dispatchEvent(new Event("input", { bubbles: true }))
    })

    expect(selectStatut.value).toBe("EN_ATTENTE_SIGNATURE")
    expect(conteneur.textContent).not.toContain("le statut passera automatiquement à « Signée »")
  })

  it("affiche un avertissement non bloquant si la signature est postérieure au début", async () => {
    await act(async () => {
      racine.render(
        createElement(ConventionForm, {
          onSucces: vi.fn(),
          onAnnuler: vi.fn(),
        }),
      )
    })

    const definirValeur = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!
    const dateSignature = conteneur.querySelector<HTMLInputElement>("#date_signature")!
    const dateDebut = conteneur.querySelector<HTMLInputElement>("#date_debut")!

    await act(async () => {
      definirValeur.call(dateDebut, "2030-04-10")
      dateDebut.dispatchEvent(new Event("input", { bubbles: true }))
      definirValeur.call(dateSignature, "2030-04-11")
      dateSignature.dispatchEvent(new Event("input", { bubbles: true }))
    })

    const avertissement = conteneur.querySelector('[role="status"]')
    expect(avertissement?.textContent).toContain(
      "Attention : la date de début est antérieure à la date de signature.",
    )
    expect(avertissement?.className).toContain("status-attente")
    expect(dateDebut.getAttribute("aria-invalid")).not.toBe("true")
  })
})
