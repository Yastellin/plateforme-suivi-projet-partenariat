import { describe, expect, it } from "vitest"
import { resoudreUrlFichier } from "@/lib/url"

describe("résolution des médias publics", () => {
  it("conserve une URL absolue", () => {
    expect(resoudreUrlFichier("https://medias.univ-toliara.mg/logo.png")).toBe(
      "https://medias.univ-toliara.mg/logo.png",
    )
  })

  it("résout un chemin d'upload sur l'origine de l'API sans perdre le chemin", () => {
    const resolue = resoudreUrlFichier(
      "/uploads/publications/publication/photo.png",
    )
    const url = new URL(resolue, "https://partenariats.univ-toliara.mg")

    expect(url.pathname).toBe("/uploads/publications/publication/photo.png")
    expect(resolue).not.toContain("undefined")
  })

  it("gère l'absence de média", () => {
    expect(resoudreUrlFichier(null)).toBe("")
  })
})
