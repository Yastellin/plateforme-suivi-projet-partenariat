import { describe, expect, it } from "vitest"
import { permissionsPourRole } from "@/hooks/usePermissions"

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
