import type { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationWorkflowTypes1793100000001 implements MigrationInterface {
  name = 'NotificationWorkflowTypes1793100000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const valeur of [
      'PARTENAIRE_SOUMIS',
      'PROJET_PUBLIE',
      'PARTENARIAT_PUBLIE',
      'PARTENAIRE_PUBLIE',
    ]) {
      await queryRunner.query(
        `ALTER TYPE "public"."TypeNotification" ADD VALUE IF NOT EXISTS '${valeur}'`,
      );
    }
  }

  // PostgreSQL ne permet pas de supprimer une valeur d'enum de façon sûre.
  async down(): Promise<void> {}
}
