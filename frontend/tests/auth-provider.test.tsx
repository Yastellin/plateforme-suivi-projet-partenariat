// @vitest-environment jsdom
import { StrictMode, createElement } from "react"
import { act } from "react"
import { createRoot, type Root } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const dependances = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  definirAccessToken: vi.fn(),
  definirTheme: vi.fn(),
}))

vi.mock("@/lib/api-client", () => ({
  default: { post: dependances.post, get: dependances.get },
  definirAccessToken: dependances.definirAccessToken,
}))

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ definirTheme: dependances.definirTheme }),
}))

import { AuthProvider } from "@/features/auth/AuthProvider"
import { useAuth } from "@/hooks/useAuth"

;(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true

function EtatSession() {
  const { utilisateur, estCharge } = useAuth()
  return createElement(
    "p",
    null,
    estCharge ? "Chargement" : utilisateur?.email ?? "Déconnecté",
  )
}

describe("restauration de la session", () => {
  let conteneur: HTMLDivElement
  let racine: Root

  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    dependances.post.mockReset()
    dependances.get.mockReset()
    dependances.definirAccessToken.mockReset()
    dependances.definirTheme.mockReset()
    conteneur = document.createElement("div")
    document.body.appendChild(conteneur)
    racine = createRoot(conteneur)
  })

  afterEach(async () => {
    await act(async () => racine.unmount())
    conteneur.remove()
  })

  it("ne renouvelle qu'une fois un jeton mémorisé sous StrictMode", async () => {
    localStorage.setItem("uf_refresh_token", "jeton-persistant")
    dependances.post.mockResolvedValue({
      data: {
        access_token: "nouvel-acces",
        refresh_token: "nouveau-jeton-persistant",
      },
    })
    dependances.get.mockResolvedValue({
      data: {
        id: "compte-fds",
        email: "direction@univ-fianarantsoa.mg",
        role: "ETABLISSEMENT",
        etablissement_id: "fds",
        etablissement_nom: "Faculté des Sciences",
      },
    })

    await act(async () => {
      racine.render(
        createElement(
          StrictMode,
          null,
          createElement(
            AuthProvider,
            null,
            createElement(EtatSession),
          ),
        ),
      )
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(dependances.post).toHaveBeenCalledTimes(1)
    expect(dependances.post).toHaveBeenCalledWith("/auth/refresh", {
      refresh_token: "jeton-persistant",
    })
    expect(dependances.get).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem("uf_refresh_token")).toBe(
      "nouveau-jeton-persistant",
    )
    expect(sessionStorage.getItem("uf_refresh_token")).toBeNull()
    expect(conteneur.textContent).toContain("direction@univ-fianarantsoa.mg")
  })
})
