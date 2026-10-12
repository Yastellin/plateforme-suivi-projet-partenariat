/**
 * Conventions : creation (Presidence), unicite de la reference, archivage.
 *
 * Reprend les verifications de test-conventions.ps1.
 */
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';
import { dateIsoDans } from './harness/dates';

describe('Conventions (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let decideur: any;
  let etablissementFds: any;
  let partenariatId: string;

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();

    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role, etablissement_id FROM "Utilisateur"`,
    );
    presidence = utilisateurs.find((u: any) =>
      u.email.startsWith('presidence@'),
    );
    decideur = utilisateurs.find((u: any) => u.email.startsWith('president@'));
    etablissementFds = utilisateurs.find((u: any) =>
      u.email.startsWith('fds@'),
    );

    const [partenariat] = await ctx.dataSource.query(
      `SELECT id FROM "Partenariat" LIMIT 1`,
    );
    partenariatId = partenariat.id;
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  describe('POST /api/conventions', () => {
    it('cree une convention (PRESIDENCE)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          reference: 'CONV-2026-100',
          titre: 'Convention de mobilité étudiante',
          date_debut: dateIsoDans(30),
          date_fin: dateIsoDans(1200),
          description: 'Accueil d étudiants en master',
          partenariat_id: partenariatId,
        })
        .expect(201);

      const convention = donnees<any>(reponse.body);
      expect(convention.reference).toBe('CONV-2026-100');
      expect(convention.statut).toBe('BROUILLON');
      expect(convention.archive).toBe(false);
    });

    it('refuse une reference en doublon (409)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          reference: 'CONV-2026-100',
          titre: 'Doublon de reference',
          partenariat_id: partenariatId,
        })
        .expect(409);

      expect(reponse.body.status).toBe('error');
    });

    it('exige un rattachement (partenariat, projet ou cotutelle) (400)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          reference: 'CONV-2026-SANS-LIEN',
          titre: 'Convention sans rattachement',
        })
        .expect(400);

      expect(reponse.body.message).toContain('partenariat');
    });

    it('refuse une convention sans titre (400)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({ reference: 'CONV-2026-101' })
        .expect(400);
    });
  });

  describe('GET /api/conventions', () => {
    it('est accessible a la PRESIDENCE et au DECIDEUR', async () => {
      await request(ctx.app.getHttpServer())
        .get('/api/conventions?page=1&limit=5')
        .set(...enteteBearer(presidence))
        .expect(200);

      await request(ctx.app.getHttpServer())
        .get('/api/conventions?page=1&limit=5')
        .set(...enteteBearer(decideur))
        .expect(200);
    });

    it('filtre par statut', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/conventions?statut=BROUILLON')
        .set(...enteteBearer(presidence))
        .expect(200);

      const corps = donnees<any>(reponse.body);
      expect(corps.meta).toBeDefined();
      for (const convention of corps.data) {
        expect(convention.statut).toBe('BROUILLON');
      }
    });

    it('renvoie 404 pour un identifiant inconnu', async () => {
      await request(ctx.app.getHttpServer())
        .get('/api/conventions/00000000-0000-4000-8000-000000000000')
        .set(...enteteBearer(decideur))
        .expect(404);
    });
  });

  describe('POST /api/conventions/:id/archiver', () => {
    it('archive une convention (PRESIDENCE)', async () => {
      const creation = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          reference: 'CONV-2026-ARCH',
          titre: 'Convention a archiver',
          partenariat_id: partenariatId,
        })
        .expect(201);

      const conventionId = donnees<any>(creation.body).id;

      const reponse = await request(ctx.app.getHttpServer())
        .post(`/api/conventions/${conventionId}/archiver`)
        .set(...enteteBearer(presidence))
        .expect(200);

      expect(donnees<any>(reponse.body).archive).toBe(true);
    });

    it('est interdit a un ETABLISSEMENT (403)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/conventions/00000000-0000-4000-8000-000000000000/archiver')
        .set(...enteteBearer(etablissementFds))
        .expect(403);
    });
  });
});
