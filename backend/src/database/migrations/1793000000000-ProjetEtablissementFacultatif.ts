// backend/src/database/migrations/1793000000000-ProjetEtablissementFacultatif.ts
import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * L'etablissement porteur d'un projet devient facultatif.
 *
 * Un projet n'est pas toujours rattache a un etablissement : certains projets
 * sont transversaux ou gere directement par la Presidence.
 *
 * - "etablissement_id" passe de NOT NULL a nullable (le type de colonne est
 *   conserve tel quel : "text" herite de la base existante).
 * - L'index existant sur "etablissement_id" accepte les valeurs NULL.
 */
export class ProjetEtablissementFacultatif1793000000000
  implements MigrationInterface
{
  name = 'ProjetEtablissementFacultatif1793000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Projet" ALTER COLUMN "etablissement_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Restaure la contrainte NOT NULL. L'operation echouera tant que des
    // projets sans etablissement existent : les reaffecter avant de revert,
    // afin de ne jamais supprimer de donnees.
    await queryRunner.query(
      `ALTER TABLE "Projet" ALTER COLUMN "etablissement_id" SET NOT NULL`,
    );
  }
}
