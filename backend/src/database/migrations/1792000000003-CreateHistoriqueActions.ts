import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Piste d'audit : chaque action marquante (creation, modification,
 * soumission, publication, archivage, restauration, suppression)
 * est enregistree avec l'auteur, l'entite concernee et la date.
 */
export class CreateHistoriqueActions1792000000003
  implements MigrationInterface
{
  name = 'CreateHistoriqueActions1792000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "action_historique" AS ENUM (
        'CREATION',
        'MODIFICATION',
        'SOUMISSION',
        'PUBLICATION',
        'ARCHIVAGE',
        'RESTAURATION',
        'SUPPRESSION'
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "HistoriqueAction" (
        "id" text NOT NULL,
        "utilisateur_id" text,
        "utilisateur_nom" character varying,
        "utilisateur_role" character varying,
        "action" "action_historique" NOT NULL,
        "entite_type" character varying NOT NULL,
        "entite_id" text,
        "entite_nom" character varying,
        "details" text,
        "date_creation" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "pk_historique_action" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_historique_entite" ON "HistoriqueAction" ("entite_type", "entite_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_historique_utilisateur" ON "HistoriqueAction" ("utilisateur_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_historique_action" ON "HistoriqueAction" ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_historique_date" ON "HistoriqueAction" ("date_creation")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_historique_date"`);
    await queryRunner.query(`DROP INDEX "idx_historique_action"`);
    await queryRunner.query(
      `DROP INDEX "idx_historique_utilisateur"`,
    );
    await queryRunner.query(`DROP INDEX "idx_historique_entite"`);
    await queryRunner.query(`DROP TABLE "HistoriqueAction"`);
    await queryRunner.query(`DROP TYPE "action_historique"`);
  }
}
