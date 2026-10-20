import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Table de configuration (singleton) : stocke le logo de la Presidence
 * et d'autres parametres globaux de la plateforme.
 */
export class CreateConfiguration1792000000004 implements MigrationInterface {
  name = 'CreateConfiguration1792000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "Configuration" (
        "id" uuid NOT NULL,
        "cle" character varying NOT NULL,
        "valeur" text,
        "logo_url" character varying,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "UQ_configuration_cle" UNIQUE ("cle"),
        CONSTRAINT "PK_configuration" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "Configuration"`);
  }
}
