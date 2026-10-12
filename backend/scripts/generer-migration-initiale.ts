/**
 * Generateur de la migration initiale.
 *
 * Ce script demarre un PostgreSQL en memoire (PGlite, PostgreSQL compilé en WASM),
 * laisse TypeORM construire le schema a partir des entites (synchronize),
 * capture le DDL reellement execute, puis ecrit la migration
 * src/database/migrations/1791200000000-InitSchema.ts.
 *
 * Usage : npx ts-node scripts/generer-migration-initiale.ts [--verifier]
 *
 * --verifier compare le schema genere avec celui de la base historique
 * (prisma/migrations/*_init/migration.sql) et affiche les ecarts.
 */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { DataSource, type Logger } from 'typeorm';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const PORT = 5542;
const FICHIER_MIGRATION = join(
  __dirname,
  '..',
  'src',
  'database',
  'migrations',
  '1791200000000-InitSchema.ts',
);

class LoggerCapture implements Logger {
  readonly requetes: string[] = [];
  logQuery(query: string): void {
    this.requetes.push(query);
  }
  logQueryError(): void {}
  logQuerySlow(): void {}
  logSchemaBuild(): void {}
  logMigration(): void {}
  log(): void {}
}

async function demarrerBase(port: number) {
  const db = await PGlite.create();
  const serveur = new PGLiteSocketServer({ db, port, host: '127.0.0.1' });
  await serveur.start();
  return { db, serveur };
}

/** Genere le DDL Postgres a partir des entites TypeORM. */
async function genererDdl(): Promise<string[]> {
  const { db, serveur } = await demarrerBase(PORT);
  const logger = new LoggerCapture();
  const ds = new DataSource({
    type: 'postgres',
    host: '127.0.0.1',
    port: PORT,
    username: 'postgres',
    password: 'postgres',
    database: 'postgres',
    entities: [join(__dirname, '..', 'src', '**', '*.entity.ts')],
    synchronize: true,
    logging: ['query', 'schema'],
    logger,
  });

  await ds.initialize();
  await ds.destroy();
  await serveur.stop();
  await db.close();

  return logger.requetes.filter((q) =>
    /^\s*(CREATE|ALTER|DROP|COMMENT)/i.test(q),
  );
}

/** Tables crees par une migration deja presente dans le depot. */
const TABLES_HORS_MIGRATION_INITIALE = ['password_reset_tokens'];

function estConcerneParTableExclue(instruction: string): boolean {
  return TABLES_HORS_MIGRATION_INITIALE.some((t) =>
    instruction.includes(`"${t}"`),
  );
}

async function ecrireMigration(ddl: string[]): Promise<void> {
  const instructions = ddl.filter((i) => !estConcerneParTableExclue(i));

  // Tables creees (pour la methode down)
  const tables = instructions
    .map((i) => /^CREATE TABLE "([^"]+)"/.exec(i)?.[1])
    .filter((t): t is string => Boolean(t));

  // Types enum creats
  const enums = instructions
    .map((i) => /^CREATE TYPE "([^"]+)"\."([^"]+)"/.exec(i)?.[2])
    .filter((t): t is string => Boolean(t));

  const corpsUp = instructions
    .map((i) => `    await queryRunner.query(\`\n      ${i.trim()}\n    \`);`)
    .join('\n');

  const corpsDown =
    [...tables]
      .reverse()
      .map(
        (t) =>
          `    await queryRunner.query(\`DROP TABLE IF EXISTS "${t}" CASCADE\`);`,
      )
      .join('\n') +
    '\n' +
    enums
      .map(
        (e) =>
          `    await queryRunner.query(\`DROP TYPE IF EXISTS "public"."${e}" CASCADE\`);`,
      )
      .join('\n');

  const contenu = `import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Schema initial de la plateforme (migration Prisma -> TypeORM).
 *
 * DDL genere automatiquement a partir des entites TypeORM, puis verifie
 * contre le schema Prisma historique (scripts/generer-migration-initiale.ts).
 * Ne pas modifier a la main : regenerer avec
 *   npx ts-node scripts/generer-migration-initiale.ts
 *
 * Les bases creees avant la bascule TypeORM possedent deja ces tables :
 * la migration ne fait rien si la table "Utilisateur" existe.
 */
export class InitSchema1791200000000 implements MigrationInterface {
  name = 'InitSchema1791200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Base initialisee par l'ancien outil de migration : rien a faire.
    if (await queryRunner.hasTable('Utilisateur')) {
      return;
    }

${corpsUp}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
${corpsDown}
  }
}
`;

  writeFileSync(FICHIER_MIGRATION, contenu, 'utf8');
  console.log(
    `Migration ecrite : ${FICHIER_MIGRATION} (${instructions.length} instructions, ${tables.length} tables, ${enums.length} enums)`,
  );
}

const TABLES_HORS_MIGRATION = ['password_reset_tokens'];

/** Compare le schema genere aux tables historiques (hors tables exclues). */
async function verifierParite(ddl: string[]): Promise<void> {
  console.log('Verification de parite avec le schema Prisma historique...');

  const instructions = ddl.filter((i) => !estConcerneParTableExclue(i));
  const { db: dbTypeorm, serveur: srvTypeorm } = await demarrerBase(PORT + 1);
  for (const i of instructions) {
    await dbTypeorm.exec(`${i};`);
  }
  await srvTypeorm.stop();

  const { db: dbPrisma, serveur: srvPrisma } = await demarrerBase(PORT + 2);
  const fichierSql = join(
    __dirname,
    '..',
    'prisma',
    'migrations',
    '20261002082033_init',
    'migration.sql',
  );
  if (!existsSync(fichierSql)) {
    console.log('SQL Prisma introuvable : verification ignoree.');
    await srvPrisma.stop();
    await dbPrisma.close();
    await dbTypeorm.close();
    return;
  }
  await dbPrisma.exec(readFileSync(fichierSql, 'utf8'));
  await srvPrisma.stop();

  interface Ligne {
    table: string;
    colonne: string;
    type: string;
    nullable: string;
  }
  const requete = `
    SELECT c.table_name AS table, c.column_name AS colonne,
           c.data_type AS type, c.is_nullable AS nullable
    FROM information_schema.columns c
    JOIN information_schema.tables t
      ON t.table_name = c.table_name AND t.table_schema = c.table_schema
    WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    ORDER BY 1, 2`;

  const normaliser = (type: string) =>
    type
      .toLowerCase()
      .replace(/timestamp\(\d+\) without time zone/, 'timestamp')
      .replace(/^timestamp without time zone$/, 'timestamp')
      .replace(/character varying\((\d+)\)/, 'varchar($1)')
      .replace(/^character varying$/, 'varchar')
      .replace(/^text$/, 'varchar')
      .replace(/^uuid$/, 'varchar')
      .trim();

  const clef = (rows: Ligne[]) =>
    new Map(
      rows
        .filter((r) => !TABLES_HORS_MIGRATION.includes(r.table))
        .map((r) => [
          `${r.table}.${r.colonne}`,
          `${normaliser(r.type)}|${r.nullable === 'YES' ? 'NULL' : 'NOT NULL'}`,
        ]),
    );

  const colonnesTypeorm = clef((await dbTypeorm.query<Ligne>(requete)).rows);
  const colonnesPrisma = clef((await dbPrisma.query<Ligne>(requete)).rows);

  const ecarts: string[] = [];
  for (const [k, v] of colonnesPrisma) {
    if (!colonnesTypeorm.has(k))
      ecarts.push(`- absente dans TypeORM : ${k} (${v})`);
    else if (colonnesTypeorm.get(k) !== v)
      ecarts.push(
        `- differente : ${k} — prisma=${v} / typeorm=${colonnesTypeorm.get(k)}`,
      );
  }
  for (const [k, v] of colonnesTypeorm) {
    if (!colonnesPrisma.has(k))
      ecarts.push(`+ en plus dans TypeORM : ${k} (${v})`);
  }

  console.log(
    ecarts.length === 0
      ? `Parite OK : ${colonnesTypeorm.size} colonnes identiques (types text/uuid/varchar normalises).`
      : `ECARTS (${ecarts.length}) :\n${ecarts.join('\n')}`,
  );

  await dbPrisma.close();
  await dbTypeorm.close();
}

async function main() {
  const ddl = await genererDdl();
  console.log(`DDL capture : ${ddl.length} instructions`);

  if (process.argv.includes('--verifier')) {
    await verifierParite(ddl);
    return;
  }

  await ecrireMigration(ddl);
}

main().catch((e) => {
  console.error('Echec de la generation :', e);
  process.exit(1);
});
