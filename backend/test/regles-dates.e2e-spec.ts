/**
 * Regles de dates communes aux modules (projets, partenariats, conventions,
 * cotutelles) : une date de debut ne peut pas etre anterieure au jour courant
 * a la creation, et une echeance doit etre posterieure a la date de debut.
 *
 * La modification n'est pas soumise a la premiere regle : corriger une date
 * passee sur une ressource existante reste possible.
 */
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';
import { dateIsoDans } from './harness/dates';

const AUJOURDHUI = dateIsoDans(0);
const HIER = dateIsoDans(-1);
const DEMAIN = dateIsoDans(1);
const DANS_UN_MOIS = dateIsoDans(30);
const DANS_UN_AN = dateIsoDans(400);

// L'enveloppe d'erreur renvoie un message generique pour les 400 ; le detail
// des regles violees se trouve dans « errors ».
function detailErreur(corps: any): string {
  const erreurs = Array.isArray(corps?.errors) ? corps.errors.join(' ') : '';
  return `${corps?.message ?? ''} ${erreurs}`.trim();
}

describe('Regles de dates (e2e)', () => {
  let ctx: ApplicationTest;
  let presidence: any;
  let etablissementId: string;
  let partenaireId: string;
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

    const [etablissement] = await ctx.dataSource.query(
      `SELECT id FROM "Etablissement" LIMIT 1`,
    );
    etablissementId = etablissement.id;

    const [partenaire] = await ctx.dataSource.query(
      `SELECT id FROM "Partenaire" LIMIT 1`,
    );
    partenaireId = partenaire.id;

    const [partenariat] = await ctx.dataSource.query(
      `SELECT id FROM "Partenariat" LIMIT 1`,
    );
    partenariatId = partenariat.id;
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  const creerProjet = (dates: Record<string, string>) =>
    request(url())
      .post('/api/projets')
      .set(...enteteBearer(presidence))
      .send({
        nom: `Projet dates ${Date.now()}-${Math.random()}`,
        type: 'Recherche',
        etablissement_id: etablissementId,
        porteur: { type_porteur: 'PERSONNE', nom: 'Rakoto Soa' },
        ...dates,
      });

  const creerPartenariat = (dates: Record<string, string>) =>
    request(url())
      .post('/api/partenariats')
      .set(...enteteBearer(presidence))
      .send({
        intitule: `Partenariat dates ${Date.now()}-${Math.random()}`,
        domaine: 'RECHERCHE',
        etablissements_ids: [etablissementId],
        partenaires_ids: [partenaireId],
        ...dates,
      });

  const creerConvention = (dates: Record<string, string>) =>
    request(url())
      .post('/api/conventions')
      .set(...enteteBearer(presidence))
      .send({
        titre: 'Convention de test des dates',
        partenariat_id: partenariatId,
        ...dates,
      });

  const creerCotutelle = (dates: Record<string, string>) =>
    request(url())
      .post('/api/cotutelles')
      .set(...enteteBearer(presidence))
      .send({
        nom_doctorant: 'Rakoto Andry',
        type: 'COTUTELLE',
        etablissement_id: etablissementId,
        partenaire_id: partenaireId,
        ...dates,
      });

  describe('Creation : la date de debut ne peut pas etre passee', () => {
    it('projet : date de debut hier refusee', async () => {
      const reponse = await creerProjet({
        date_debut: HIER,
        date_fin_prevue: DANS_UN_AN,
      }).expect(400);

      expect(detailErreur(reponse.body)).toContain('date de début');
    });

    it('projet : date de debut aujourd hui acceptee', async () => {
      await creerProjet({
        date_debut: AUJOURDHUI,
        date_fin_prevue: DANS_UN_AN,
      }).expect(201);
    });

    it('partenariat : date de debut passee refusee, date du jour acceptee', async () => {
      await creerPartenariat({ date_debut: HIER, date_fin: DANS_UN_AN }).expect(
        400,
      );
      await creerPartenariat({
        date_debut: AUJOURDHUI,
        date_fin: DANS_UN_AN,
      }).expect(201);
    });

    it('convention : date de debut passee refusee, date du jour acceptee', async () => {
      await creerConvention({ date_debut: HIER, date_fin: DANS_UN_AN }).expect(
        400,
      );
      await creerConvention({
        date_debut: AUJOURDHUI,
        date_fin: DANS_UN_AN,
      }).expect(201);
    });

    it('cotutelle : date de debut passee refusee, date du jour acceptee', async () => {
      await creerCotutelle({
        date_debut: HIER,
        date_prevue_soutenance: DANS_UN_AN,
      }).expect(400);
      await creerCotutelle({
        date_debut: AUJOURDHUI,
        date_prevue_soutenance: DANS_UN_AN,
      }).expect(201);
    });
  });

  describe('Creation : l echeance suit la date de debut', () => {
    it('projet : date de fin identique ou anterieure refusee', async () => {
      await creerProjet({
        date_debut: DANS_UN_MOIS,
        date_fin_prevue: DANS_UN_MOIS,
      }).expect(400);
      const reponse = await creerProjet({
        date_debut: DANS_UN_MOIS,
        date_fin_prevue: DEMAIN,
      }).expect(400);

      expect(detailErreur(reponse.body)).toContain('date de fin');
    });

    it('partenariat : date de fin anterieure refusee', async () => {
      await creerPartenariat({
        date_debut: DANS_UN_MOIS,
        date_fin: DEMAIN,
      }).expect(400);
    });

    it('convention : date de fin anterieure refusee', async () => {
      await creerConvention({
        date_debut: DANS_UN_MOIS,
        date_fin: DEMAIN,
      }).expect(400);
    });

    it('cotutelle : date de soutenance anterieure refusee', async () => {
      await creerCotutelle({
        date_debut: DANS_UN_MOIS,
        date_prevue_soutenance: DEMAIN,
      }).expect(400);
    });

    it('cree les ressources quand l echeance est posterieure', async () => {
      await creerProjet({
        date_debut: DANS_UN_MOIS,
        date_fin_prevue: DANS_UN_AN,
      }).expect(201);
      await creerPartenariat({
        date_debut: DANS_UN_MOIS,
        date_fin: DANS_UN_AN,
      }).expect(201);
      await creerConvention({
        date_debut: DANS_UN_MOIS,
        date_fin: DANS_UN_AN,
      }).expect(201);
      await creerCotutelle({
        date_debut: DANS_UN_MOIS,
        date_prevue_soutenance: DANS_UN_AN,
      }).expect(201);
    });
  });

  describe('Modification : la date passee reste acceptee', () => {
    const creer = async () =>
      donnees<any>(
        (
          await creerConvention({
            date_debut: DANS_UN_MOIS,
            date_fin: DANS_UN_AN,
          }).expect(201)
        ).body,
      ).id as string;

    it('convention : date de debut passee acceptee en modification', async () => {
      const id = await creer();

      const reponse = await request(url())
        .patch(`/api/conventions/${id}`)
        .set(...enteteBearer(presidence))
        .send({ date_debut: HIER })
        .expect(200);

      expect(donnees<any>(reponse.body).date_debut).toContain(
        HIER.slice(0, 10),
      );
    });

    it('convention : echeance anterieure refusee meme en modification', async () => {
      const id = await creer();

      await request(url())
        .patch(`/api/conventions/${id}`)
        .set(...enteteBearer(presidence))
        .send({ date_debut: DANS_UN_MOIS, date_fin: DEMAIN })
        .expect(400);
    });

    it('convention : modification partielle sur la seule echeance acceptee', async () => {
      const id = await creer();

      await request(url())
        .patch(`/api/conventions/${id}`)
        .set(...enteteBearer(presidence))
        .send({ date_fin: DANS_UN_AN })
        .expect(200);
    });

    it('convention : une echeance partielle reste comparee a la date existante', async () => {
      const id = await creer();

      await request(url())
        .patch(`/api/conventions/${id}`)
        .set(...enteteBearer(presidence))
        .send({ date_fin: DEMAIN })
        .expect(400);
    });

    it('cotutelle : une soutenance partielle reste comparee a la date existante', async () => {
      const cotutelle = donnees<any>(
        (
          await creerCotutelle({
            date_debut: DANS_UN_MOIS,
            date_prevue_soutenance: DANS_UN_AN,
          }).expect(201)
        ).body,
      );

      await request(url())
        .patch(`/api/cotutelles/${cotutelle.id}`)
        .set(...enteteBearer(presidence))
        .send({ date_prevue_soutenance: DEMAIN })
        .expect(400);
    });

    it('projet : date de debut passee acceptee en modification', async () => {
      const projet = donnees<any>(
        (
          await creerProjet({
            date_debut: DANS_UN_MOIS,
            date_fin_prevue: DANS_UN_AN,
          }).expect(201)
        ).body,
      );

      await request(url())
        .patch(`/api/projets/${projet.id}`)
        .set(...enteteBearer(presidence))
        .send({ date_debut: HIER, nom: projet.nom })
        .expect(200);
    });
  });
});
