import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Un document peut etre rattache a un projet, une convention,
 * une cotutelle ou un partenariat (au plus un parent a la fois).
 */
export class AddDocumentCotutellePartenariat1792000000001
  implements MigrationInterface
{
  name = 'AddDocumentCotutellePartenariat1792000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Document" ADD "cotutelle_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "Document" ADD "partenariat_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "Document" ADD CONSTRAINT "fk_document_cotutelle" FOREIGN KEY ("cotutelle_id") REFERENCES "CotutelleThese"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "Document" ADD CONSTRAINT "fk_document_partenariat" FOREIGN KEY ("partenariat_id") REFERENCES "Partenariat"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_document_cotutelle" ON "Document" ("cotutelle_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_document_partenariat" ON "Document" ("partenariat_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_document_partenariat"`);
    await queryRunner.query(`DROP INDEX "idx_document_cotutelle"`);
    await queryRunner.query(
      `ALTER TABLE "Document" DROP CONSTRAINT "fk_document_partenariat"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Document" DROP CONSTRAINT "fk_document_cotutelle"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Document" DROP "partenariat_id"`,
    );
    await queryRunner.query(`ALTER TABLE "Document" DROP "cotutelle_id"`);
  }
}
