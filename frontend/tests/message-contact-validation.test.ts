import { describe, expect, it } from "vitest"
import {
  VALEURS_CONTACT_VIDES,
  filtrerSaisie,
  validerChampContact,
  validerContact,
  type ValeursContact,
} from "@/lib/validators/message-contact"

const valeursValides: ValeursContact = {
  nom: "Jean Rakoto",
  email: "jean.rakoto@example.mg",
  telephone: "+261 34 22 330 54",
  sujet: "Demande de partenariat",
  message: "Bonjour, je souhaite échanger au sujet d'un partenariat.",
}

describe("validerContact", () => {
  it("accepte un formulaire complet et correct", () => {
    expect(validerContact(valeursValides)).toEqual({})
  })

  it("accepte un téléphone vide (champ facultatif)", () => {
    expect(validerContact({ ...valeursValides, telephone: "" })).toEqual({})
  })

  it("signale tous les champs obligatoires vides", () => {
    const erreurs = validerContact(VALEURS_CONTACT_VIDES)
    expect(Object.keys(erreurs).sort()).toEqual(["email", "message", "nom"])
  })
})

describe("validerChampContact", () => {
  it("refuse un nom avec des chiffres ou des symboles", () => {
    expect(validerChampContact("nom", "Jean4")).toBeDefined()
    expect(validerChampContact("nom", "Jean<script>")).toBeDefined()
  })

  it("accepte un nom avec accents, apostrophes et tirets", () => {
    expect(validerChampContact("nom", "Marie-Léa D'Alméida")).toBeUndefined()
  })

  it("refuse un nom d'un seul caractère", () => {
    expect(validerChampContact("nom", "J")).toBeDefined()
  })

  it("refuse un email sans domaine valide", () => {
    expect(validerChampContact("email", "jean@")).toBeDefined()
    expect(validerChampContact("email", "jean@domaine")).toBeDefined()
    expect(validerChampContact("email", "jean@domaine.mg")).toBeUndefined()
  })

  it("refuse un numéro de téléphone impossible", () => {
    expect(validerChampContact("telephone", "abc")).toBeDefined()
    expect(validerChampContact("telephone", "00000")).toBeDefined()
  })

  it("accepte un numéro malgache valide", () => {
    expect(validerChampContact("telephone", "+261 34 22 330 54")).toBeUndefined()
  })

  it("accepte un sujet facultatif et valide les sujets renseignés", () => {
    expect(validerChampContact("sujet", "")).toBeUndefined()
    expect(validerChampContact("sujet", "ab")).toBeDefined()
    expect(validerChampContact("sujet", "abc")).toBeUndefined()
  })

  it("exige un message d'au moins 10 caractères et au plus 2000", () => {
    expect(validerChampContact("message", "court")).toBeDefined()
    expect(validerChampContact("message", "abcdefghij")).toBeUndefined()
    expect(validerChampContact("message", "x".repeat(2001))).toBeDefined()
  })

  it("ignore les espaces de début et de fin", () => {
    expect(validerChampContact("nom", "   J   ")).toBeDefined()
    expect(validerChampContact("nom", "   Jean   ")).toBeUndefined()
  })
})

describe("filtrerSaisie (pendant la frappe)", () => {
  it("retire les chiffres et symboles interdits du nom", () => {
    expect(filtrerSaisie("nom", "Jean2 Rak@oto")).toBe("Jean Rakoto")
    expect(filtrerSaisie("nom", "Marie-Claire d'Ark")).toBe("Marie-Claire d'Ark")
  })
  it("ne garde qu'un + en tête pour le téléphone", () => {
    expect(filtrerSaisie("telephone", "+261 34 22 330 54")).toBe("+261 34 22 330 54")
    expect(filtrerSaisie("telephone", "34+22abc")).toBe("3422")
    expect(filtrerSaisie("telephone", "+26+1")).toBe("+261")
  })
  it("retire les espaces de l'e-mail et les chevrons du sujet et du message", () => {
    expect(filtrerSaisie("email", " jean @mail.mg ")).toBe("jean@mail.mg")
    expect(filtrerSaisie("sujet", "<b>Sujet</b>")).toBe("bSujet/b")
  })
})

describe("règles de contenu", () => {
  it("refuse les balises HTML", () => {
    expect(validerChampContact("message", "Bonjour <img src=x> à tous")).toBeDefined()
  })
  it("refuse une répétition abusive ou un texte sans lettres", () => {
    expect(validerChampContact("message", "aaaaaaaaaaaa bonjour")).toBeDefined()
    expect(validerChampContact("sujet", "!!!!!")).toBeDefined()
  })
  it("accepte un texte réel", () => {
    expect(validerChampContact("sujet", "Demande de partenariat")).toBeUndefined()
  })
})
