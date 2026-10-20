import type { MigrationInterface, QueryRunner } from 'typeorm';

// Ajoute le type de notification MESSAGE_CONTACT (notifications des messages
// recus via le formulaire de contact public).
export class NotificationMessageContact1791500000000 implements MigrationInterface {
  name = 'NotificationMessageContact1791500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."TypeNotification" ADD VALUE IF NOT EXISTS 'MESSAGE_CONTACT'`,
    );
  }

  // PostgreSQL ne sait pas retirer une valeur d'enum : la version inverse
  // recrée le type sans MESSAGE_CONTACT (les notifications concernées sont supprimées).
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "Notification" WHERE "type" = 'MESSAGE_CONTACT'`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."TypeNotification" RENAME TO "TypeNotification_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."TypeNotification" AS ENUM('PROJET_SOUMIS', 'PARTENARIAT_SOUMIS', 'EXPIRATION_CONVENTION', 'CONVENTION_EXPIREE', 'ACTIVITE_ECHEANCE', 'ACTIVITE_RETARD', 'PROJET_RETARD', 'DOCUMENT_AJOUTE', 'DOCUMENT_MODIFIE', 'CHANGEMENT_STATUT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "public"."TypeNotification" USING "type"::text::"public"."TypeNotification"`,
    );
    await queryRunner.query(`DROP TYPE "public"."TypeNotification_old"`);
  }
}
