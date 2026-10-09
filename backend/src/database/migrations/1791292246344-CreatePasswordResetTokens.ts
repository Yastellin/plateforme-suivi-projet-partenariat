import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordResetTokens1791292246344
  implements MigrationInterface
{
  name = 'CreatePasswordResetTokens1791292246344';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "password_reset_tokens" (
        "id" text NOT NULL,
        "token_hash" character varying(64) NOT NULL,
        "utilisateur_id" text NOT NULL,
        "expire_le" TIMESTAMP WITH TIME ZONE NOT NULL,
        "utilise_le" TIMESTAMP WITH TIME ZONE,
        "cree_le" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_password_reset_tokens" PRIMARY KEY ("id"),
        CONSTRAINT "fk_prt_utilisateur" FOREIGN KEY ("utilisateur_id")
          REFERENCES "Utilisateur"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_prt_token_hash" ON "password_reset_tokens" ("token_hash")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_prt_utilisateur" ON "password_reset_tokens" ("utilisateur_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_prt_utilisateur"`);
    await queryRunner.query(`DROP INDEX "idx_prt_token_hash"`);
    await queryRunner.query(`DROP TABLE "password_reset_tokens"`);
  }
}