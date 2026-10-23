import { describe, expect, it } from "vitest"
import { permissionsPourRole } from "@/hooks/usePermissions"
import { peutModifierProjet } from "@/features/projets/lib/permissions-projet"
import type { Projet } from "@/types/api"

describe("matrice des permissions", () => {
  it("réserve l'action de soumission aux établissements", () => {
    expect(permissionsPourRole("ETABLISSEMENT").peutSoumettre).toBe(true)
    expect(permissionsPourRole("PRESIDENCE").peutSoumettre).toBe(false)
    expect(permissionsPourRole("DECIDEUR").peutSoumettre).toBe(false)
  })

  it("réserve archivage, téléversement et export à la Présidence", () => {
    const presidence = permissionsPourRole("PRESIDENCE")
    const etablissement = permissionsPourRole("ETABLISSEMENT")

    expect(presidence).toMatchObject({
      peutArchiver: true,
      peutTeleverser: true,
      peutExporter: true,
    })
    expect(etablissement).toMatchObject({
      peutArchiver: false,
      peutTeleverser: false,
      peutExporter: false,
    })
  })

  it("maintient le décideur en lecture seule", () => {
    expect(permissionsPourRole("DECIDEUR")).toMatchObject({
      peutCreer: false,
      peutModifier: false,
      estLectureSeule: true,
    })
  })
})

type ProjetModifiable = Pick<
  Projet,
  "archive" | "cree_par_role" | "publie_le" | "soumis_le" | "statut"
>

function projet(surcharge: Partial<ProjetModifiable> = {}): ProjetModifiable {
  return {
    archive: false,
    cree_par_role: "ETABLISSEMENT",
    publie_le: null,
    soumis_le: null,
    statut: "BROUILLON",
    ...surcharge,
  }
}

describe("modification d'un projet", () => {
  it("autorise la Présidence à modifier ses propres projets quel que soit leur statut", () => {
    expect(
      peutModifierProjet(
        projet({ cree_par_role: "PRESIDENCE", statut: "EN_COURS" }),
        "PRESIDENCE",
      ),
    ).toBe(true)
  })

  it("interdit à la Présidence de modifier tout projet créé par un établissement", () => {
    expect(peutModifierProjet(projet(), "PRESIDENCE")).toBe(false)
    expect(
      peutModifierProjet(
        projet({ soumis_le: "2026-10-23T08:00:00.000Z" }),
        "PRESIDENCE",
      ),
    ).toBe(false)
  })

  it("verrouille le projet d'un établissement après sa soumission", () => {
    expect(peutModifierProjet(projet(), "ETABLISSEMENT")).toBe(true)
    expect(
      peutModifierProjet(
        projet({ soumis_le: "2026-10-23T08:00:00.000Z" }),
        "ETABLISSEMENT",
      ),
    ).toBe(false)
  })
})
