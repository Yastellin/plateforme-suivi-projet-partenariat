// backend/src/database/migrations/1791965000000-AddTypePorteurToPorteur.ts
import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Porteur polymorphe (cahier des charges 5.8).
 *
 * - "TypePorteur" : PERSONNE / ETABLISSEMENT / AUTRE.
 * - "type_porteur" : discrimine la nature du porteur (defaut PERSONNE).
 * - "etablissement_id" : FK vers "Etablissement" (type text, comme la cle
 *   primaire "Etablissement"."id") ; SET NULL si l'etablissement est supprime.
 * - "nom" devient nullable : un porteur de type ETABLISSEMENT n'a pas de nom
 *   libre (il est represente par l'etablissement rattache).
 * - "institution_rattachement" est deja present et nullable : on le reutilise
 *   tel quel (pas de renommage, pas de doublon).
 *
 * Migration de donnees : les porteurs existants passent en PERSONNE (leur
 * "nom" existant est conserve) ; ceux qui auraient deja un etablissement_id
 * non nul passeraient en ETABLISSEMENT.
 */
export class AddTypePorteurToPorteur1791965000000 implements MigrationInterface {
  name = 'AddTypePorteurToPorteur1791965000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."TypePorteur" AS ENUM('PERSONNE', 'ETABLISSEMENT', 'AUTRE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Porteur" ADD "type_porteur" "public"."TypePorteur" NOT NULL DEFAULT 'PERSONNE'`,
    );
    await queryRunner.query(`ALTER TABLE "Porteur" ADD "etablissement_id" text`);
    await queryRunner.query(`ALTER TABLE "Porteur" ALTER COLUMN "nom" DROP NOT NULL`);
    await queryRunner.query(
      `CREATE INDEX "IDX_porteur_etablissement_id" ON "Porteur" ("etablissement_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "Porteur" ADD CONSTRAINT "FK_porteur_etablissement" FOREIGN KEY ("etablissement_id") REFERENCES "Etablissement"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Migration de donnees : rattaches -> ETABLISSEMENT, sinon PERSONNE (nom conserve).
    await queryRunner.query(
      `UPDATE "Porteur" SET "type_porteur" = 'ETABLISSEMENT' WHERE "etablissement_id" IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "Porteur" SET "type_porteur" = 'PERSONNE' WHERE "etablissement_id" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Porteur" DROP CONSTRAINT "FK_porteur_etablissement"`);
    await queryRunner.query(`DROP INDEX "IDX_porteur_etablissement_id"`);
    // Restaure NOT NULL sur "nom" (les porteurs ETABLISSEMENT ont un nom nul).
    await queryRunner.query(
      `UPDATE "Porteur" SET "nom" = COALESCE("nom", 'Porteur sans nom') WHERE "nom" IS NULL`,
    );
    await queryRunner.query(`ALTER TABLE "Porteur" ALTER COLUMN "nom" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "Porteur" DROP COLUMN "etablissement_id"`);
    await queryRunner.query(`ALTER TABLE "Porteur" DROP COLUMN "type_porteur"`);
    await queryRunner.query(`DROP TYPE "public"."TypePorteur"`);
  }
}
