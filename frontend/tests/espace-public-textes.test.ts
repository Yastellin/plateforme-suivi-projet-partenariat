import { describe, expect, it } from "vitest"
import {
  resumeProjet,
  resumePartenaire,
  resumePublication,
} from "@/features/espace-public/lib/publique"

describe("textes de repli de la vitrine publique", () => {
  it("garde la description reelle quand elle existe", () => {
    expect(
      resumeProjet({ description: "Texte reel", statut: "EN_COURS", domaine: null, etablissement: null }),
    ).toBe("Texte reel")
  })

  it("decrit un projet sans description a partir de ses donnees", () => {
    expect(
      resumeProjet({
        description: null,
        statut: "EN_COURS",
        domaine: "Agronomie",
        etablissement: { nom: "Faculté des sciences" },
      }),
    ).toBe("Projet en cours dans le domaine agronomie porté par Faculté des sciences.")
  })

  it("attribue un projet sans etablissement a la Presidence", () => {
    expect(
      resumeProjet({ description: null, statut: "TERMINE", domaine: null, etablissement: null }),
    ).toBe("Projet terminé porté par la Présidence.")
  })

  it("decrit un partenaire sans description (pays)", () => {
    expect(resumePartenaire({ description: null, pays: "France" })).toBe(
      "Partenaire de l'Université, présent en France.",
    )
    expect(resumePartenaire({ description: "Accord cadre", pays: "France" })).toBe("Accord cadre")
  })

  it("decrit une publication sans description par le projet source", () => {
    expect(
      resumePublication({ description_publique: null, projet: { nom: "Lémuriens" } }),
    ).toBe("Actualité issue du projet « Lémuriens ».")
  })

  it("n'utilise jamais la formule generique 'a venir'", () => {
    const textes = [
      resumeProjet({ description: null, statut: "EN_ATTENTE", domaine: null, etablissement: null }),
      resumePartenaire({ description: null, pays: "Madagascar" }),
      resumePublication({ description_publique: null, projet: { nom: "X" } }),
    ]
    for (const texte of textes) expect(texte.toLowerCase()).not.toContain("à venir")
  })
})
