import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renforce les invariants introduits par les migrations de rattachement et de
 * publication sans modifier ces migrations déjà susceptibles d'être appliquées.
 */
export class EnforceDocumentParentAndBackfillPublication1793400000000 implements MigrationInterface {
  name = 'EnforceDocumentParentAndBackfillPublication1793400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const documentsInvalides: Array<{ id: string }> = await queryRunner.query(`
      SELECT id
      FROM "Document"
      WHERE
        (CASE WHEN "projet_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "convention_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "cotutelle_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "partenariat_id" IS NULL THEN 0 ELSE 1 END) <> 1
      LIMIT 10
    `);
    if (documentsInvalides.length > 0) {
      throw new Error(
        `Migration impossible : chaque document doit avoir exactement un parent. Documents à corriger : ${documentsInvalides
          .map((document) => document.id)
          .join(', ')}`,
      );
    }

    await queryRunner.query(`
      ALTER TABLE "Document" ADD CONSTRAINT "ck_document_un_parent"
      CHECK (
        (CASE WHEN "projet_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "convention_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "cotutelle_id" IS NULL THEN 0 ELSE 1 END) +
        (CASE WHEN "partenariat_id" IS NULL THEN 0 ELSE 1 END) = 1
      )
    `);

    // Les contenus déjà publics avant l'introduction du workflow restent
    // visibles. Les brouillons et éléments « en attente » ne sont pas publiés.
    await queryRunner.query(`
      UPDATE "Partenaire" SET "publie_le" = "updated_at"
      WHERE "publie_le" IS NULL
        AND "visibilite" = 'PUBLIC'
        AND "archive" = false
    `);
    await queryRunner.query(`
      UPDATE "Projet" SET "publie_le" = "updated_at"
      WHERE "publie_le" IS NULL
        AND "statut" IN ('EN_COURS', 'SUSPENDU', 'TERMINE')
        AND "archive" = false
    `);
    await queryRunner.query(`
      UPDATE "Partenariat" SET "publie_le" = "updated_at"
      WHERE "publie_le" IS NULL
        AND "statut" IN ('EN_COURS', 'SUSPENDU', 'TERMINE')
        AND "archive" = false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Document" DROP CONSTRAINT "ck_document_un_parent"`,
    );
    // Les dates de publication rétroalimentées ne sont pas effacées : il est
    // impossible de les distinguer sans ambiguïté des publications réelles.
  }
}
