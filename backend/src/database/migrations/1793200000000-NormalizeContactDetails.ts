import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Normalise les e-mails et téléphones dans une table commune. La contrainte
 * unique porte ainsi sur toutes les personnes et tous les partenaires, tout en
 * permettant à chaque propriétaire de posséder plusieurs coordonnées.
 */
export class NormalizeContactDetails1793200000000 implements MigrationInterface {
  name = 'NormalizeContactDetails1793200000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."TypeCoordonnee" AS ENUM('EMAIL', 'TELEPHONE')`,
    );
    await queryRunner.query(`
      CREATE TABLE "Coordonnee" (
        "id" uuid NOT NULL,
        "type" "public"."TypeCoordonnee" NOT NULL,
        "valeur" character varying NOT NULL,
        "valeur_normalisee" character varying NOT NULL,
        "partenaire_id" text,
        "contact_id" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_coordonnee" PRIMARY KEY ("id"),
        CONSTRAINT "uq_coordonnee_type_valeur" UNIQUE ("type", "valeur_normalisee"),
        CONSTRAINT "ck_coordonnee_un_proprietaire" CHECK (
          ("partenaire_id" IS NOT NULL AND "contact_id" IS NULL)
          OR ("partenaire_id" IS NULL AND "contact_id" IS NOT NULL)
        ),
        CONSTRAINT "fk_coordonnee_partenaire" FOREIGN KEY ("partenaire_id") REFERENCES "Partenaire"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_coordonnee_contact" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_coordonnee_partenaire" ON "Coordonnee" ("partenaire_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_coordonnee_contact" ON "Coordonnee" ("contact_id")`,
    );

    await queryRunner.query(`
      INSERT INTO "Coordonnee" ("id", "type", "valeur", "valeur_normalisee", "partenaire_id")
      SELECT gen_random_uuid(), 'EMAIL', "email", lower(trim("email")), "id"
      FROM "Partenaire" WHERE NULLIF(trim("email"), '') IS NOT NULL
    `);
    await queryRunner.query(`
      INSERT INTO "Coordonnee" ("id", "type", "valeur", "valeur_normalisee", "contact_id")
      SELECT gen_random_uuid(), 'EMAIL', "email", lower(trim("email")), "id"
      FROM "Contact" WHERE NULLIF(trim("email"), '') IS NOT NULL
    `);

    const normaliserTelephoneSql = (colonne: string) => `
      CASE
        WHEN trim(${colonne}) LIKE '00%'
          THEN '+' || regexp_replace(substring(trim(${colonne}) from 3), '[^0-9]', '', 'g')
        WHEN regexp_replace(trim(${colonne}), '[^0-9]', '', 'g') ~ '^0[0-9]{9}$'
          THEN '+261' || substring(regexp_replace(trim(${colonne}), '[^0-9]', '', 'g') from 2)
        WHEN regexp_replace(trim(${colonne}), '[^0-9]', '', 'g') ~ '^261[0-9]+$'
          THEN '+' || regexp_replace(trim(${colonne}), '[^0-9]', '', 'g')
        WHEN trim(${colonne}) LIKE '+%'
          THEN '+' || regexp_replace(trim(${colonne}), '[^0-9]', '', 'g')
        ELSE regexp_replace(trim(${colonne}), '[^0-9]', '', 'g')
      END`;

    await queryRunner.query(`
      INSERT INTO "Coordonnee" ("id", "type", "valeur", "valeur_normalisee", "partenaire_id")
      SELECT gen_random_uuid(), 'TELEPHONE', "telephone", ${normaliserTelephoneSql('"telephone"')}, "id"
      FROM "Partenaire" WHERE NULLIF(trim("telephone"), '') IS NOT NULL
    `);
    await queryRunner.query(`
      INSERT INTO "Coordonnee" ("id", "type", "valeur", "valeur_normalisee", "contact_id")
      SELECT gen_random_uuid(), 'TELEPHONE', "telephone", ${normaliserTelephoneSql('"telephone"')}, "id"
      FROM "Contact" WHERE NULLIF(trim("telephone"), '') IS NOT NULL
    `);

    // Protection complémentaire contre les doublons de fiches partenaires.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "uq_partenaire_identite_active"
      ON "Partenaire" (COALESCE("etablissement_id", ''), lower(trim("nom")), lower(trim("pays")))
      WHERE "archive" = false
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "uq_partenaire_identite_active"`);
    await queryRunner.query(`DROP TABLE "Coordonnee"`);
    await queryRunner.query(`DROP TYPE "public"."TypeCoordonnee"`);
  }
}
