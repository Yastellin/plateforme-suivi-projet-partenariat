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
  let compteEtablissement: any;
  let partenaireId: string;
  let etablissementId: string;
  const fichiersCrees: string[] = [];

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();

    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role, etablissement_id FROM "Utilisateur"`,
    );
    presidence = utilisateurs.find((utilisateur: any) =>
      utilisateur.email.startsWith('presidence@'),
    );
    compteEtablissement = utilisateurs.find((utilisateur: any) =>
      utilisateur.email.startsWith('fds@'),
    );
    const [partenaire] = await ctx.dataSource.query(
      `SELECT id FROM "Partenaire" WHERE nom = 'Université de Toliara'`,
    );
    partenaireId = partenaire.id;
    const [etablissement] = await ctx.dataSource.query(
      `SELECT id FROM "Etablissement" WHERE sigle = 'FDS'`,
    );
    etablissementId = etablissement.id;
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

    expect(donnees<any>(reponse.body).contrats.parametres_logos).toBe('v2');
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

    const configurationPublique = await request(ctx.app.getHttpServer())
      .get('/api/public/configuration')
      .expect(200);
    expect(donnees<any>(configurationPublique.body).logo_url).toBe(
      configuration.logo_url,
    );

    await request(ctx.app.getHttpServer())
      .get(configuration.logo_url)
      .expect('Content-Type', /image\/png/)
      .expect(200);
    await request(ctx.app.getHttpServer())
      .get(`/api${configuration.logo_url}`)
      .expect('Content-Type', /image\/png/)
      .expect(200);

    const retrait = await request(ctx.app.getHttpServer())
      .delete('/api/configuration/logo')
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(donnees<any>(retrait.body).logo_url).toBeNull();
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

    const listePublique = await request(ctx.app.getHttpServer())
      .get('/api/public/partenaires')
      .expect(200);
    expect(
      donnees<any>(listePublique.body).data.find(
        (item: any) => item.id === partenaireId,
      ).logo_url,
    ).toBe(partenaire.logo_url);

    const partenariatsInternes = await request(ctx.app.getHttpServer())
      .get('/api/partenariats')
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(
      donnees<any>(partenariatsInternes.body)
        .data.flatMap((item: any) => item.partenaires)
        .find((item: any) => item.id === partenaireId).logo_url,
    ).toBe(partenaire.logo_url);

    const partenariatsPublics = await request(ctx.app.getHttpServer())
      .get('/api/public/partenariats')
      .expect(200);
    expect(
      donnees<any[]>(partenariatsPublics.body)
        .flatMap((item: any) => item.partenaires)
        .find((item: any) => item.id === partenaireId).logo_url,
    ).toBe(partenaire.logo_url);

    await request(ctx.app.getHttpServer())
      .post('/api/synthese/partenaires-strategiques')
      .set(...enteteBearer(presidence))
      .send({
        etablissement_id: etablissementId,
        partenaire_id: partenaireId,
        annee: 2026,
      })
      .expect(201);
    const partenairesStrategiques = await request(ctx.app.getHttpServer())
      .get(
        `/api/synthese/partenaires-strategiques?etablissement_id=${etablissementId}&annee=2026`,
      )
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(
      donnees<any[]>(partenairesStrategiques.body).find(
        (item: any) => item.partenaire_id === partenaireId,
      ).partenaire_logo_url,
    ).toBe(partenaire.logo_url);

    await request(ctx.app.getHttpServer())
      .get(`/api${partenaire.logo_url}`)
      .expect('Content-Type', /image\/png/)
      .expect(200);

    const retrait = await request(ctx.app.getHttpServer())
      .delete(`/api/partenaires/${partenaireId}/logo`)
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(donnees<any>(retrait.body).logo_url).toBeNull();
  });

  it("réserve le logo à l'établissement et le propage dans les réponses qui le référencent", async () => {
    await request(ctx.app.getHttpServer())
      .post(`/api/etablissements/${etablissementId}/logo`)
      .set(...enteteBearer(presidence))
      .attach('fichier', PNG_1X1, {
        filename: 'logo-interdit-presidence.png',
        contentType: 'image/png',
      })
      .expect(403);

    await request(ctx.app.getHttpServer())
      .delete(`/api/etablissements/${etablissementId}/logo`)
      .set(...enteteBearer(presidence))
      .expect(403);

    const reponse = await request(ctx.app.getHttpServer())
      .post(`/api/etablissements/${etablissementId}/logo`)
      .set(...enteteBearer(compteEtablissement))
      .attach('fichier', PNG_1X1, {
        filename: 'logo-faculte-sciences.png',
        contentType: 'image/png',
      })
      .expect(200);

    const etablissement = donnees<any>(reponse.body);
    fichiersCrees.push(etablissement.logo_url);

    const accueilPublic = await request(ctx.app.getHttpServer())
      .get('/api/public/accueil')
      .expect(200);
    expect(
      donnees<any>(accueilPublic.body).etablissements_a_la_une.find(
        (item: any) => item.id === etablissementId,
      ).logo_url,
    ).toBe(etablissement.logo_url);

    const partenariatsInternes = await request(ctx.app.getHttpServer())
      .get('/api/partenariats')
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(
      donnees<any>(partenariatsInternes.body)
        .data.flatMap((item: any) => item.etablissements)
        .find((item: any) => item.id === etablissementId).logo_url,
    ).toBe(etablissement.logo_url);

    const partenariatsPublics = await request(ctx.app.getHttpServer())
      .get('/api/public/partenariats')
      .expect(200);
    expect(
      donnees<any[]>(partenariatsPublics.body)
        .flatMap((item: any) => item.etablissements)
        .find((item: any) => item.id === etablissementId).logo_url,
    ).toBe(etablissement.logo_url);

    const projetsInternes = await request(ctx.app.getHttpServer())
      .get('/api/projets')
      .set(...enteteBearer(presidence))
      .expect(200);
    const projet = donnees<any>(projetsInternes.body).data.find(
      (item: any) => item.etablissement_id === etablissementId,
    );
    expect(projet.etablissement.logo_url).toBe(etablissement.logo_url);

    const synthese = await request(ctx.app.getHttpServer())
      .get('/api/synthese?annee=2026')
      .set(...enteteBearer(presidence))
      .expect(200);
    expect(
      donnees<any>(synthese.body).etablissements.find(
        (item: any) => item.etablissement_id === etablissementId,
      ).etablissement_logo_url,
    ).toBe(etablissement.logo_url);

    await ctx.dataSource.query(
      `UPDATE "Projet"
       SET statut = 'EN_COURS', publie_le = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [projet.id],
    );
    const projetsPublics = await request(ctx.app.getHttpServer())
      .get('/api/public/projets')
      .expect(200);
    expect(
      donnees<any>(projetsPublics.body).data.find(
        (item: any) => item.id === projet.id,
      ).etablissement.logo_url,
    ).toBe(etablissement.logo_url);

    const retrait = await request(ctx.app.getHttpServer())
      .delete(`/api/etablissements/${etablissementId}/logo`)
      .set(...enteteBearer(compteEtablissement))
      .expect(200);
    expect(donnees<any>(retrait.body).logo_url).toBeNull();
  });
});
