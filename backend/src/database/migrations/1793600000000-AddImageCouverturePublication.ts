import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Ajoute l'URL de couverture éditoriale des publications. */
export class AddImageCouverturePublication1793600000000 implements MigrationInterface {
  name = 'AddImageCouverturePublication1793600000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "Publication" ADD "image_couverture_url" character varying',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "Publication" DROP COLUMN "image_couverture_url"',
    );
  }
}
