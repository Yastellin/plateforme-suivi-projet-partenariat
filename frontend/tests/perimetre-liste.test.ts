import { describe, expect, it } from "vitest"

import { filtrerListeGenerale } from "@/lib/perimetre-liste"

const donnees = [
  {
    id: "presidence",
    cree_par_role: "PRESIDENCE",
    soumis_le: null,
  },
  {
    id: "etablissement",
    cree_par_role: "ETABLISSEMENT",
    soumis_le: "2026-10-22T08:00:00.000Z",
  },
  {
    id: "historique-mal-classe",
    cree_par_role: "PRESIDENCE",
    soumis_le: "2025-06-12T09:30:00.000Z",
  },
]

describe("périmètre des listes générales", () => {
  it("écarte aussi les anciennes soumissions mal classées côté Présidence", () => {
    expect(filtrerListeGenerale(donnees, "PRESIDENCE").map(({ id }) => id)).toEqual([
      "presidence",
    ])
  })

  it("ne masque pas les données dans les espaces non concernés", () => {
    expect(filtrerListeGenerale(donnees, "ETABLISSEMENT")).toEqual(donnees)
    expect(filtrerListeGenerale(donnees, "DECIDEUR")).toEqual(donnees)
  })
})
