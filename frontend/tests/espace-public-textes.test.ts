import { describe, expect, it } from "vitest"
import {
  resumeProjet,
  resumePartenaire,
  resumePublication,
} from "@/features/espace-public/lib/publique"

describe("descriptions publiques", () => {
  it("n'expose que les descriptions fournies par l'API", () => {
    expect(
      resumeProjet({ description: "Texte fourni", statut: "EN_COURS", domaine: null, etablissement: null }),
    ).toBe("Texte fourni")
    expect(resumePartenaire({ description: "Description partenaire", pays: "France" })).toBe("Description partenaire")
    expect(resumePublication({ description_publique: "Compte rendu", projet: { nom: "Lémuriens" } })).toBe("Compte rendu")
  })

  it("ne fabrique pas de contenu lorsque les champs éditoriaux sont absents", () => {
    expect(resumeProjet({ description: null, statut: "TERMINE", domaine: null, etablissement: null })).toBe("")
    expect(resumePartenaire({ description: null, pays: "Madagascar" })).toBe("")
    expect(resumePublication({ description_publique: null, projet: { nom: "Lémuriens" } })).toBe("")
  })
})
