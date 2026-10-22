import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserPreferences1793300000000 implements MigrationInterface {
  name = 'AddUserPreferences1793300000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Utilisateur" ADD "preferences" jsonb NOT NULL DEFAULT '{}'::jsonb`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Utilisateur" DROP COLUMN "preferences"`);
  }
}
