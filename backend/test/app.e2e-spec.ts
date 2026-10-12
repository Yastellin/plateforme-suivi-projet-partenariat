/**
 * Socle de l'API : sante, enveloppe ITDCMADA, securite, erreurs generiques.
 *
 * Reprend les verifications du script test-bloc-a.ps1, en version automatisee.
 */
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { enteteBearer } from './harness/jetons';

describe('API - socle (e2e)', () => {
  let ctx: ApplicationTest;
  let utilisateurPresidence: { id: string; email: string; role: any };

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();

    const [ligne] = await ctx.dataSource.query(
      `SELECT id, email, role FROM "Utilisateur" WHERE email LIKE 'presidence@%'`,
    );
    utilisateurPresidence = ligne;
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  describe('GET /api/health', () => {
    it('repond 200 avec la base de donnees disponible', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(reponse.body.status).toBe('success');
      expect(reponse.body.signature).toBe('ITDCMADA');
      expect(reponse.body.data.status).toBe('ok');
      expect(reponse.body.data.dependances.base_de_donnees).toBe('ok');
      expect(typeof reponse.body.data.uptime_secondes).toBe('number');
    });

    it('est accessible sans jeton', async () => {
      await request(ctx.app.getHttpServer()).get('/api/health').expect(200);
    });
  });

  describe('En-tetes de securite (Helmet)', () => {
    it('expose les en-tetes attendus et masque X-Powered-By', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(reponse.headers['x-content-type-options']).toBe('nosniff');
      expect(reponse.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(reponse.headers['x-powered-by']).toBeUndefined();
    });
  });

  describe('Enveloppe de reponse', () => {
    it('encapsule les erreurs au format ITDCMADA', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/projets')
        .expect(401);

      expect(reponse.body.status).toBe('error');
      expect(reponse.body.data).toBeNull();
      expect(reponse.body.signature).toBe('ITDCMADA');
      expect(typeof reponse.body.message).toBe('string');
    });

    it('renvoie 404 sur une route inconnue', async () => {
      await request(ctx.app.getHttpServer())
        .get('/api/route-inexistante')
        .expect(404);
    });
  });

  describe('Validation des parametres', () => {
    it('renvoie 400 sur un identifiant qui n est pas un UUID', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/projets/pas-un-uuid')
        .set(...enteteBearer(utilisateurPresidence))
        .expect(400);

      expect(reponse.body.status).toBe('error');
    });
  });
});
