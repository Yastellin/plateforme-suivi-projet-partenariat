import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Distingue les données propres à la Présidence des brouillons d'établissement. */
export class AddCreationProvenance1793100000000 implements MigrationInterface {
  name = 'AddCreationProvenance1793100000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['Projet', 'Partenaire', 'Partenariat']) {
      await queryRunner.query(`ALTER TABLE "${table}" ADD "cree_par_utilisateur_id" text`);
      await queryRunner.query(`ALTER TABLE "${table}" ADD "cree_par_role" character varying`);
      await queryRunner.query(`CREATE INDEX "idx_${table.toLowerCase()}_cree_par_role" ON "${table}" ("cree_par_role")`);
      // Les données antérieures au workflow étaient déjà administrées par la
      // Présidence. Ce backfill évite de les rendre impossibles à publier.
      await queryRunner.query(`UPDATE "${table}" SET "cree_par_role" = 'PRESIDENCE' WHERE "cree_par_role" IS NULL`);
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of ['Projet', 'Partenaire', 'Partenariat']) {
      await queryRunner.query(`DROP INDEX "idx_${table.toLowerCase()}_cree_par_role"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "cree_par_role"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "cree_par_utilisateur_id"`);
    }
  }
}
