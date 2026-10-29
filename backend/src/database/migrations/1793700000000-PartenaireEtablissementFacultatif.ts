import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Les partenaires créés par la Présidence n'appartiennent à aucun établissement. */
export class PartenaireEtablissementFacultatif1793700000000 implements MigrationInterface {
  name = 'PartenaireEtablissementFacultatif1793700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Partenaire" ALTER COLUMN "etablissement_id" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Réaffecter les partenaires de la Présidence avant d'annuler cette migration.
    await queryRunner.query(
      `ALTER TABLE "Partenaire" ALTER COLUMN "etablissement_id" SET NOT NULL`,
    );
  }
}
