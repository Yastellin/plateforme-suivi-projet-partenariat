import { describe, expect, it } from "vitest"
import {
  VALEURS_CONTACT_VIDES,
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
  etablissement_id: "",
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
    expect(Object.keys(erreurs).sort()).toEqual(["email", "message", "nom", "sujet"])
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

  it("exige un sujet d'au moins 3 caractères", () => {
    expect(validerChampContact("sujet", "ab")).toBeDefined()
    expect(validerChampContact("sujet", "abc")).toBeUndefined()
  })

  it("exige un message d'au moins 10 caractères et au plus 2000", () => {
    expect(validerChampContact("message", "court")).toBeDefined()
    expect(validerChampContact("message", "x".repeat(10))).toBeUndefined()
    expect(validerChampContact("message", "x".repeat(2001))).toBeDefined()
  })

  it("ignore les espaces de début et de fin", () => {
    expect(validerChampContact("nom", "   J   ")).toBeDefined()
    expect(validerChampContact("nom", "   Jean   ")).toBeUndefined()
  })
})
