/** Serveur PostgreSQL en memoire (developpement / verification locale). */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

const PORT = Number(process.argv[2] ?? 5599);

async function main() {
  const db = await PGlite.create();
  const serveur = new PGLiteSocketServer({ db, port: PORT, host: '127.0.0.1', maxConnections: 20 });
  await serveur.start();
  console.log(`PostgreSQL en memoire pret sur 127.0.0.1:${PORT}`);
}
main().catch((e) => { console.error(e); process.exit(1); });
