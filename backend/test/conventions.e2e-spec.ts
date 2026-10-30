/**
 * Vérifie la création, les rattachements facultatifs, les références et l'archivage des conventions.
 */
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';
import { dateIsoDans } from './harness/dates';
import { CotutelleThese } from '../src/cotutelles/entities/cotutelle-these.entity';
import { TypeCotutelle } from '../src/common/enums/type-cotutelle.enum';

describe('Conventions (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let decideur: any;
  let etablissementFds: any;
  let partenariatId: string;
  let projetId: string;
  let partenaireId: string;

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
    const [projet] = await ctx.dataSource.query(
      `SELECT id FROM "Projet" LIMIT 1`,
    );
    const [partenaire] = await ctx.dataSource.query(
      `SELECT id FROM "Partenaire" LIMIT 1`,
    );
    partenariatId = partenariat.id;
    projetId = projet.id;
    partenaireId = partenaire.id;
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  async function creerCotutelleTest(): Promise<CotutelleThese> {
    const depot = ctx.dataSource.getRepository(CotutelleThese);
    return depot.save(
      depot.create({
        nom_doctorant: 'Doctorant de test',
        type: TypeCotutelle.COTUTELLE,
        date_debut: new Date('2026-01-01T00:00:00.000Z'),
        etablissement_id: etablissementFds.etablissement_id,
        partenaire_id: partenaireId,
        archive: false,
      }),
    );
  }

  describe('POST /api/conventions', () => {
    it('crée une convention avec un partenariat', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          titre: 'Convention de mobilité étudiante',
          date_debut: dateIsoDans(30),
          date_fin: dateIsoDans(1200),
          description: 'Accueil d étudiants en master',
          partenariat_id: partenariatId,
        })
        .expect(201);

      const convention = donnees<any>(reponse.body);
      expect(convention.reference).toMatch(/^CONV-\d{4}-[0-9A-F-]{36}$/);
      expect(convention.statut).toBe('BROUILLON');
      expect(convention.archive).toBe(false);
      expect(convention.partenariat).toMatchObject({ id: partenariatId });
      expect(convention.partenariat.libelle).toEqual(expect.any(String));
      expect(convention.partenariat.libelle).not.toBe(partenariatId);
    });

    it('crée une convention indépendante avec les trois liens à null', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({ titre: 'Convention indépendante' })
        .expect(201);

      const convention = donnees<any>(reponse.body);
      expect(convention.partenariat_id).toBeNull();
      expect(convention.projet_id).toBeNull();
      expect(convention.cotutelle_id).toBeNull();
      expect(convention.partenariat).toBeNull();
      expect(convention.projet).toBeNull();
      expect(convention.cotutelle).toBeNull();

      const [ligne] = await ctx.dataSource.query(
        'SELECT partenariat_id, projet_id FROM "Convention" WHERE id = $1',
        [convention.id],
      );
      const cotutelles = await ctx.dataSource.query(
        'SELECT id FROM "CotutelleThese" WHERE convention_id = $1',
        [convention.id],
      );
      expect(ligne).toMatchObject({ partenariat_id: null, projet_id: null });
      expect(cotutelles).toHaveLength(0);
    });

    it('accepte deux liens sur une même convention', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          titre: 'Convention avec deux liens',
          partenariat_id: partenariatId,
          projet_id: projetId,
        })
        .expect(201);

      const convention = donnees<any>(reponse.body);
      expect(convention.partenariat_id).toBe(partenariatId);
      expect(convention.projet_id).toBe(projetId);
      expect(convention.cotutelle_id).toBeNull();
    });

    it('accepte les trois liens sur une même convention', async () => {
      const cotutelle = await creerCotutelleTest();
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          titre: 'Convention avec trois liens',
          partenariat_id: partenariatId,
          projet_id: projetId,
          cotutelle_id: cotutelle.id,
        })
        .expect(201);

      const convention = donnees<any>(reponse.body);
      expect(convention.partenariat_id).toBe(partenariatId);
      expect(convention.projet_id).toBe(projetId);
      expect(convention.cotutelle_id).toBe(cotutelle.id);
    });

    it('génère des références distinctes pour des créations successives', async () => {
      const creer = () =>
        request(ctx.app.getHttpServer())
          .post('/api/conventions')
          .set(...enteteBearer(presidence))
          .send({ titre: 'Convention sans rattachement' })
          .expect(201);

      const [premiere, seconde] = await Promise.all([creer(), creer()]);
      const referencePremiere = donnees<any>(premiere.body).reference;
      const referenceSeconde = donnees<any>(seconde.body).reference;

      expect(referencePremiere).not.toBe(referenceSeconde);
    });

    it('refuse une convention sans titre (400)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({})
        .expect(400);
    });
  });

  describe('PATCH /api/conventions/:id', () => {
    it('permet de retirer le dernier partenariat', async () => {
      const creation = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          titre: 'Convention à délier',
          partenariat_id: partenariatId,
        })
        .expect(201);
      const id = donnees<any>(creation.body).id;

      await request(ctx.app.getHttpServer())
        .patch(`/api/conventions/${id}`)
        .set(...enteteBearer(presidence))
        .send({ partenariat_id: null })
        .expect(200);

      const relue = await request(ctx.app.getHttpServer())
        .get(`/api/conventions/${id}`)
        .set(...enteteBearer(presidence))
        .expect(200);
      const convention = donnees<any>(relue.body);
      expect(convention.partenariat_id).toBeNull();
      expect(convention.partenariat).toBeNull();
    });

    it('retire la cotutelle finale même sans autre champ à modifier', async () => {
      const cotutelle = await creerCotutelleTest();
      const creation = await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          titre: 'Convention liée à une cotutelle',
          cotutelle_id: cotutelle.id,
        })
        .expect(201);
      const id = donnees<any>(creation.body).id;

      await request(ctx.app.getHttpServer())
        .patch(`/api/conventions/${id}`)
        .set(...enteteBearer(presidence))
        .send({ cotutelle_id: null })
        .expect(200);

      const relue = await request(ctx.app.getHttpServer())
        .get(`/api/conventions/${id}`)
        .set(...enteteBearer(presidence))
        .expect(200);
      expect(donnees<any>(relue.body).cotutelle_id).toBeNull();

      const [cotutelleRelue] = await ctx.dataSource.query(
        'SELECT convention_id FROM "CotutelleThese" WHERE id = $1',
        [cotutelle.id],
      );
      expect(cotutelleRelue.convention_id).toBeNull();
    });
  });

  describe('GET /api/conventions', () => {
    it('est accessible à la PRESIDENCE et au DECIDEUR', async () => {
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
          titre: 'Convention à archiver',
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

    it('est interdit à un ETABLISSEMENT (403)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/conventions/00000000-0000-4000-8000-000000000000/archiver')
        .set(...enteteBearer(etablissementFds))
        .expect(403);
    });
  });
});
