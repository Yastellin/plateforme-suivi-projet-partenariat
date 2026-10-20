import type { MigrationInterface, QueryRunner } from 'typeorm';

// Table des messages du formulaire de contact public.
// etablissement_id NULL = destine a la Presidence.
export class CreateMessageContact1791400000000 implements MigrationInterface {
  name = 'CreateMessageContact1791400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "MessageContact" (
        "id" text NOT NULL,
        "nom" character varying(100) NOT NULL,
        "email" character varying(254) NOT NULL,
        "telephone" character varying(30),
        "sujet" character varying(200) NOT NULL,
        "message" text NOT NULL,
        "etablissement_id" text,
        "est_lu" boolean NOT NULL DEFAULT false,
        "date_lecture" TIMESTAMP(3),
        "date_creation" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "PK_message_contact_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_message_contact_etablissement" FOREIGN KEY ("etablissement_id")
          REFERENCES "Etablissement"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_message_contact_etablissement" ON "MessageContact" ("etablissement_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_message_contact_est_lu" ON "MessageContact" ("est_lu")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_message_contact_date_creation" ON "MessageContact" ("date_creation")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_message_contact_date_creation"`);
    await queryRunner.query(`DROP INDEX "IDX_message_contact_est_lu"`);
    await queryRunner.query(`DROP INDEX "IDX_message_contact_etablissement"`);
    await queryRunner.query(`DROP TABLE "MessageContact"`);
  }
}
