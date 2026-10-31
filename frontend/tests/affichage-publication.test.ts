import { describe, expect, it } from "vitest"
import { formaterDatePublication, libelleStatutPublication, pluriel } from "@/features/publications/lib/affichage-publication"

describe("affichage des publications", () => {
  it("renvoie null pour une date vide ou nulle, sans Invalid Date", () => {
    expect(formaterDatePublication(null)).toBeNull()
    expect(formaterDatePublication(undefined)).toBeNull()
    expect(formaterDatePublication("")).toBeNull()
    expect(formaterDatePublication("n'importe quoi")).toBeNull()
  })

  it("formate une date valide en français", () => {
    expect(formaterDatePublication("2026-03-15T00:00:00.000Z")).toMatch(/2026/)
  })

  it("libellés de statut avec accent", () => {
    expect(libelleStatutPublication("PUBLIEE")).toBe("Publiée")
    expect(libelleStatutPublication("BROUILLON")).toBe("Brouillon")
  })

  it("gère le pluriel", () => {
    expect(pluriel(0, "publication", "publications")).toBe("publication")
    expect(pluriel(1, "publication", "publications")).toBe("publication")
    expect(pluriel(2, "publication", "publications")).toBe("publications")
  })
})
