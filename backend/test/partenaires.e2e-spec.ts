/**
 * Partenaires : creation, doublons, filtrage par etablissement, archivage.
 *
 * Reprend les verifications de test-partenaires.ps1.
 */
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';

describe('Partenaires (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let etablissementFds: any;
  let etablissementFlsh: any;
  let etablissementFdsId: string;
  let etablissementFlshId: string;
  let partenaireToliaraId: string;

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();

    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role, etablissement_id FROM "Utilisateur"`,
    );
    presidence = utilisateurs.find((u: any) =>
      u.email.startsWith('presidence@'),
    );
    etablissementFds = utilisateurs.find((u: any) =>
      u.email.startsWith('fds@'),
    );
    etablissementFlsh = utilisateurs.find((u: any) =>
      u.email.startsWith('flsh@'),
    );
    etablissementFdsId = etablissementFds.etablissement_id;
    etablissementFlshId = etablissementFlsh.etablissement_id;
    const [partenaireToliara] = await ctx.dataSource.query(
      `SELECT id FROM "Partenaire" WHERE nom = 'Université de Toliara'`,
    );
    partenaireToliaraId = partenaireToliara.id;
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  describe('POST /api/partenaires', () => {
    it('cree un partenaire pour un etablissement (PRESIDENCE)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/partenaires')
        .set(...enteteBearer(presidence))
        .send({
          nom: "Université d'Antananarivo",
          type: 'Université',
          pays: 'Madagascar',
          etablissement_id: etablissementFdsId,
        })
        .expect(201);

      const partenaire = donnees<any>(reponse.body);
      expect(partenaire.nom).toBe("Université d'Antananarivo");
      expect(partenaire.etablissement_id).toBe(etablissementFdsId);
      expect(partenaire.statut).toBe('ACTIF');
    });

    it('refuse un doublon de nom dans le meme etablissement (409)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/partenaires')
        .set(...enteteBearer(presidence))
        .send({
          nom: "Université d'Antananarivo",
          type: 'Université',
          pays: 'Madagascar',
          etablissement_id: etablissementFdsId,
        })
        .expect(409);

      expect(reponse.body.status).toBe('error');
      expect(reponse.body.message).toContain('existe déjà');
    });

    it('exige un etablissement pour la PRESIDENCE (400)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/partenaires')
        .set(...enteteBearer(presidence))
        .send({
          nom: 'Partenaire sans établissement',
          type: 'ONG',
          pays: 'Madagascar',
        })
        .expect(400);
    });

    it('rattache automatiquement le partenaire a l etablissement du compte', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/partenaires')
        .set(...enteteBearer(etablissementFlsh))
        .send({
          nom: 'Université de Toamasina',
          type: 'Université',
          pays: 'Madagascar',
        })
        .expect(201);

      const partenaire = donnees<any>(reponse.body);
      expect(partenaire.etablissement_id).toBe(etablissementFlshId);
    });

    it('refuse une charge utile invalide (400)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/partenaires')
        .set(...enteteBearer(etablissementFds))
        .send({ nom: 'X', type: 'Université', pays: 'Madagascar' })
        .expect(400);
    });

    it("refuse l'e-mail déjà attribué à un autre partenaire (409)", async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/partenaires')
        .set(...enteteBearer(presidence))
        .send({
          nom: 'Institut supérieur de Fianarantsoa',
          type: 'Institut',
          pays: 'Madagascar',
          email: 'contact@univ-toliara.mg',
          etablissement_id: etablissementFlshId,
        })
        .expect(409);

      expect(reponse.body.message).toContain('appartient déjà');
    });

    it("refuse pour un contact un téléphone déjà attribué à un partenaire (409)", async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post(`/api/partenaires/${partenaireToliaraId}/contacts`)
        .set(...enteteBearer(presidence))
        .send({
          nom: 'Rasoa Fara',
          fonction: 'Chargée de coopération',
          telephone: '034 12 345 67',
        })
        .expect(409);

      expect(reponse.body.message).toContain('appartient déjà');
    });
  });

  describe('GET /api/partenaires', () => {
    it('ne renvoie que les partenaires de l etablissement du compte', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/partenaires')
        .set(...enteteBearer(etablissementFds))
        .expect(200);

      const corps = donnees<any>(reponse.body);
      expect(corps.meta.page).toBe(1);
      expect(corps.meta.total).toBeGreaterThanOrEqual(1);
      for (const partenaire of corps.data) {
        expect(partenaire.etablissement_id).toBe(etablissementFdsId);
      }
    });

    it('renvoie uniquement les partenaires propres à la PRESIDENCE', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/partenaires?pays=Madagascar')
        .set(...enteteBearer(presidence))
        .expect(200);

      const corps = donnees<any>(reponse.body);
      expect(corps.data.length).toBeGreaterThanOrEqual(1);
      expect(
        corps.data.every(
          (partenaire: any) =>
            partenaire.pays === 'Madagascar' &&
            partenaire.cree_par_role === 'PRESIDENCE',
        ),
      ).toBe(true);
      expect(
        corps.data.some(
          (partenaire: any) => partenaire.nom === 'Université de Toamasina',
        ),
      ).toBe(false);
    });

    it('respecte la pagination demandee', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/partenaires?page=1&limit=2')
        .set(...enteteBearer(presidence))
        .expect(200);

      const corps = donnees<any>(reponse.body);
      expect(corps.meta.limit).toBe(2);
      expect(corps.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/partenaires/:id', () => {
    it('renvoie 404 pour un identifiant inconnu', async () => {
      await request(ctx.app.getHttpServer())
        .get('/api/partenaires/00000000-0000-4000-8000-000000000000')
        .set(...enteteBearer(presidence))
        .expect(404);
    });

    it('empeche un etablissement d acceder au partenaire d un autre (404)', async () => {
      const creation = await request(ctx.app.getHttpServer())
        .post('/api/partenaires')
        .set(...enteteBearer(etablissementFds))
        .send({ nom: 'Partenaire prive FDS', type: 'ONG', pays: 'Madagascar' })
        .expect(201);

      const partenaireId = donnees<any>(creation.body).id;

      await request(ctx.app.getHttpServer())
        .get(`/api/partenaires/${partenaireId}`)
        .set(...enteteBearer(etablissementFds))
        .expect(200);

      await request(ctx.app.getHttpServer())
        .get(`/api/partenaires/${partenaireId}`)
        .set(...enteteBearer(etablissementFlsh))
        .expect(404);
    });
  });

  describe('GET /api/partenaires/recherche-doublon', () => {
    it('trouve un partenaire existant pour un établissement', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get(
          '/api/partenaires/recherche-doublon?nom=' +
            encodeURIComponent('Université de Toliara'),
        )
        .set(...enteteBearer(etablissementFds))
        .expect(200);

      expect(
        donnees<any[]>(reponse.body).some(
          (partenaire) => partenaire.nom === 'Université de Toliara',
        ),
      ).toBe(true);
    });

    it('ne renvoie rien pour un nom inexistant', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get(
          '/api/partenaires/recherche-doublon?nom=Partenaire Totalement Inconnu XYZ',
        )
        .set(...enteteBearer(etablissementFds))
        .expect(200);

      expect(donnees(reponse.body)).toEqual([]);
    });

    it('permet à la PRESIDENCE de rechercher (400 si nom absent)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/partenaires/recherche-doublon?nom=université de toliara')
        .set(...enteteBearer(presidence))
        .expect(200);

      expect(
        donnees<any[]>(reponse.body).some(
          (partenaire) => partenaire.nom === 'Université de Toliara',
        ),
      ).toBe(true);

      await request(ctx.app.getHttpServer())
        .get('/api/partenaires/recherche-doublon')
        .set(...enteteBearer(presidence))
        .expect(400);
    });
  });

  describe('POST /api/partenaires/:id/archiver', () => {
    it('est reserve a la PRESIDENCE (403 sinon)', async () => {
      const creation = await request(ctx.app.getHttpServer())
        .post('/api/partenaires')
        .set(...enteteBearer(etablissementFds))
        .send({ nom: 'Partenaire a archiver', type: 'ONG', pays: 'Madagascar' })
        .expect(201);

      const partenaireId = donnees<any>(creation.body).id;

      await request(ctx.app.getHttpServer())
        .post(`/api/partenaires/${partenaireId}/archiver`)
        .set(...enteteBearer(etablissementFds))
        .expect(403);

      const reponse = await request(ctx.app.getHttpServer())
        .post(`/api/partenaires/${partenaireId}/archiver`)
        .set(...enteteBearer(presidence))
        .expect(200);

      expect(donnees<any>(reponse.body).archive).toBe(true);

      // Un partenaire archive n'est plus visible
      await request(ctx.app.getHttpServer())
        .get(`/api/partenaires/${partenaireId}`)
        .set(...enteteBearer(presidence))
        .expect(404);
    });
  });
});
