/**
 * Projets : creation, filtrage par etablissement, soumission, avancement, archivage.
 *
 * Reprend les verifications de test-projets.ps1 et test-tableau-de-bord.ps1.
 */
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';
import { dateIsoDans } from './harness/dates';

function chargeProjet(nom: string, etablissementId?: string) {
  return {
    nom,
    type: 'Recherche',
    domaine: 'Biologie',
    budget: 12000,
    date_debut: dateIsoDans(15),
    date_fin_prevue: dateIsoDans(400),
    ...(etablissementId ? { etablissement_id: etablissementId } : {}),
  };
}

describe('Projets (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let etablissementFds: any;
  let etablissementFlsh: any;
  let etablissementFdsId: string;

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
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  describe('POST /api/projets', () => {
    it('cree un projet rattache a l etablissement du compte', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(etablissementFds))
        .send(chargeProjet('Projet Observation des lémuriens'))
        .expect(201);

      const projet = donnees<any>(reponse.body);
      expect(projet.nom).toBe('Projet Observation des lémuriens');
      expect(projet.etablissement_id).toBe(etablissementFdsId);
      expect(projet.statut).toBe('BROUILLON');
    });

    it('accepte un projet transversal sans etablissement pour la PRESIDENCE (201)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(presidence))
        .send(chargeProjet('Projet transversal sans etablissement'))
        .expect(201);

      const projet = donnees<any>(reponse.body);
      expect(projet.etablissement_id).toBeNull();
    });

    it('accepte la creation par la PRESIDENCE avec etablissement_id', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(presidence))
        .send(chargeProjet('Projet Présidence', etablissementFdsId))
        .expect(201);

      expect(donnees<any>(reponse.body).etablissement_id).toBe(
        etablissementFdsId,
      );
    });

    it('refuse une date au format invalide (400)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(etablissementFds))
        .send({
          nom: 'Projet date invalide',
          type: 'Recherche',
          date_debut: 'pas-une-date',
          date_fin_prevue: dateIsoDans(30),
        })
        .expect(400);
    });

    it('refuse une charge utile invalide (400)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(etablissementFds))
        .send({ nom: 'P', type: 'Recherche' })
        .expect(400);
    });
  });

  describe('GET /api/projets', () => {
    it('filtre les projets de l etablissement et par statut', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/projets?statut=BROUILLON&page=1&limit=5')
        .set(...enteteBearer(etablissementFds))
        .expect(200);

      const corps = donnees<any>(reponse.body);
      expect(corps.meta.page).toBe(1);
      expect(corps.meta.limit).toBe(5);
      for (const projet of corps.data) {
        expect(projet.etablissement_id).toBe(etablissementFdsId);
        expect(projet.statut).toBe('BROUILLON');
      }
    });

    it('ne montre pas a un etablissement les projets d un autre', async () => {
      const autre = await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(etablissementFlsh))
        .send(chargeProjet('Projet FLSH'))
        .expect(201);

      // Le garde « propre etablissement » interdit l'acces (403)
      await request(ctx.app.getHttpServer())
        .get(`/api/projets/${donnees<any>(autre.body).id}`)
        .set(...enteteBearer(etablissementFds))
        .expect(403);
    });
  });

  describe('POST /api/projets/:id/soumettre', () => {
    it('fait passer le projet de BROUILLON a EN_ATTENTE puis refuse la resoumission (409)', async () => {
      const creation = await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(etablissementFds))
        .send(chargeProjet('Projet a soumettre'))
        .expect(201);

      const projetId = donnees<any>(creation.body).id;

      const soumission = await request(ctx.app.getHttpServer())
        .post(`/api/projets/${projetId}/soumettre`)
        .set(...enteteBearer(etablissementFds))
        .expect(200);

      expect(donnees<any>(soumission.body).statut).toBe('EN_ATTENTE');

      await request(ctx.app.getHttpServer())
        .post(`/api/projets/${projetId}/soumettre`)
        .set(...enteteBearer(etablissementFds))
        .expect(409);
    });

    it('renvoie 404 pour un projet inconnu', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/projets/00000000-0000-4000-8000-000000000000/soumettre')
        .set(...enteteBearer(etablissementFds))
        .expect(404);
    });
  });

  describe('GET /api/projets/:id/avancement', () => {
    it('calcule l avancement a partir des activites', async () => {
      const creation = await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(etablissementFds))
        .send(chargeProjet('Projet avancement'))
        .expect(201);

      const projetId = donnees<any>(creation.body).id;

      const reponse = await request(ctx.app.getHttpServer())
        .get(`/api/projets/${projetId}/avancement`)
        .set(...enteteBearer(etablissementFds))
        .expect(200);

      const avancement = donnees<any>(reponse.body);
      expect(avancement.activites_total).toBe(0);
      expect(avancement.activites_terminees).toBe(0);
      expect(avancement.avancement).toBe(0);
      expect(avancement.projet_id).toBe(projetId);
    });
  });

  describe('POST /api/projets/:id/archiver', () => {
    it('archive un projet sans activite non terminee (PRESIDENCE) et refuse sinon (409)', async () => {
      const creation = await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(etablissementFds))
        .send(chargeProjet('Projet archivable'))
        .expect(201);

      const projetId = donnees<any>(creation.body).id;

      // Une activite non terminee bloque l'archivage
      await ctx.dataSource.query(
        `INSERT INTO "Activite" ("id", "intitule", "ordre", "terminee", "projet_id", "created_at", "updated_at")
         VALUES (gen_random_uuid(), 'Activite en cours', 1, false, $1, now(), now())`,
        [projetId],
      );

      await request(ctx.app.getHttpServer())
        .post(`/api/projets/${projetId}/archiver`)
        .set(...enteteBearer(presidence))
        .expect(409);

      await ctx.dataSource.query(
        `UPDATE "Activite" SET "terminee" = true WHERE "projet_id" = $1`,
        [projetId],
      );

      const reponse = await request(ctx.app.getHttpServer())
        .post(`/api/projets/${projetId}/archiver`)
        .set(...enteteBearer(presidence))
        .expect(200);

      expect(donnees<any>(reponse.body).archive).toBe(true);
    });
  });
});
