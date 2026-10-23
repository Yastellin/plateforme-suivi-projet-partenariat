import request from 'supertest';
import { randomUUID } from 'crypto';
import {
  ApplicationTest,
  creerApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';

// Espace public : donnees reelles, regles de visibilite et absence de
// donnees sensibles (budget, contacts).

function chargeProjet(nom: string, etablissementId?: string) {
  const aujourdHui = new Date();
  const dans = (jours: number) =>
    new Date(aujourdHui.getTime() + jours * 86400000).toISOString();
  return {
    nom,
    type: 'Recherche',
    domaine: 'Biologie',
    budget: 12000,
    date_debut: dans(15),
    date_fin_prevue: dans(400),
    porteur: {
      type_porteur: 'PERSONNE',
      nom: 'Rakoto Soa',
      institution_rattachement: 'Université de Toliara',
    },
    ...(etablissementId ? { etablissement_id: etablissementId } : {}),
  };
}

describe('Espace public (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let etablissementFds: any;
  let etablissementFdsId: string;
  let projetPublie: any;
  let projetBrouillon: any;
  let publicationId: string;
  let brouillonPublicationId: string;
  let partenairePublic: any;
  let partenairePrive: any;
  let partenaireSuspendu: any;

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
    etablissementFds = utilisateurs.find((u: any) =>
      u.email.startsWith('fds@'),
    );
    etablissementFdsId = etablissementFds.etablissement_id;

    // Projet publie : en cours, avec une publication publiee par la Presidence.
    projetPublie = donnees<any>(
      (
        await request(url())
          .post('/api/projets')
          .set(...enteteBearer(etablissementFds))
          .send(chargeProjet('Projet Biodiversité publique'))
          .expect(201)
      ).body,
    );
    await request(url())
      .post(`/api/projets/${projetPublie.id}/soumettre`)
      .set(...enteteBearer(etablissementFds))
      .expect(200);
    await request(url())
      .post(`/api/projets/${projetPublie.id}/publier`)
      .set(...enteteBearer(presidence))
      .expect(200);

    const publication = donnees<any>(
      (
        await request(url())
          .post('/api/publications')
          .set(...enteteBearer(presidence))
          .send({
            projet_id: projetPublie.id,
            titre: 'Premiers résultats de biodiversité',
            description_publique: 'Retour sur la première année du projet.',
          })
          .expect(201)
      ).body,
    );
    publicationId = publication.id;
    const photoPng = Buffer.from(
      '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6360000002000154a24f5f0000000049454e44ae426082',
      'hex',
    );
    await request(url())
      .post(`/api/publications/${publicationId}/photos`)
      .set(...enteteBearer(presidence))
      .field('legende', 'Terrain à Toliara')
      .attach('fichier', photoPng, 'toliara.png')
      .expect(201);
    await request(url())
      .patch(`/api/publications/${publicationId}/publier`)
      .set(...enteteBearer(presidence))
      .expect(200);

    // Même si son contenu éditorial est publié, un projet qui n'a pas été
    // publié par le workflow de la Présidence doit rester invisible.
    projetBrouillon = donnees<any>(
      (
        await request(url())
          .post('/api/projets')
          .set(...enteteBearer(etablissementFds))
          .send(
            chargeProjet('Projet brouillon confidentiel', etablissementFdsId),
          )
          .expect(201)
      ).body,
    );
    brouillonPublicationId = donnees<any>(
      (
        await request(url())
          .post('/api/publications')
          .set(...enteteBearer(presidence))
          .send({
            projet_id: projetBrouillon.id,
            titre: 'Publication d’un projet non publié',
          })
          .expect(201)
      ).body,
    ).id;
    await request(url())
      .patch(`/api/publications/${brouillonPublicationId}`)
      .set(...enteteBearer(presidence))
      .send({ statut: 'PUBLIEE' })
      .expect(409);
    await request(url())
      .patch(`/api/publications/${brouillonPublicationId}/publier`)
      .set(...enteteBearer(presidence))
      .expect(409);
    // Défense en profondeur : même une donnée héritée incohérente ne doit pas
    // contourner le filtre public.
    await ctx.dataSource.query(
      `UPDATE "Publication" SET statut = 'PUBLIEE', date_publication = NOW() WHERE id = $1`,
      [brouillonPublicationId],
    );

    // Partenaires : un public actif, un prive, un public suspendu.
    const creerPartenaire = async (nom: string) =>
      donnees<any>(
        (
          await request(url())
            .post('/api/partenaires')
            .set(...enteteBearer(etablissementFds))
            .send({
              nom,
              type: 'Université',
              pays: 'Madagascar',
              etablissement_id: etablissementFdsId,
            })
            .expect(201)
        ).body,
      );
    partenairePublic = await creerPartenaire('Partenaire Public Actif');
    partenairePrive = await creerPartenaire('Partenaire Privé');
    partenaireSuspendu = await creerPartenaire('Partenaire Suspendu');

    for (const partenaire of [partenairePublic, partenaireSuspendu]) {
      await request(url())
        .post(`/api/partenaires/${partenaire.id}/soumettre`)
        .set(...enteteBearer(etablissementFds))
        .expect(200);
      await request(url())
        .post(`/api/partenaires/${partenaire.id}/publier`)
        .set(...enteteBearer(presidence))
        .expect(200);
    }

    await ctx.dataSource.query(
      `UPDATE "Partenaire" SET statut = 'ACTIF', description = $2 WHERE id = $1`,
      [partenairePublic.id, 'Partenaire historique de recherche.'],
    );
    await ctx.dataSource.query(
      `UPDATE "Partenaire" SET visibilite = 'PRIVE', statut = 'ACTIF' WHERE id = $1`,
      [partenairePrive.id],
    );
    await ctx.dataSource.query(
      `UPDATE "Partenaire" SET statut = 'SUSPENDU' WHERE id = $1`,
      [partenaireSuspendu.id],
    );

    // Les trois partenaires sont lies au projet publie.
    for (const p of [partenairePublic, partenairePrive, partenaireSuspendu]) {
      await ctx.dataSource.query(
        `INSERT INTO "ProjetPartenaire" (id, projet_id, partenaire_id) VALUES ($1, $2, $3)`,
        [randomUUID(), projetPublie.id, p.id],
      );
    }
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  it('configuration : expose uniquement le logo de la Présidence', async () => {
    await ctx.dataSource.query(
      `INSERT INTO "Configuration" (id, cle, valeur, logo_url, created_at, updated_at)
       VALUES ($1, 'presidence', 'parametre-interne', '/uploads/logos/presidence/logo.png', NOW(), NOW())
       ON CONFLICT (cle) DO UPDATE SET valeur = EXCLUDED.valeur, logo_url = EXCLUDED.logo_url, updated_at = NOW()`,
      [randomUUID()],
    );

    const reponse = await request(url())
      .get('/api/public/configuration')
      .expect(200);
    const configuration = donnees<any>(reponse.body);

    expect(configuration).toEqual({
      logo_url: '/uploads/logos/presidence/logo.png',
    });
    expect(configuration).not.toHaveProperty('valeur');

    const configurationInterne = donnees<any>(
      (
        await request(url())
          .get('/api/configuration')
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );
    expect(configurationInterne.logo_url).toBe(
      '/uploads/logos/presidence/logo.png',
    );
    expect(configurationInterne.valeur).toBe('parametre-interne');
  });

  it('accueil : compteurs calculés sur la base de données', async () => {
    const reponse = await request(url()).get('/api/public/accueil').expect(200);
    const accueil = donnees<any>(reponse.body);

    // Les compteurs doivent egaler les decomptes SQL : le jeu de demonstration
    // contient aussi des partenaires et des etablissements.
    const [{ n: partenaires }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS n FROM "Partenaire" WHERE visibilite = 'PUBLIC' AND statut = 'ACTIF' AND archive = false AND publie_le IS NOT NULL`,
    );
    const [{ n: etablissements }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS n FROM "Etablissement"`,
    );
    const [{ n: publications }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS n FROM "Publication" p JOIN "Projet" pr ON pr.id = p.projet_id WHERE p.statut = 'PUBLIEE' AND pr.archive = false AND pr.publie_le IS NOT NULL`,
    );
    const [{ n: projetsEnCours }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS n FROM "Projet" WHERE archive = false AND statut = 'EN_COURS' AND publie_le IS NOT NULL`,
    );
    expect(accueil.compteurs.nombre_partenaires).toBe(partenaires);
    expect(accueil.compteurs.nombre_etablissements).toBe(etablissements);
    expect(accueil.compteurs.nombre_publications).toBe(publications);
    expect(accueil.compteurs.nombre_projets_actifs).toBe(projetsEnCours);
    expect(accueil.compteurs.nombre_publications).toBe(1);

    expect(accueil.dernieres_publications.map((p: any) => p.id)).toContain(
      publicationId,
    );
    const aLaUne = accueil.partenaires_a_la_une.map((p: any) => p.id);
    expect(aLaUne).toContain(partenairePublic.id);
    expect(aLaUne).not.toContain(partenairePrive.id);
    expect(aLaUne).not.toContain(partenaireSuspendu.id);
  });

  it('publications : uniquement celles publiees par la Presidence', async () => {
    const reponse = await request(url())
      .get('/api/public/publications')
      .expect(200);

    const liste = donnees<any>(reponse.body);
    expect(liste.meta.total).toBe(1);
    expect(liste.data[0].id).toBe(publicationId);
    expect(liste.data[0].projet.etablissement.id).toBe(etablissementFdsId);
    expect(liste.data[0].photo_url).toMatch(/^\/uploads\/publications\//);
    expect(liste.data[0].photos[0]).toMatchObject({
      legende: 'Terrain à Toliara',
    });
    expect(JSON.stringify(liste)).not.toContain(
      'Publication d’un projet non publié',
    );
  });

  it('publication publiée rattachée à un projet non publié : introuvable (404)', async () => {
    await request(url())
      .get(`/api/public/publications/${brouillonPublicationId}`)
      .expect(404);
  });

  it('projets : hors brouillons, avec description et partenaires publics seulement', async () => {
    const reponse = await request(url()).get('/api/public/projets').expect(200);
    const liste = donnees<any>(reponse.body);

    const ids = liste.data.map((p: any) => p.id);
    expect(ids).toContain(projetPublie.id);
    expect(ids).not.toContain(projetBrouillon.id);

    const projet = liste.data.find((p: any) => p.id === projetPublie.id);
    expect(projet.description).toBe('Retour sur la première année du projet.');
    expect(projet.partenaires.map((p: any) => p.id)).toEqual([
      partenairePublic.id,
    ]);
    // Donnees sensibles jamais exposees
    expect(projet).not.toHaveProperty('budget');
    expect(projet).not.toHaveProperty('contacts');
  });

  it('projets : recherche par nom', async () => {
    const reponse = await request(url())
      .get('/api/public/projets?recherche=biodiversit')
      .expect(200);
    const ids = donnees<any>(reponse.body).data.map((p: any) => p.id);
    expect(ids).toEqual([projetPublie.id]);
  });

  it('partenaires : seuls les partenaires publics et actifs', async () => {
    const reponse = await request(url())
      .get('/api/public/partenaires')
      .expect(200);
    const liste = donnees<any>(reponse.body);
    const ids = liste.data.map((p: any) => p.id);
    expect(ids).toContain(partenairePublic.id);
    expect(ids).not.toContain(partenairePrive.id);
    expect(ids).not.toContain(partenaireSuspendu.id);
    expect(
      liste.data.find((p: any) => p.id === partenairePublic.id).description,
    ).toBe('Partenaire historique de recherche.');
    const [{ n }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS n FROM "Partenaire" WHERE visibilite = 'PUBLIC' AND statut = 'ACTIF' AND archive = false AND publie_le IS NOT NULL`,
    );
    expect(liste.meta.total).toBe(n);
  });

  it('etablissements : liste paginee avec meta', async () => {
    const reponse = await request(url())
      .get('/api/public/etablissements?limit=1')
      .expect(200);
    const liste = donnees<any>(reponse.body);
    expect(liste.data).toHaveLength(1);
    expect(liste.meta.limit).toBe(1);
    expect(liste.meta.total).toBeGreaterThanOrEqual(2);
  });

  it('projet archive : ses publications disparaissent de l’espace public', async () => {
    await ctx.dataSource.query(
      `UPDATE "Projet" SET archive = true WHERE id = $1`,
      [projetPublie.id],
    );
    const reponse = await request(url())
      .get('/api/public/publications')
      .expect(200);
    expect(donnees<any>(reponse.body).meta.total).toBe(0);
    await request(url())
      .get(`/api/public/publications/${publicationId}`)
      .expect(404);
    await ctx.dataSource.query(
      `UPDATE "Projet" SET archive = false WHERE id = $1`,
      [projetPublie.id],
    );
  });
});
