/**
 * Base de donnees PostgreSQL ephemere pour les tests d'integration.
 *
 * Utilise PGlite (PostgreSQL compile en WebAssembly) expose via une socket
 * TCP : le pilote pg de TypeORM s'y connecte exactement comme a un vrai
 * serveur, sans Docker ni service externe.
 */
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import { createServer } from 'node:net';

export interface BaseTest {
  url: string;
  arreter: () => Promise<void>;
}

/** Demande au systeme un port TCP libre. */
export function portLibre(): Promise<number> {
  return new Promise((resoudre, rejeter) => {
    const serveur = createServer();
    serveur.on('error', rejeter);
    serveur.listen(0, '127.0.0.1', () => {
      const adresse = serveur.address();
      const port = typeof adresse === 'object' && adresse ? adresse.port : 0;
      serveur.close(() => resoudre(port));
    });
  });
}

export async function demarrerBaseTest(): Promise<BaseTest> {
  const port = await portLibre();
  const db = await PGlite.create();
  const serveur = new PGLiteSocketServer({
    db,
    port,
    host: '127.0.0.1',
    // TypeORM ouvre un pool de connexions : la valeur par defaut (1) est trop basse
    maxConnections: 20,
  });
  await serveur.start();

  return {
    url: `postgresql://postgres:postgres@127.0.0.1:${port}/postgres?schema=public`,
    arreter: async () => {
      await serveur.stop();
      await db.close();
    },
  };
}
