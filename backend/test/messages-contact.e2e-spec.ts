/**
 * Formulaire de contact public -> espace interne (e2e).
 *
 * Verifie : validation des champs, enregistrement, isolement des messages
 * par etablissement, lecture et acces refuse aux autres roles.
 */
import request from 'supertest';
import { randomUUID } from 'crypto';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';
import { Etablissement } from '../src/etablissements/entities/etablissement.entity';
import { Utilisateur } from '../src/auth/entities/utilisateur.entity';
import { Role } from '../src/common/enums/role.enum';

describe('Messages de contact (e2e)', () => {
  let ctx: ApplicationTest;
  let etab1: Etablissement;
  let etab2: Etablissement;
  let userEtab1: Utilisateur;
  let userEtab2: Utilisateur;
  let presidence: Utilisateur;
  let decideur: Utilisateur;

  const url = () => ctx.app.getHttpServer();

  const valide = {
    nom: 'Jean Rakoto',
    email: 'Jean.Rakoto@Example.mg',
    sujet: 'Demande de partenariat',
    message: 'Bonjour, je souhaite échanger au sujet d’un partenariat.',
  };

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    const ds = ctx.dataSource;

    etab1 = await ds
      .getRepository(Etablissement)
      .save(
        ds
          .getRepository(Etablissement)
          .create({ nom: 'Faculté des sciences', sigle: 'FDS' }),
      );
    etab2 = await ds
      .getRepository(Etablissement)
      .save(
        ds
          .getRepository(Etablissement)
          .create({ nom: 'Faculté des lettres', sigle: 'FLSH' }),
      );

    const creerUser = (role: Role, etablissement_id: string | null) =>
      ds.getRepository(Utilisateur).save(
        ds.getRepository(Utilisateur).create({
          id: randomUUID(),
          email: `${randomUUID()}@test.mg`,
          password_hash: 'non-utilise',
          role,
          etablissement_id,
          actif: true,
        }),
      );

    userEtab1 = await creerUser(Role.ETABLISSEMENT, etab1.id);
    userEtab2 = await creerUser(Role.ETABLISSEMENT, etab2.id);
    presidence = await creerUser(Role.PRESIDENCE, null);
    decideur = await creerUser(Role.DECIDEUR, null);
  });

  afterAll(async () => {
    await ctx?.fermer();
  });

  it('refuse un message avec un nom invalide (400)', async () => {
    const r = await request(url())
      .post('/api/public/contact')
      .send({ ...valide, nom: 'Jean4' });
    expect(r.status).toBe(400);
  });

  it('refuse un téléphone invalide (400)', async () => {
    const r = await request(url())
      .post('/api/public/contact')
      .send({ ...valide, telephone: '00000000' });
    expect(r.status).toBe(400);
  });

  it('refuse un établissement destinataire inconnu (400)', async () => {
    const r = await request(url())
      .post('/api/public/contact')
      .send({ ...valide, etablissement_id: randomUUID() });
    expect(r.status).toBe(400);
  });

  it('enregistre un message destiné à l’établissement 1 (sans authentification)', async () => {
    const r = await request(url())
      .post('/api/public/contact')
      .send({
        ...valide,
        telephone: '034 22 330 54',
        etablissement_id: etab1.id,
      });
    expect(r.status).toBe(201);
    expect(donnees(r.body).id).toBeDefined();
    // Accusé de réception : pas de donnée personnelle renvoyée
    expect(donnees(r.body).email).toBeUndefined();
  });

  it('enregistre un message destiné à la Présidence', async () => {
    const r = await request(url())
      .post('/api/public/contact')
      .send({
        ...valide,
        sujet: 'Question générale',
        message: 'Message adressé à la Présidence.',
      });
    expect(r.status).toBe(201);
  });

  it('la Présidence voit les deux messages, avec l’e-mail normalisé et le téléphone en E.164', async () => {
    const r = await request(url())
      .get('/api/messages-contact')
      .set(...enteteBearer(presidence));
    expect(r.status).toBe(200);
    const liste = donnees(r.body).data;
    expect(liste).toHaveLength(2);
    const avecTel = liste.find((m: any) => m.telephone);
    expect(avecTel.telephone).toBe('+261342233054');
    expect(avecTel.email).toBe('jean.rakoto@example.mg');
    expect(avecTel.destinataire.nom).toBe('Faculté des sciences');
  });

  it('un établissement ne voit que le message qui lui est destiné', async () => {
    const r = await request(url())
      .get('/api/messages-contact')
      .set(...enteteBearer(userEtab1));
    expect(r.status).toBe(200);
    const liste = donnees(r.body).data;
    expect(liste).toHaveLength(1);
    expect(liste[0].destinataire.id).toBe(etab1.id);
  });

  it('un autre établissement ne voit aucun message de l’établissement 1', async () => {
    const r = await request(url())
      .get('/api/messages-contact')
      .set(...enteteBearer(userEtab2));
    expect(donnees(r.body).data).toHaveLength(0);

    const compte = await request(url())
      .get('/api/messages-contact/non-lus/count')
      .set(...enteteBearer(userEtab2));
    expect(donnees(compte.body).total).toBe(0);
  });

  it('compte les messages non lus puis les marque comme lus', async () => {
    const compte1 = await request(url())
      .get('/api/messages-contact/non-lus/count')
      .set(...enteteBearer(userEtab1));
    expect(donnees(compte1.body).total).toBe(1);

    const id = donnees<any>(
      (
        await request(url())
          .get('/api/messages-contact')
          .set(...enteteBearer(userEtab1))
          .expect(200)
      ).body,
    ).data[0].id;

    const lu = await request(url())
      .patch(`/api/messages-contact/${id}/lu`)
      .set(...enteteBearer(userEtab1));
    expect(lu.status).toBe(200);
    expect(donnees(lu.body).est_lu).toBe(true);
    expect(donnees(lu.body).date_lecture).toBeTruthy();

    const compte2 = await request(url())
      .get('/api/messages-contact/non-lus/count')
      .set(...enteteBearer(userEtab1));
    expect(donnees(compte2.body).total).toBe(0);
  });

  it('refuse à un établissement de marquer lu un message qui ne le concerne pas (404)', async () => {
    const presidenceListe = donnees<any>(
      (
        await request(url())
          .get('/api/messages-contact')
          .set(...enteteBearer(presidence))
          .expect(200)
      ).body,
    ).data;
    const messageSansEtab = presidenceListe.find(
      (m: any) => m.destinataire === null,
    );

    const r = await request(url())
      .patch(`/api/messages-contact/${messageSansEtab.id}/lu`)
      .set(...enteteBearer(userEtab1));
    expect(r.status).toBe(404);
  });

  it('refuse l’accès sans authentification (401) et aux autres rôles (403)', async () => {
    const anonyme = await request(url()).get('/api/messages-contact');
    expect(anonyme.status).toBe(401);

    const interdit = await request(url())
      .get('/api/messages-contact')
      .set(...enteteBearer(decideur));
    expect(interdit.status).toBe(403);
  });
});
