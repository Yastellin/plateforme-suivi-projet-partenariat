import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Stocke les exports réussis de l'espace Présidence, sans altérer les tables métier. */
export class CreateExportHistorique1793900000000 implements MigrationInterface {
  name = 'CreateExportHistorique1793900000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "ExportHistorique" (
        "id" text NOT NULL,
        "utilisateur_id" text,
        "date_creation" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "portee" character varying NOT NULL,
        "filtres" jsonb NOT NULL,
        "format" character varying NOT NULL,
        "nombre_lignes" integer NOT NULL,
        CONSTRAINT "PK_ExportHistorique_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ExportHistorique_utilisateur"
          FOREIGN KEY ("utilisateur_id") REFERENCES "Utilisateur"("id")
          ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "CHK_ExportHistorique_nombre_lignes"
          CHECK ("nombre_lignes" >= 0)
      )
    `);
    await queryRunner.query(
      'CREATE INDEX "IDX_ExportHistorique_date_creation" ON "ExportHistorique" ("date_creation")',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_ExportHistorique_utilisateur_id" ON "ExportHistorique" ("utilisateur_id")',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "IDX_ExportHistorique_utilisateur_id"');
    await queryRunner.query('DROP INDEX "IDX_ExportHistorique_date_creation"');
    await queryRunner.query('DROP TABLE "ExportHistorique"');
  }
}
