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

    expect(url.pathname).toBe(
      "/api/uploads/publications/publication/photo.png",
    )
    expect(resolue).not.toContain("undefined")
  })

  it("ne double pas le préfixe API d'un média déjà résolu", () => {
    expect(resoudreUrlFichier("/api/uploads/logos/presidence/logo.webp")).toBe(
      "/api/uploads/logos/presidence/logo.webp",
    )
  })

  it("conserve les aperçus locaux blob et data", () => {
    expect(resoudreUrlFichier("blob:https://exemple.mg/123")).toBe(
      "blob:https://exemple.mg/123",
    )
    expect(resoudreUrlFichier("data:image/png;base64,AAAA")).toBe(
      "data:image/png;base64,AAAA",
    )
  })

  it("gère l'absence de média", () => {
    expect(resoudreUrlFichier(null)).toBe("")
  })
})
