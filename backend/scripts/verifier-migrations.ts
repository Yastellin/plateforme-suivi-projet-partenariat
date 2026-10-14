/**
 * Verification de la chaine de migrations sur une base vierge.
 *
 * Demarre un PostgreSQL en memoire (PGlite), execute toutes les migrations
 * TypeORM du projet, puis controle que le schema obtenu correspond bien aux
 * entites (tables, cles etrangeres, absence de derive).
 *
 * Usage : npx ts-node scripts/verifier-migrations.ts
 */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { DataSource } from 'typeorm';
import { join } from 'node:path';

const PORT = 5551;

async function main() {
  const db = await PGlite.create();
  const serveur = new PGLiteSocketServer({ db, port: PORT, host: '127.0.0.1' });
  await serveur.start();

  process.env.DATABASE_URL = `postgresql://postgres:postgres@127.0.0.1:${PORT}/postgres?schema=public`;

  // Le DataSource du projet (meme configuration que la CLI TypeORM)
  const dataSource: DataSource = require(
    join(__dirname, '..', 'src', 'database', 'data-source'),
  ).default;

  await dataSource.initialize();
  const appliquees = await dataSource.runMigrations();
  console.log(`Migrations appliquees : ${appliquees.length}`);
  for (const m of appliquees) console.log(`  - ${m.name}`);

  // 1. Tables presentes
  const tables = await db.query<{ table_name: string }>(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY 1`,
  );
  console.log(`Tables creees : ${tables.rows.length}`);

  const attendues = dataSource.entityMetadatas.map((m) => m.tableName).sort();
  const obtenues = tables.rows.map((t) => t.table_name).sort();
  const manquantes = attendues.filter((t) => !obtenues.includes(t));
  const enPlus = obtenues.filter((t) => !attendues.includes(t));
  console.log(
    `Entites : ${attendues.length} | tables attendues manquantes : ${manquantes.length ? manquantes.join(', ') : 'aucune'}`,
  );
  console.log(
    `Tables hors entites : ${enPlus.length ? enPlus.join(', ') : 'aucune'}`,
  );

  // 2. Absence de derive : TypeORM ne devrait avoir aucune modification a faire
  const requetes: string[] = [];
  const sqlLog = dataSource.driver.options.logging;
  dataSource.setOptions({ logging: ['query', 'schema'] });
  const original = (
    dataSource.logger as { logQuery?: (q: string) => void }
  ).logQuery?.bind(dataSource.logger);
  (dataSource.logger as { logQuery: (q: string) => void }).logQuery = (
    q: string,
  ) => {
    requetes.push(q);
  };
  await dataSource.synchronize();
  (dataSource.logger as { logQuery: (q: string) => void }).logQuery =
    original as (q: string) => void;
  dataSource.setOptions({ logging: sqlLog });

  const ddl = requetes.filter((q) =>
    /^\s*(CREATE|ALTER|DROP|COMMENT)/i.test(q),
  );
  console.log(
    ddl.length === 0
      ? 'Derive de schema : aucune (le schema des migrations correspond exactement aux entites).'
      : `DERIVE DE SCHEMA (${ddl.length} instructions) :\n${ddl.join('\n')}`,
  );

  // 3. Cle etrangere password_reset_tokens -> Utilisateur
  const fk = await db.query<{ contrainte: string; cible: string }>(`
    SELECT c.conname AS contrainte, confrelid::regclass::text AS cible
    FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    WHERE t.relname = 'password_reset_tokens' AND c.contype = 'f'`);
  console.log(`FK password_reset_tokens : ${JSON.stringify(fk.rows)}`);

  // 4. Insertion reelle d'un utilisateur puis d'un token (verifie types uuid/text)
  await db.exec(`
    INSERT INTO "Utilisateur" ("id", "email", "password_hash", "role", "created_at", "updated_at")
    VALUES ('11111111-1111-1111-1111-111111111111', 'test@univ.mg', 'hash', 'PRESIDENCE', now(), now());
    INSERT INTO "password_reset_tokens" ("id", "token_hash", "utilisateur_id", "expire_le")
    VALUES ('tok-1', 'abc123', '11111111-1111-1111-1111-111111111111', now() + interval '30 minutes');
  `);
  console.log('Insertion Utilisateur + token de reinitialisation : OK');

  await dataSource.destroy();
  await serveur.stop();
  await db.close();
}

main().catch((e) => {
  console.error('ECHEC :', e);
  process.exit(1);
});
