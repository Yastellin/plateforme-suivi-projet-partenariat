import { describe, expect, it } from "vitest";

import { construireNavigation } from "@/components/layout/navigation-interne";
import type { RoleUtilisateur } from "@/types/api";

function cheminsPour(role: RoleUtilisateur, base: string): string[] {
  return construireNavigation(role, base).flatMap((groupe) =>
    groupe.items.flatMap((item) => [
      item.chemin,
      ...(item.enfants?.map((sousItem) => sousItem.chemin) ?? []),
    ]),
  );
}

describe("navigation interne", () => {
  it.each([
    ["PRESIDENCE", "/presidence"],
    ["DECIDEUR", "/decideur"],
  ] as const)(
    "rend l'historique et les archives accessibles au rôle %s",
    (role, base) => {
      const chemins = cheminsPour(role, base);
      expect(chemins).toContain(`${base}/historique`);
      expect(chemins).toContain(`${base}/archives`);
    },
  );

  it("rend les archives et son historique accessibles à l'établissement", () => {
    const chemins = cheminsPour("ETABLISSEMENT", "/etablissement");
    expect(chemins).toContain("/etablissement/archives");
    expect(chemins).toContain("/etablissement/historique");
  });

  it.each([
    ["PRESIDENCE", "/presidence", "Partenaires", "Partenariats"],
    ["DECIDEUR", "/decideur", "Partenaires", "Partenariats"],
    ["ETABLISSEMENT", "/etablissement", "Mes partenaires", "Mes partenariats"],
  ] as const)(
    "expose partenaires et partenariats comme deux liens directs pour %s",
    (role, base, libellePartenaire, libellePartenariat) => {
      const items = construireNavigation(role, base).flatMap(
        (groupe) => groupe.items,
      );
      const partenaires = items.find((item) => item.cle === "partenaires");
      const partenariats = items.find((item) => item.cle === "partenariats");

      expect(partenaires).toMatchObject({
        libelle: libellePartenaire,
        chemin: `${base}/partenaires-partenariats/partenaires`,
      });
      expect(partenariats).toMatchObject({
        libelle: libellePartenariat,
        chemin: `${base}/partenaires-partenariats/partenariats`,
      });
      expect(partenaires?.enfants).toBeUndefined();
      expect(partenariats?.enfants).toBeUndefined();
    },
  );
});
