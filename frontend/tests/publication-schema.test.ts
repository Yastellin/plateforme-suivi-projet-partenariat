import { describe, expect, it } from "vitest"
import { schemaPublication } from "@/lib/validators/publication.schema"

// Doit rester aligné sur CreatePublicationDto (backend) : titre @MinLength(3)
describe("schemaPublication", () => {
  it("refuse un titre de moins de 3 caractères", () => {
    const resultat = schemaPublication.safeParse({ titre: "Ab" })
    expect(resultat.success).toBe(false)
  })

  it("accepte un titre de 3 caractères", () => {
    const resultat = schemaPublication.safeParse({ titre: "Abc" })
    expect(resultat.success).toBe(true)
  })
})
