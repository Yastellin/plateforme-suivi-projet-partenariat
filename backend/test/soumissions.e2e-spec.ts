import request from 'supertest';
import {
  ApplicationTest,
  creerApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';

function dateDans(jours: number): string {
  return new Date(Date.now() + jours * 86_400_000).toISOString();
}

describe('Soumissions établissement et publication Présidence (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let etablissement: any;
  let etablissementId: string;
  let autreEtablissementId: string;
  let partenaireIndividuel: any;
  let partenaireMasse: any;
  let projetIndividuel: any;
  let projetMasse: any;
  let partenariatIndividuel: any;
  let partenariatMasse: any;

  const serveur = () => ctx.app.getHttpServer();
  const suffixe = () =>
    `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;

  async function creerPartenaire(nom: string, utilisateur = etablissement) {
    return donnees<any>(
      (
        await request(serveur())
          .post('/api/partenaires')
          .set(...enteteBearer(utilisateur))
          .send({
            nom,
            type: 'Université',
            pays: 'Madagascar',
            etablissement_id: etablissementId,
          })
          .expect(201)
      ).body,
    );
  }

  async function creerProjet(nom: string, utilisateur = etablissement) {
    return donnees<any>(
      (
        await request(serveur())
          .post('/api/projets')
          .set(...enteteBearer(utilisateur))
          .send({
            nom,
            type: 'Recherche',
            domaine: 'Agronomie',
            date_debut: dateDans(10),
            date_fin_prevue: dateDans(370),
            etablissement_id: etablissementId,
            porteur: {
              type_porteur: 'PERSONNE',
              nom: 'Rakoto Soa',
              institution_rattachement: 'Université de Toliara',
            },
          })
          .expect(201)
      ).body,
    );
  }

  async function creerPartenariat(
    intitule: string,
    partenaireId: string,
    utilisateur = etablissement,
  ) {
    return donnees<any>(
      (
        await request(serveur())
          .post('/api/partenariats')
          .set(...enteteBearer(utilisateur))
          .send({
            intitule,
            domaine: 'RECHERCHE',
            date_debut: dateDans(15),
            date_fin: dateDans(400),
            etablissements_ids:
              utilisateur.role === 'PRESIDENCE' ? [etablissementId] : [],
            partenaires_ids: [partenaireId],
          })
          .expect(201)
      ).body,
    );
  }

  async function verifierNotification(referenceId: string, type: string) {
    const [{ total }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS total
       FROM "Utilisateur"
       WHERE role = 'PRESIDENCE' AND actif = true`,
    );
    const notifications = await ctx.dataSource.query(
      `SELECT n.type, n.reference_id, u.role, u.actif
       FROM "Notification" n
       JOIN "Utilisateur" u ON u.id = n.utilisateur_id
       WHERE n.reference_id = $1`,
      [referenceId],
    );

    expect(notifications).toHaveLength(total);
    expect(notifications.every((item: any) => item.type === type)).toBe(true);
    expect(
      notifications.every(
        (item: any) => item.role === 'PRESIDENCE' && item.actif === true,
      ),
    ).toBe(true);
  }

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();
    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role, etablissement_id, actif FROM "Utilisateur"`,
    );
    presidence = utilisateurs.find((item: any) =>
      item.email.startsWith('presidence@'),
    );
    etablissement = utilisateurs.find((item: any) =>
      item.email.startsWith('fds@'),
    );
    etablissementId = etablissement.etablissement_id;
    const [autreEtablissement] = await ctx.dataSource.query(
      `SELECT id FROM "Etablissement" WHERE id <> $1 ORDER BY nom LIMIT 1`,
      [etablissementId],
    );
    autreEtablissementId = autreEtablissement.id;

    partenaireIndividuel = await creerPartenaire(
      `Université partenaire individuelle ${suffixe()}`,
    );
    partenaireMasse = await creerPartenaire(
      `Université partenaire en masse ${suffixe()}`,
    );
    projetIndividuel = await creerProjet(`Projet individuel ${suffixe()}`);
    projetMasse = await creerProjet(`Projet en masse ${suffixe()}`);
    partenariatIndividuel = await creerPartenariat(
      `Partenariat individuel ${suffixe()}`,
      partenaireIndividuel.id,
    );
    partenariatMasse = await creerPartenariat(
      `Partenariat en masse ${suffixe()}`,
      partenaireMasse.id,
    );
  }, 120_000);

  afterAll(async () => {
    await ctx.fermer();
  });

  it('autorise la création des référentiels du wizard par un établissement', async () => {
    const nom = suffixe();
    await request(serveur())
      .post('/api/referentiels/bailleurs')
      .set(...enteteBearer(etablissement))
      .send({ nom: `Fondation malgache ${nom}` })
      .expect(201);
    await request(serveur())
      .post('/api/referentiels/beneficiaires')
      .set(...enteteBearer(etablissement))
      .send({ nom: `Étudiants de Toliara ${nom}`, categorie: 'Étudiants' })
      .expect(201);
    await request(serveur())
      .post('/api/referentiels/sites')
      .set(...enteteBearer(etablissement))
      .send({ nom: `Campus de Maninday ${nom}` })
      .expect(201);
  });

  it('soumet individuellement les trois types et notifie tous les comptes Présidence actifs', async () => {
    const partenaire = donnees<any>(
      (
        await request(serveur())
          .post(`/api/partenaires/${partenaireIndividuel.id}/soumettre`)
          .set(...enteteBearer(etablissement))
          .expect(200)
      ).body,
    );
    const projet = donnees<any>(
      (
        await request(serveur())
          .post(`/api/projets/${projetIndividuel.id}/soumettre`)
          .set(...enteteBearer(etablissement))
          .expect(200)
      ).body,
    );
    const partenariat = donnees<any>(
      (
        await request(serveur())
          .post(`/api/partenariats/${partenariatIndividuel.id}/soumettre`)
          .set(...enteteBearer(etablissement))
          .expect(200)
      ).body,
    );

    expect(partenaire.soumis_le).toBeTruthy();
    expect(projet.soumis_le).toBeTruthy();
    expect(partenariat.soumis_le).toBeTruthy();
    await verifierNotification(partenaire.id, 'PARTENAIRE_SOUMIS');
    await verifierNotification(projet.id, 'PROJET_SOUMIS');
    await verifierNotification(partenariat.id, 'PARTENARIAT_SOUMIS');
  });

  it('soumet en masse les trois types avec un résultat explicite', async () => {
    const cas = [
      ['partenaires', partenaireMasse.id, 'PARTENAIRE_SOUMIS'],
      ['projets', projetMasse.id, 'PROJET_SOUMIS'],
      ['partenariats', partenariatMasse.id, 'PARTENARIAT_SOUMIS'],
    ] as const;

    for (const [ressource, id, typeNotification] of cas) {
      const resultat = donnees<any>(
        (
          await request(serveur())
            .post(`/api/${ressource}/soumettre`)
            .set(...enteteBearer(etablissement))
            .send({ ids: [id] })
            .expect(200)
        ).body,
      );
      expect(resultat).toEqual({ total: 1, reussis: [id], echecs: [] });
      await verifierNotification(id, typeNotification);
    }
  });

  it('verrouille les données établissement après soumission', async () => {
    await request(serveur())
      .patch(`/api/projets/${projetIndividuel.id}`)
      .set(...enteteBearer(etablissement))
      .send({ nom: 'Modification interdite' })
      .expect(403);
    await request(serveur())
      .patch(`/api/projets/${projetIndividuel.id}`)
      .set(...enteteBearer(presidence))
      .send({ nom: 'Modification Présidence interdite' })
      .expect(403);
    await request(serveur())
      .patch(`/api/partenaires/${partenaireIndividuel.id}`)
      .set(...enteteBearer(etablissement))
      .send({ description: 'Modification interdite' })
      .expect(409);
    await request(serveur())
      .post(`/api/partenaires/${partenaireIndividuel.id}/contacts`)
      .set(...enteteBearer(etablissement))
      .send({ nom: 'Rasoa Rakoto' })
      .expect(409);
    await request(serveur())
      .patch(`/api/partenariats/${partenariatIndividuel.id}`)
      .set(...enteteBearer(etablissement))
      .send({ objet: 'Modification interdite' })
      .expect(403);
  });

  it('permet à la Présidence de traiter une demande contrôlée de modification', async () => {
    const projet = await creerProjet(
      `Projet à rectifier après soumission ${suffixe()}`,
    );
    await request(serveur())
      .post(`/api/projets/${projet.id}/soumettre`)
      .set(...enteteBearer(etablissement))
      .expect(200);

    await request(serveur())
      .patch(`/api/projets/${projet.id}`)
      .set(...enteteBearer(etablissement))
      .send({ nom: 'Modification directe interdite' })
      .expect(403);

    await request(serveur())
      .post(`/api/projets/${projet.id}/demander-modification`)
      .set(...enteteBearer(etablissement))
      .send({ motif: 'Bref' })
      .expect(400);

    const motif =
      'Le devis actualisé du fournisseur de Toliara modifie le budget prévisionnel.';
    await request(serveur())
      .post(`/api/projets/${projet.id}/demander-modification`)
      .set(...enteteBearer(etablissement))
      .send({ motif })
      .expect(200);
    await request(serveur())
      .post(`/api/projets/${projet.id}/demander-modification`)
      .set(...enteteBearer(etablissement))
      .send({ motif })
      .expect(409);

    const demandes = await ctx.dataSource.query(
      `SELECT n.type, n.priorite, n.message, n.reference_type, u.role, u.actif
       FROM "Notification" n
       JOIN "Utilisateur" u ON u.id = n.utilisateur_id
       WHERE n.reference_id = $1
         AND n.reference_type = 'DEMANDE_MODIFICATION_PROJET'`,
      [projet.id],
    );
    const [{ total: totalPresidence }] = await ctx.dataSource.query(
      `SELECT COUNT(*)::int AS total
       FROM "Utilisateur"
       WHERE role = 'PRESIDENCE' AND actif = true`,
    );
    expect(demandes).toHaveLength(totalPresidence);
    expect(
      demandes.every(
        (demande: any) =>
          demande.type === 'CHANGEMENT_STATUT' &&
          demande.priorite === 'HAUTE' &&
          demande.role === 'PRESIDENCE' &&
          demande.actif === true &&
          demande.message.includes(motif),
      ),
    ).toBe(true);

    await request(serveur())
      .post(`/api/projets/${projet.id}/demande-modification/approuver`)
      .set(...enteteBearer(etablissement))
      .expect(403);

    await request(serveur())
      .post(`/api/projets/${projet.id}/demande-modification/rejeter`)
      .set(...enteteBearer(presidence))
      .expect(200);
    await request(serveur())
      .patch(`/api/projets/${projet.id}`)
      .set(...enteteBearer(etablissement))
      .send({ nom: 'Toujours verrouillé après le rejet' })
      .expect(403);

    const demandesRejetees = await ctx.dataSource.query(
      `SELECT n.est_lue, u.role
       FROM "Notification" n
       JOIN "Utilisateur" u ON u.id = n.utilisateur_id
       WHERE n.reference_id = $1
         AND n.reference_type = 'DEMANDE_MODIFICATION_PROJET_REJETEE'`,
      [projet.id],
    );
    const copiesPresidence = demandesRejetees.filter(
      (item: any) => item.role === 'PRESIDENCE',
    );
    expect(copiesPresidence).toHaveLength(demandes.length);
    expect(copiesPresidence.every((item: any) => item.est_lue)).toBe(true);
    expect(
      demandesRejetees.some(
        (item: any) => item.role === 'ETABLISSEMENT' && !item.est_lue,
      ),
    ).toBe(true);

    const projetPublie = donnees<any>(
      (
        await request(serveur())
          .post(`/api/projets/${projet.id}/publier`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );
    expect(projetPublie.statut).toBe('EN_COURS');
    expect(projetPublie.publie_le).toBeTruthy();

    await request(serveur())
      .post(`/api/projets/${projet.id}/demander-modification`)
      .set(...enteteBearer(etablissement))
      .send({
        motif:
          'La date de démarrage doit également être reportée après la saison des pluies.',
      })
      .expect(200);

    const resultat = donnees<any>(
      (
        await request(serveur())
          .post(`/api/projets/${projet.id}/demande-modification/approuver`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );
    expect(resultat).toMatchObject({
      projet_id: projet.id,
      decision: 'APPROUVEE',
      statut: 'BROUILLON',
    });

    const projetModifie = donnees<any>(
      (
        await request(serveur())
          .patch(`/api/projets/${projet.id}`)
          .set(...enteteBearer(etablissement))
          .send({ nom: `Projet rectifié par Rakoto ${suffixe()}` })
          .expect(200)
      ).body,
    );
    expect(projetModifie.statut).toBe('BROUILLON');
    expect(projetModifie.soumis_le).toBeNull();
    expect(projetModifie.publie_le).toBeNull();

    await request(serveur())
      .patch(`/api/projets/${projet.id}`)
      .set(...enteteBearer(presidence))
      .send({ nom: 'La Présidence ne devient pas propriétaire' })
      .expect(403);
  });

  it('réserve toute publication à la Présidence et exige une soumission pour les données établissement', async () => {
    const nonSoumis = await creerProjet(`Projet non soumis ${suffixe()}`);

    await request(serveur())
      .post(`/api/projets/${nonSoumis.id}/publier`)
      .set(...enteteBearer(presidence))
      .expect(409);
    await request(serveur())
      .post(`/api/projets/${projetIndividuel.id}/publier`)
      .set(...enteteBearer(etablissement))
      .expect(403);

    const projetPublie = donnees<any>(
      (
        await request(serveur())
          .post(`/api/projets/${projetIndividuel.id}/publier`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );
    const partenairePublie = donnees<any>(
      (
        await request(serveur())
          .post(`/api/partenaires/${partenaireIndividuel.id}/publier`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );
    const partenariatPublie = donnees<any>(
      (
        await request(serveur())
          .post(`/api/partenariats/${partenariatIndividuel.id}/publier`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );

    expect(projetPublie.publie_le).toBeTruthy();
    expect(partenairePublie.publie_le).toBeTruthy();
    expect(partenariatPublie.publie_le).toBeTruthy();

    const projetsPublics = donnees<any>(
      (await request(serveur()).get('/api/public/projets').expect(200)).body,
    );
    expect(projetsPublics.data.map((item: any) => item.id)).toContain(
      projetIndividuel.id,
    );
    const partenariatsPublics = donnees<any>(
      (await request(serveur()).get('/api/public/partenariats').expect(200))
        .body,
    );
    expect(partenariatsPublics.map((item: any) => item.id)).toContain(
      partenariatIndividuel.id,
    );

    // Défense en profondeur pour les anciennes données incohérentes : un
    // partenariat repassé en brouillon ne doit plus rester public.
    await ctx.dataSource.query(
      `UPDATE "Partenariat" SET statut = 'BROUILLON' WHERE id = $1`,
      [partenariatIndividuel.id],
    );
    const partenariatsApres = donnees<any>(
      (await request(serveur()).get('/api/public/partenariats').expect(200))
        .body,
    );
    expect(partenariatsApres.map((item: any) => item.id)).not.toContain(
      partenariatIndividuel.id,
    );
  });

  it("ne présente aucune action de soumission à la Présidence au niveau de l'API", async () => {
    const routes = [
      `/api/projets/${projetMasse.id}/soumettre`,
      `/api/partenaires/${partenaireMasse.id}/soumettre`,
      `/api/partenariats/${partenariatMasse.id}/soumettre`,
    ];
    for (const route of routes) {
      await request(serveur())
        .post(route)
        .set(...enteteBearer(presidence))
        .expect(403);
    }
    for (const ressource of ['projets', 'partenaires', 'partenariats']) {
      await request(serveur())
        .post(`/api/${ressource}/soumettre`)
        .set(...enteteBearer(presidence))
        .send({ ids: [projetMasse.id] })
        .expect(403);
    }
  });

  it('publie directement les données créées par la Présidence et les protège contre un établissement', async () => {
    const partenairePresidence = await creerPartenaire(
      `Partenaire Présidence ${suffixe()}`,
      presidence,
    );
    const projetPresidence = await creerProjet(
      `Projet Présidence ${suffixe()}`,
      presidence,
    );
    const partenariatPresidence = await creerPartenariat(
      `Partenariat Présidence ${suffixe()}`,
      partenairePresidence.id,
      presidence,
    );

    await request(serveur())
      .patch(`/api/projets/${projetPresidence.id}`)
      .set(...enteteBearer(etablissement))
      .send({ nom: 'Modification interdite' })
      .expect(403);

    await request(serveur())
      .patch(`/api/projets/${projetPresidence.id}`)
      .set(...enteteBearer(presidence))
      .send({ statut: 'EN_COURS' })
      .expect(200);
    const projetPresidenceModifie = donnees<any>(
      (
        await request(serveur())
          .patch(`/api/projets/${projetPresidence.id}`)
          .set(...enteteBearer(presidence))
          .send({ nom: `Projet Présidence modifié ${suffixe()}` })
          .expect(200)
      ).body,
    );
    expect(projetPresidenceModifie.statut).toBe('EN_COURS');
    expect(projetPresidenceModifie.nom).toContain('Projet Présidence modifié');

    await request(serveur())
      .patch(`/api/partenaires/${partenairePresidence.id}`)
      .set(...enteteBearer(etablissement))
      .send({ description: 'Modification interdite' })
      .expect(403);
    await request(serveur())
      .patch(`/api/partenariats/${partenariatPresidence.id}`)
      .set(...enteteBearer(etablissement))
      .send({ objet: 'Modification interdite' })
      .expect(403);

    const partenariatMisAJour = donnees<any>(
      (
        await request(serveur())
          .patch(`/api/partenariats/${partenariatPresidence.id}`)
          .set(...enteteBearer(presidence))
          .send({
            etablissements_ids: [autreEtablissementId],
            partenaires_ids: [partenaireMasse.id],
          })
          .expect(200)
      ).body,
    );
    expect(
      partenariatMisAJour.etablissements.map((item: any) => item.id),
    ).toEqual([autreEtablissementId]);
    expect(partenariatMisAJour.partenaires.map((item: any) => item.id)).toEqual(
      [partenaireMasse.id],
    );

    const projetPublie = donnees<any>(
      (
        await request(serveur())
          .post(`/api/projets/${projetPresidence.id}/publier`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );
    const partenairePublie = donnees<any>(
      (
        await request(serveur())
          .post(`/api/partenaires/${partenairePresidence.id}/publier`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );
    const partenariatPublie = donnees<any>(
      (
        await request(serveur())
          .post(`/api/partenariats/${partenariatPresidence.id}/publier`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );

    expect(projetPublie.soumis_le).toBeNull();
    expect(projetPublie.publie_le).toBeTruthy();
    expect(partenairePublie.soumis_le).toBeNull();
    expect(partenairePublie.publie_le).toBeTruthy();
    await request(serveur())
      .patch(`/api/partenaires/${partenairePresidence.id}`)
      .set(...enteteBearer(presidence))
      .send({ statut: 'SUSPENDU' })
      .expect(200);
    const partenaireSuspenduModifie = donnees<any>(
      (
        await request(serveur())
          .patch(`/api/partenaires/${partenairePresidence.id}`)
          .set(...enteteBearer(presidence))
          .send({ description: 'Partenaire en réévaluation' })
          .expect(200)
      ).body,
    );
    expect(partenaireSuspenduModifie.statut).toBe('SUSPENDU');
    expect(partenaireSuspenduModifie.visibilite).toBe('PUBLIC');
    expect(partenariatPublie.soumis_le).toBeNull();
    expect(partenariatPublie.publie_le).toBeTruthy();

    const partenariatPublieModifie = donnees<any>(
      (
        await request(serveur())
          .patch(`/api/partenariats/${partenariatPresidence.id}`)
          .set(...enteteBearer(presidence))
          .send({ objet: 'Coopération scientifique actualisée' })
          .expect(200)
      ).body,
    );
    expect(partenariatPublieModifie.statut).toBe('EN_COURS');
    expect(partenariatPublieModifie.publie_le).toBeTruthy();
  });

  it("historise l'archivage et la restauration, réservée à la Présidence", async () => {
    await request(serveur())
      .post(`/api/partenaires/${partenaireMasse.id}/archiver`)
      .set(...enteteBearer(presidence))
      .expect(200);

    const historiqueArchive = donnees<any[]>(
      (
        await request(serveur())
          .get(`/api/archives/partenaires/${partenaireMasse.id}/historique`)
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    );
    expect(historiqueArchive.map((item) => item.action)).toContain('ARCHIVAGE');

    await request(serveur())
      .post(`/api/archives/partenaires/${partenaireMasse.id}/restaurer`)
      .set(...enteteBearer(etablissement))
      .expect(403);
    await request(serveur())
      .post(`/api/archives/partenaires/${partenaireMasse.id}/restaurer`)
      .set(...enteteBearer(presidence))
      .expect(200);

    const actions = await ctx.dataSource.query(
      `SELECT action FROM "HistoriqueAction"
       WHERE entite_type = 'Partenaire' AND entite_id = $1`,
      [partenaireMasse.id],
    );
    expect(actions.map((item: any) => item.action)).toEqual(
      expect.arrayContaining(['ARCHIVAGE', 'RESTAURATION']),
    );
  });
});
