import type { MigrationInterface, QueryRunner } from 'typeorm';

/** Logo propre au compte décideur, affiché en pied de barre latérale. */
export class AddLogoUtilisateur1794000000000 implements MigrationInterface {
  name = 'AddLogoUtilisateur1794000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "Utilisateur" ADD COLUMN IF NOT EXISTS "logo_url" character varying',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "Utilisateur" DROP COLUMN IF EXISTS "logo_url"');
  }
}
