import { describe, expect, it } from "vitest";
import {
  creerLienFicheDocument,
  lireCibleDocuments,
} from "../src/features/documents/lib/cible-documents";

describe("cibles des documents", () => {
  it.each([
    ["projet_id", "projet-1", "projet", "/presidence/projets/projet-1"],
    ["convention_id", "convention-2", "convention", "/presidence/conventions/convention-2"],
    ["partenariat_id", "partenariat-3", "partenariat", "/presidence/partenaires-partenariats/partenariats/partenariat-3"],
  ] as const)("reconnaît le filtre %s et le lien de retour", (parametre, id, entite, cheminFiche) => {
    const cible = lireCibleDocuments(new URLSearchParams({ [parametre]: id }));

    expect(cible?.entite).toBe(entite);
    expect(cible && creerLienFicheDocument("/presidence", cible)).toBe(cheminFiche);
  });

  it("reconnaît aussi l'ancien paramètre projet de la fiche projet", () => {
    const cible = lireCibleDocuments(new URLSearchParams("projet=ancien-projet"));

    expect(cible).toMatchObject({
      entite: "projet",
      id: "ancien-projet",
      parametre: "projet_id",
    });
  });

  it("encode l'identifiant du lien de retour", () => {
    const cible = lireCibleDocuments(new URLSearchParams("projet_id=id+avec+espace"));

    expect(cible && creerLienFicheDocument("/decideur", cible)).toBe(
      "/decideur/projets/id%20avec%20espace",
    );
  });
});
