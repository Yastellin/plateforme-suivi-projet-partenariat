/**
 * Activite mensuelle du tableau de bord : 6 mois, formats, acces par role.
 */
import request from 'supertest';
import { creerApplicationTest, type ApplicationTest } from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';

describe('Tableau de bord - activite mensuelle (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let etablissementFds: any;
  let decideur: any;

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();
    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role, etablissement_id FROM "Utilisateur"`,
    );
    presidence = utilisateurs.find((u: any) => u.email.startsWith('presidence@'));
    etablissementFds = utilisateurs.find((u: any) => u.email.startsWith('fds@'));
    decideur = utilisateurs.find((u: any) => u.email.startsWith('president@'));
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  it('renvoie les 6 derniers mois, du plus ancien au plus recent, avec des compteurs entiers', async () => {
    const reponse = await request(ctx.app.getHttpServer())
      .get('/api/tableau-de-bord/activite-mensuelle')
      .set(...enteteBearer(presidence))
      .expect(200);
    const points = donnees<any[]>(reponse.body);

    expect(points).toHaveLength(6);
    for (const point of points) {
      expect(point.mois).toMatch(/^\d{4}-\d{2}$/);
      expect(Number.isInteger(point.conventions_signees)).toBe(true);
      expect(Number.isInteger(point.projets_soumis)).toBe(true);
    }
    const mois = points.map((p) => p.mois);
    expect([...mois].sort()).toEqual(mois);
  });

  it('est accessible au DECIDEUR et a un etablissement, filtre pour ce dernier', async () => {
    await request(ctx.app.getHttpServer())
      .get('/api/tableau-de-bord/activite-mensuelle')
      .set(...enteteBearer(decideur))
      .expect(200);
    const reponse = await request(ctx.app.getHttpServer())
      .get('/api/tableau-de-bord/activite-mensuelle')
      .set(...enteteBearer(etablissementFds))
      .expect(200);
    expect(donnees<any[]>(reponse.body)).toHaveLength(6);
  });
});
