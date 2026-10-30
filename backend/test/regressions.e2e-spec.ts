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
  let compteEtablissement: any;
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
    compteEtablissement = utilisateurs.find((u: any) =>
      u.email.startsWith('fds@'),
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
      const [site] = await ctx.dataSource.query(
        `SELECT id FROM "Site" LIMIT 1`,
      );

      const reponse = await request(url())
        .post('/api/projets')
        .set(...enteteBearer(presidence))
        .send({
          nom: 'Projet listes rattachees',
          type: 'Recherche',
          date_debut: dateIsoDans(30),
          date_fin_prevue: dateIsoDans(800),
          etablissement_id: etablissementId,
          porteur: { type_porteur: 'PERSONNE', nom: 'Rakoto Soa' },
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
          porteur: { type_porteur: 'PERSONNE', nom: 'Rakoto Soa' },
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
      expect(liste.every((c) => c.statut === 'EN_ATTENTE_SIGNATURE')).toBe(
        true,
      );
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
    let cotutelleId: string;
    let documentProjet: any;

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
          porteur: { type_porteur: 'PERSONNE', nom: 'Rakoto Soa' },
        })
        .expect(201);

      projetId = donnees<any>(reponse.body).id;

      const [partenaire] = await ctx.dataSource.query(
        `SELECT id FROM "Partenaire" WHERE archive = false LIMIT 1`,
      );
      const cotutelle = await request(url())
        .post('/api/cotutelles')
        .set(...enteteBearer(presidence))
        .send({
          nom_doctorant: 'Rasoa Rakoto',
          type: 'COTUTELLE',
          date_debut: dateIsoDans(30),
          etablissement_id: etablissementId,
          partenaire_id: partenaire.id,
        })
        .expect(201);
      cotutelleId = donnees<any>(cotutelle.body).id;
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
      documentProjet = document;
      expect(document.projet_id).toBe(projetId);
      expect(document.version).toBe(1);
      expect(document.nom_fichier).toBe('tdr-rattache.pdf');
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

    it('préserve le nom et l extension au téléchargement', async () => {
      const reponse = await request(url())
        .get(`/api/documents/${documentProjet.id}/telecharger`)
        .set(...enteteBearer(presidence))
        .expect(200);

      expect(reponse.headers['content-disposition']).toContain(
        'tdr-rattache.pdf',
      );
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

    it('rattache et filtre les documents de cotutelle et de partenariat', async () => {
      const cas = [
        ['cotutelle_id', cotutelleId],
        ['partenariat_id', partenariatId],
      ] as const;

      for (const [champ, parentId] of cas) {
        const televersement = await request(url())
          .post('/api/documents')
          .set(...enteteBearer(presidence))
          .field('type', 'AUTRE')
          .field(champ, parentId)
          .attach('fichier', Buffer.from(`%PDF-1.4 ${champ}`), `${champ}.pdf`)
          .expect(201);
        const document = donnees<any>(televersement.body);
        expect(document[champ]).toBe(parentId);

        const liste = donnees<any>(
          (
            await request(url())
              .get(`/api/documents?${champ}=${parentId}&limit=10`)
              .set(...enteteBearer(presidence))
              .expect(200)
          ).body,
        );
        expect(liste.data.map((item: any) => item.id)).toContain(document.id);
      }
    });

    it('refuse plusieurs rattachements pour un même document, y compris en base', async () => {
      await request(url())
        .post('/api/documents')
        .set(...enteteBearer(presidence))
        .field('type', 'AUTRE')
        .field('projet_id', projetId)
        .field('partenariat_id', partenariatId)
        .attach('fichier', Buffer.from('%PDF-1.4 deux parents'), 'invalide.pdf')
        .expect(400);

      const [convention] = await ctx.dataSource.query(
        `SELECT id FROM "Convention" LIMIT 1`,
      );
      await expect(
        ctx.dataSource.query(
          `UPDATE "Document" SET convention_id = $1 WHERE id = $2`,
          [convention.id, documentProjet.id],
        ),
      ).rejects.toThrow();
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

      const listeCourante = await request(url())
        .get(`/api/documents?projet_id=${projetId}&type=AUTRE`)
        .set(...enteteBearer(presidence))
        .expect(200);
      expect(donnees<any>(listeCourante.body).data).toHaveLength(1);
      expect(donnees<any>(listeCourante.body).data[0].id).toBe(v2.id);

      await request(url())
        .get(`/api/documents/${v1.id}`)
        .set(...enteteBearer(presidence))
        .expect(404);

      const ancienne = await request(url())
        .get(`/api/archives/documents/${v1.id}`)
        .set(...enteteBearer(presidence))
        .expect(200);
      expect(donnees<any>(ancienne.body).est_archive).toBe(true);

      const telechargementArchive = await request(url())
        .get(`/api/archives/documents/${v1.id}/telecharger`)
        .set(...enteteBearer(presidence))
        .expect(200);
      expect(telechargementArchive.headers['content-disposition']).toContain(
        'rapport-annuel.pdf',
      );

      const historiqueVersions = await request(url())
        .get(`/api/documents/${v2.id}/versions`)
        .set(...enteteBearer(presidence))
        .expect(200);
      expect(
        donnees<any[]>(historiqueVersions.body).map((item) => item.id),
      ).toEqual([v2.id, v1.id]);

      await request(url())
        .post(`/api/archives/documents/${v1.id}/restaurer`)
        .set(...enteteBearer(presidence))
        .expect(200);
      await request(url())
        .get(`/api/documents/${v1.id}`)
        .set(...enteteBearer(presidence))
        .expect(200);
      await request(url())
        .get(`/api/documents/${v2.id}`)
        .set(...enteteBearer(presidence))
        .expect(404);

      await request(url())
        .delete(`/api/documents/${v1.id}`)
        .set(...enteteBearer(presidence))
        .expect(200);
      const historiqueArchive = await request(url())
        .get(`/api/archives/documents/${v1.id}/historique`)
        .set(...enteteBearer(presidence))
        .expect(200);
      expect(
        donnees<any[]>(historiqueArchive.body).map((item) => item.action),
      ).toEqual(expect.arrayContaining(['ARCHIVAGE', 'RESTAURATION']));

      await request(url())
        .post(`/api/archives/documents/${v2.id}/restaurer`)
        .set(...enteteBearer(presidence))
        .expect(200);
      await request(url())
        .get(`/api/documents/${v2.id}`)
        .set(...enteteBearer(presidence))
        .expect(200);
    });
  });

  describe('Publications : photos', () => {
    let publicationId: string;
    let photoId: string;

    beforeAll(async () => {
      const [projet] = await ctx.dataSource.query(
        `SELECT projet.id FROM "Projet" projet
         LEFT JOIN "Publication" publication ON publication.projet_id = projet.id
         WHERE publication.id IS NULL
         LIMIT 1`,
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

      const photo = donnees<any>(reponse.body);
      photoId = photo.id;
      expect(photo.legende).toBe('Photo de terrain');
      expect(photo.ordre).toBe(0);
    });

    it('refuse l ancien nom de champ photo', async () => {
      await request(url())
        .post(`/api/publications/${publicationId}/photos`)
        .set(...enteteBearer(presidence))
        .attach('photo', png, 'photo.png')
        .expect(400);
    });

    it("modifie la légende facultative et l'ordre", async () => {
      const reponse = await request(url())
        .patch(`/api/photos/${photoId}`)
        .set(...enteteBearer(presidence))
        .send({ legende: '', ordre: 4 })
        .expect(200);

      expect(donnees<any>(reponse.body)).toMatchObject({
        id: photoId,
        legende: null,
        ordre: 4,
      });

      await request(url())
        .patch(`/api/photos/${photoId}`)
        .set(...enteteBearer(compteEtablissement))
        .send({ legende: 'Modification interdite' })
        .expect(403);
    });

    it('liste les photos de la publication', async () => {
      const reponse = await request(url())
        .get(`/api/publications/${publicationId}/photos`)
        .set(...enteteBearer(presidence))
        .expect(200);

      const photos = donnees<any>(reponse.body);
      expect(photos).toHaveLength(1);
      expect(photos[0]).toMatchObject({ legende: null, ordre: 4 });
      expect(photos[0].url_fichier).toContain('/uploads/');
    });
  });
});
