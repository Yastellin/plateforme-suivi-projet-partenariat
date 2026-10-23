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
});
