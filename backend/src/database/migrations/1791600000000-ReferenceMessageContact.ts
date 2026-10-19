import { MigrationInterface, QueryRunner } from 'typeorm';

// Ajoute une référence lisible et unique à chaque message de contact.
// Les messages existants reçoivent une référence dérivée de leur identifiant.
export class ReferenceMessageContact1791600000000 implements MigrationInterface {
  name = 'ReferenceMessageContact1791600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "MessageContact" ADD COLUMN "reference" character varying(20)`,
    );
    await queryRunner.query(
      `UPDATE "MessageContact" SET "reference" = 'MC-' || upper(substr(md5("id"::text), 1, 8)) WHERE "reference" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "MessageContact" ALTER COLUMN "reference" SET NOT NULL`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_message_contact_reference" ON "MessageContact" ("reference")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_message_contact_reference"`);
    await queryRunner.query(
      `ALTER TABLE "MessageContact" DROP COLUMN "reference"`,
    );
  }
}
