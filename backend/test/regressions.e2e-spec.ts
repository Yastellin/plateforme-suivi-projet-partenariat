/**
 * Non-regression des correctifs signales sur la plateforme.
 *
 * Chaque test reprend le scenario du rapport de bugs : les filtres de liste,
 * le rattachement des documents, le televersement des photos de publication et
 * la validation des mises a jour de convention.
 */
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';
import { dateIsoDans } from './harness/dates';

describe('Correctifs signales (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let etablissementId: string;
  let partenariatId: string;

  const url = () => ctx.app.getHttpServer();

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();

    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role, etablissement_id FROM "Utilisateur"`,
    );
    presidence = utilisateurs.find((u: any) =>
      u.email.startsWith('presidence@'),
    );

    // Le compte presidence n'est rattache a aucun etablissement : il doit
    // designer explicitement le porteur lors de la creation d'un projet.
    const [etablissement] = await ctx.dataSource.query(
      `SELECT id FROM "Etablissement" LIMIT 1`,
    );
    etablissementId = etablissement.id;

    const [partenariat] = await ctx.dataSource.query(
      `SELECT id FROM "Partenariat" LIMIT 1`,
    );
    partenariatId = partenariat.id;
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  describe('Projets : noms de champs des listes rattachees', () => {
    it('accepte bailleurs_ids, beneficiaires_ids et sites_ids', async () => {
      const [bailleur] = await ctx.dataSource.query(
        `SELECT id FROM "Bailleur" LIMIT 1`,
      );
      const [beneficiaire] = await ctx.dataSource.query(
        `SELECT id FROM "Beneficiaire" LIMIT 1`,
      );
      const [site] = await ctx.dataSource.query(`SELECT id FROM "Site" LIMIT 1`);

      const reponse = await request(url())
        .post('/api/projets')
        .set(...enteteBearer(presidence))
        .send({
          nom: 'Projet listes rattachees',
          type: 'Recherche',
          date_debut: dateIsoDans(30),
          date_fin_prevue: dateIsoDans(800),
          etablissement_id: etablissementId,
          bailleurs_ids: [bailleur.id],
          beneficiaires_ids: [beneficiaire.id],
          sites_ids: [site.id],
        })
        .expect(201);

      expect(donnees<any>(reponse.body).nom).toBe('Projet listes rattachees');
    });

    it('refuse les anciens noms au singulier', async () => {
      await request(url())
        .post('/api/projets')
        .set(...enteteBearer(presidence))
        .send({
          nom: 'Projet champs invalides',
          type: 'Recherche',
          date_debut: dateIsoDans(30),
          date_fin_prevue: dateIsoDans(800),
          etablissement_id: etablissementId,
          bailleur_ids: [],
        })
        .expect(400);
    });
  });

  describe('Conventions : mise a jour et filtre par statut', () => {
    let conventionId: string;

    beforeAll(async () => {
      const reponse = await request(url())
        .post('/api/conventions')
        .set(...enteteBearer(presidence))
        .send({
          reference: 'CONV-REG-001',
          titre: 'Convention en attente de signature',
          statut: 'EN_ATTENTE_SIGNATURE',
          partenariat_id: partenariatId,
        })
        .expect(201);

      conventionId = donnees<any>(reponse.body).id;
    });

    it('accepte null sur les champs optionnels (payload normalise)', async () => {
      const reponse = await request(url())
        .patch(`/api/conventions/${conventionId}`)
        .set(...enteteBearer(presidence))
        .send({
          titre: 'Convention en attente de signature',
          description: null,
          date_signature: null,
          date_fin: null,
          projet_id: null,
        })
        .expect(200);

      expect(donnees<any>(reponse.body).description).toBeNull();
    });

    it('refuse les chaines vides (normalisation cote frontend requise)', async () => {
      await request(url())
        .patch(`/api/conventions/${conventionId}`)
        .set(...enteteBearer(presidence))
        .send({ date_fin: '', description: '' })
        .expect(400);
    });

    it('remonte les conventions EN_ATTENTE_SIGNATURE avec le filtre du frontend', async () => {
      const reponse = await request(url())
        .get('/api/conventions?statut=EN_ATTENTE_SIGNATURE&limit=50')
        .set(...enteteBearer(presidence))
        .expect(200);

      const liste = donnees<any>(reponse.body).data;
      expect(liste.length).toBeGreaterThan(0);
      expect(liste.every((c) => c.statut === 'EN_ATTENTE_SIGNATURE')).toBe(true);
      expect(liste.map((c) => c.id)).toContain(conventionId);
    });

    it('accepte le filtre titre', async () => {
      const reponse = await request(url())
        .get('/api/conventions?titre=attente&limit=50')
        .set(...enteteBearer(presidence))
        .expect(200);

      expect(donnees<any>(reponse.body).data.length).toBeGreaterThan(0);
    });
  });

  describe('Filtres de recherche des listes', () => {
    it('cotutelles : filtre nom_doctorant', async () => {
      await request(url())
        .get('/api/cotutelles?nom_doctorant=rakoto&limit=5')
        .set(...enteteBearer(presidence))
        .expect(200);
    });

    it('publications : filtre titre', async () => {
      await request(url())
        .get('/api/publications?titre=resultats&limit=5')
        .set(...enteteBearer(presidence))
        .expect(200);
    });

    it('documents : filtre nom', async () => {
      await request(url())
        .get('/api/documents?nom=rapport&limit=5')
        .set(...enteteBearer(presidence))
        .expect(200);
    });
  });

  describe('Documents : rattachement et listage', () => {
    let projetId: string;

    beforeAll(async () => {
      const reponse = await request(url())
        .post('/api/projets')
        .set(...enteteBearer(presidence))
        .send({
          nom: 'Projet documents',
          type: 'Recherche',
          date_debut: dateIsoDans(30),
          date_fin_prevue: dateIsoDans(800),
          etablissement_id: etablissementId,
        })
        .expect(201);

      projetId = donnees<any>(reponse.body).id;
    });

    it('refuse un document sans rattachement', async () => {
      const reponse = await request(url())
        .post('/api/documents')
        .set(...enteteBearer(presidence))
        .field('type', 'TDR')
        .attach('fichier', Buffer.from('%PDF-1.4 sans rattachement'), 'tdr.pdf')
        .expect(400);

      expect(String(reponse.body.message)).toContain('rattache');
    });

    it('accepte un document rattache a un projet', async () => {
      const reponse = await request(url())
        .post('/api/documents')
        .set(...enteteBearer(presidence))
        .field('type', 'TDR')
        .field('projet_id', projetId)
        .attach('fichier', Buffer.from('%PDF-1.4 rattache'), 'tdr-rattache.pdf')
        .expect(201);

      const document = donnees<any>(reponse.body);
      expect(document.projet_id).toBe(projetId);
      expect(document.version).toBe(1);
    });

    it('liste les documents du projet (GET /documents?projet_id)', async () => {
      const reponse = await request(url())
        .get(`/api/documents?projet_id=${projetId}&limit=10`)
        .set(...enteteBearer(presidence))
        .expect(200);

      const corps = donnees<any>(reponse.body);
      expect(Array.isArray(corps.data)).toBe(true);
      expect(corps.data.length).toBeGreaterThan(0);
      expect(corps.data[0].projet_id).toBe(projetId);
      expect(corps.meta.total).toBeGreaterThan(0);
    });

    it('liste les documents d une convention (GET /documents?convention_id)', async () => {
      const [convention] = await ctx.dataSource.query(
        `SELECT id FROM "Convention" LIMIT 1`,
      );

      await request(url())
        .post('/api/documents')
        .set(...enteteBearer(presidence))
        .field('type', 'CONVENTION')
        .field('convention_id', convention.id)
        .attach('fichier', Buffer.from('%PDF-1.4 convention'), 'conv.pdf')
        .expect(201);

      const reponse = await request(url())
        .get(`/api/documents?convention_id=${convention.id}&limit=10`)
        .set(...enteteBearer(presidence))
        .expect(200);

      expect(donnees<any>(reponse.body).data.length).toBeGreaterThan(0);
    });

    it('renvoie une version incrementee pour un meme document', async () => {
      const premiere = await request(url())
        .post('/api/documents')
        .set(...enteteBearer(presidence))
        .field('type', 'AUTRE')
        .field('nom_fichier', 'rapport-annuel.pdf')
        .field('projet_id', projetId)
        .attach('fichier', Buffer.from('%PDF-1.4 v1'), 'rapport-annuel.pdf')
        .expect(201);

      const seconde = await request(url())
        .post('/api/documents')
        .set(...enteteBearer(presidence))
        .field('type', 'AUTRE')
        .field('nom_fichier', 'rapport-annuel.pdf')
        .field('projet_id', projetId)
        .attach('fichier', Buffer.from('%PDF-1.4 v2'), 'rapport-annuel.pdf')
        .expect(201);

      const v1 = donnees<any>(premiere.body);
      const v2 = donnees<any>(seconde.body);

      expect(v2.version).toBe(v1.version + 1);
      expect(v2.est_archive).toBe(false);

      const ancienne = await request(url())
        .get(`/api/documents/${v1.id}`)
        .set(...enteteBearer(presidence))
        .expect(200);

      expect(donnees<any>(ancienne.body).est_archive).toBe(true);
    });
  });

  describe('Publications : photos', () => {
    let publicationId: string;

    beforeAll(async () => {
      const [projet] = await ctx.dataSource.query(
        `SELECT id FROM "Projet" LIMIT 1`,
      );

      const reponse = await request(url())
        .post('/api/publications')
        .set(...enteteBearer(presidence))
        .send({
          projet_id: projet.id,
          titre: 'Publication photos',
          description_publique: 'Verification des photos',
        })
        .expect(201);

      publicationId = donnees<any>(reponse.body).id;
    });

    const png = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000154a24f5f0000000049454e44ae426082',
      'hex',
    );

    it('accepte le champ fichier', async () => {
      const reponse = await request(url())
        .post(`/api/publications/${publicationId}/photos`)
        .set(...enteteBearer(presidence))
        .field('legende', 'Photo de terrain')
        .attach('fichier', png, 'photo.png')
        .expect(201);

      expect(donnees<any>(reponse.body).legende).toBe('Photo de terrain');
    });

    it('refuse l ancien nom de champ photo', async () => {
      await request(url())
        .post(`/api/publications/${publicationId}/photos`)
        .set(...enteteBearer(presidence))
        .attach('photo', png, 'photo.png')
        .expect(400);
    });

    it('liste les photos de la publication', async () => {
      const reponse = await request(url())
        .get(`/api/publications/${publicationId}/photos`)
        .set(...enteteBearer(presidence))
        .expect(200);

      const photos = donnees<any>(reponse.body);
      expect(photos).toHaveLength(1);
      expect(photos[0].url_fichier).toContain('/uploads/');
    });
  });
});
