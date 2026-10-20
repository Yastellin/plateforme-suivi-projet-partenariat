import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Piste de soumission / publication pour les projets, partenariats
 * et partenaires : soumis_le (envoye a la presidence) et publie_le
 * (valide et rendu public par la presidence).
 */
export class AddSoumissionPublication1792000000002
  implements MigrationInterface
{
  name = 'AddSoumissionPublication1792000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['Projet', 'Partenariat', 'Partenaire']) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD "soumis_le" TIMESTAMP WITH TIME ZONE`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD "publie_le" TIMESTAMP WITH TIME ZONE`,
      );
      await queryRunner.query(
        `CREATE INDEX "idx_${table.toLowerCase()}_soumis_le" ON "${table}" ("soumis_le")`,
      );
      await queryRunner.query(
        `CREATE INDEX "idx_${table.toLowerCase()}_publie_le" ON "${table}" ("publie_le")`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['Projet', 'Partenariat', 'Partenaire']) {
      await queryRunner.query(
        `DROP INDEX "idx_${table.toLowerCase()}_publie_le"`,
      );
      await queryRunner.query(
        `DROP INDEX "idx_${table.toLowerCase()}_soumis_le"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP "publie_le"`,
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP "soumis_le"`,
      );
    }
  }
}
