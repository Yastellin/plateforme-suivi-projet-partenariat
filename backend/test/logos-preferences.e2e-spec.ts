/**
 * Contrats critiques des paramètres : routes réellement enregistrées,
 * persistance des préférences et disponibilité publique des logos envoyés.
 */
import * as fs from 'fs';
import * as path from 'path';
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

describe('Logos et préférences (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let partenaireId: string;
  const fichiersCrees: string[] = [];

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();

    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role FROM "Utilisateur"`,
    );
    presidence = utilisateurs.find((utilisateur: any) =>
      utilisateur.email.startsWith('presidence@'),
    );
    const [partenaire] = await ctx.dataSource.query(
      `SELECT id FROM "Partenaire" WHERE nom = 'Université de Toliara'`,
    );
    partenaireId = partenaire.id;
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
    for (const fichier of fichiersCrees) {
      fs.rmSync(path.join(process.cwd(), fichier.replace(/^\//, '')), {
        force: true,
      });
    }
  });

  it('expose le contrat de routes attendu par le frontend', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(donnees<any>(reponse.body).contrats.parametres_logos).toBe('v1');
  });

  it('PATCH /api/compte/preferences persiste et renvoie les préférences', async () => {
    const preferences = {
      theme: 'SOMBRE',
      densite: 'COMPACTE',
      animations: false,
      aide_contextuelle: true,
    };

    const reponse = await request(ctx.app.getHttpServer())
      .patch('/api/compte/preferences')
      .set(...enteteBearer(presidence))
      .send(preferences)
      .expect(200);

    expect(donnees<any>(reponse.body).preferences).toEqual(preferences);

    const [utilisateur] = await ctx.dataSource.query(
      `SELECT preferences FROM "Utilisateur" WHERE id = $1`,
      [presidence.id],
    );
    expect(utilisateur.preferences).toEqual(preferences);
  });

  it('POST /api/configuration/logo persiste un logo servi avec et sans préfixe API', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .post('/api/configuration/logo')
      .set(...enteteBearer(presidence))
      .attach('fichier', PNG_1X1, {
        filename: 'logo-presidence.png',
        contentType: 'image/png',
      })
      .expect(200);

    const configuration = donnees<any>(reponse.body);
    expect(configuration.logo_url).toMatch(
      /^\/uploads\/logos\/presidence\/.+\.png$/,
    );
    fichiersCrees.push(configuration.logo_url);

    const lecture = await request(ctx.app.getHttpServer())
      .get('/api/configuration')
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(donnees<any>(lecture.body).logo_url).toBe(configuration.logo_url);

    await request(ctx.app.getHttpServer())
      .get(configuration.logo_url)
      .expect('Content-Type', /image\/png/)
      .expect(200);
    await request(ctx.app.getHttpServer())
      .get(`/api${configuration.logo_url}`)
      .expect('Content-Type', /image\/png/)
      .expect(200);
  });

  it('le logo partenaire est renvoyé, persisté puis publiquement accessible', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .post(`/api/partenaires/${partenaireId}/logo`)
      .set(...enteteBearer(presidence))
      .attach('fichier', PNG_1X1, {
        filename: 'logo-universite-toliara.png',
        contentType: 'image/png',
      })
      .expect(200);

    const partenaire = donnees<any>(reponse.body);
    expect(partenaire.logo_url).toMatch(
      new RegExp(`^/uploads/logos/partenaires/${partenaireId}/.+\\.png$`),
    );
    fichiersCrees.push(partenaire.logo_url);

    const lecture = await request(ctx.app.getHttpServer())
      .get(`/api/partenaires/${partenaireId}`)
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(donnees<any>(lecture.body).logo_url).toBe(partenaire.logo_url);

    await request(ctx.app.getHttpServer())
      .get(`/api${partenaire.logo_url}`)
      .expect('Content-Type', /image\/png/)
      .expect(200);
  });
});
