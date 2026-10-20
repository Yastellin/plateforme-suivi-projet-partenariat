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
    await ctx.dataSource.query(
      `UPDATE "Projet" SET statut = 'EN_COURS' WHERE id = $1`,
      [projetPublie.id],
    );

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
    await request(url())
      .patch(`/api/publications/${publicationId}/publier`)
      .set(...enteteBearer(presidence))
      .expect(200);

    // Projet brouillon avec une publication non publiee : rien ne doit apparaitre.
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
            titre: 'Publication non publiée',
          })
          .expect(201)
      ).body,
    ).id;

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

    await ctx.dataSource.query(
      `UPDATE "Partenaire" SET visibilite = 'PUBLIC', statut = 'ACTIF', description = $2 WHERE id = $1`,
      [partenairePublic.id, 'Partenaire historique de recherche.'],
    );
    await ctx.dataSource.query(
      `UPDATE "Partenaire" SET visibilite = 'PRIVE', statut = 'ACTIF' WHERE id = $1`,
      [partenairePrive.id],
    );
    await ctx.dataSource.query(
      `UPDATE "Partenaire" SET visibilite = 'PUBLIC', statut = 'SUSPENDU' WHERE id = $1`,
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

  it('accueil : compteurs calculés sur la base de données', async () => {
    const reponse = await request(url()).get('/api/public/accueil').expect(200);
    const accueil = donnees<any>(reponse.body);

    // Les compteurs doivent egaler les decomptes SQL : le jeu de demonstration
    // contient aussi des partenaires et des etablissements.
    const [{ n: partenaires }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS n FROM "Partenaire" WHERE visibilite = 'PUBLIC' AND statut = 'ACTIF' AND archive = false`,
    );
    const [{ n: etablissements }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS n FROM "Etablissement"`,
    );
    const [{ n: publications }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS n FROM "Publication" p JOIN "Projet" pr ON pr.id = p.projet_id WHERE p.statut = 'PUBLIEE' AND pr.archive = false`,
    );
    expect(accueil.compteurs.nombre_partenaires).toBe(partenaires);
    expect(accueil.compteurs.nombre_etablissements).toBe(etablissements);
    expect(accueil.compteurs.nombre_publications).toBe(publications);
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
    expect(JSON.stringify(liste)).not.toContain('Publication non publiée');
  });

  it('publication non publiee : introuvable (404)', async () => {
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
      `SELECT COUNT(*)::int AS n FROM "Partenaire" WHERE visibilite = 'PUBLIC' AND statut = 'ACTIF' AND archive = false`,
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
