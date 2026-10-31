import { describe, expect, it } from "vitest";
import {
  creerLienDocuments,
  creerLienFicheDocument,
  lireCibleDocuments,
} from "../src/features/documents/lib/cible-documents";

describe("cibles des documents", () => {
  it.each([
    ["projet", "projet_id", "projet-1", "/presidence/projets/projet-1"],
    ["convention", "convention_id", "convention-2", "/decideur/conventions/convention-2"],
    ["partenariat", "partenariat_id", "partenariat-3", "/presidence/partenaires-partenariats/partenariats/partenariat-3"],
  ] as const)("construit un lien filtré pour %s", (entite, parametre, id, cheminFiche) => {
    const lien = creerLienDocuments("/presidence", entite, id);
    const url = new URL(lien, "https://exemple.test");

    expect(url.pathname).toBe("/presidence/documents");
    expect(url.searchParams.get(parametre)).toBe(id);

    const cible = lireCibleDocuments(url.searchParams);
    expect(cible?.entite).toBe(entite);
    expect(cible && creerLienFicheDocument(entite === "convention" ? "/decideur" : "/presidence", cible)).toBe(cheminFiche);
  });

  it("reconnaît aussi l'ancien paramètre projet de la fiche projet", () => {
    const cible = lireCibleDocuments(new URLSearchParams("projet=ancien-projet"));

    expect(cible).toMatchObject({
      entite: "projet",
      id: "ancien-projet",
      parametre: "projet_id",
    });
  });

  it("encode les identifiants dans le filtre et le lien de retour", () => {
    const lien = creerLienDocuments("/decideur", "projet", "id avec espace");
    const cible = lireCibleDocuments(new URL(lien, "https://exemple.test").searchParams);

    expect(lien).toContain("projet_id=id+avec+espace");
    expect(cible && creerLienFicheDocument("/decideur", cible)).toBe(
      "/decideur/projets/id%20avec%20espace",
    );
  });
});
