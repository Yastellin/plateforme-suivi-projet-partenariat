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
import { Notification } from '../src/notifications/entities/notification.entity';
import { TypeNotification } from '../src/common/enums/type-notification.enum';
import { MAIL_PORT, type MailPort } from '../src/mail/mail.port';

// Les notifications et e-mails sont envoyes en arriere-plan : on attend
// leur apparition (les envois sont asynchrones par conception).
async function attendre<T>(
  lire: () => Promise<T>,
  pret: (v: T) => boolean,
  delaiMs = 3000,
): Promise<T> {
  const fin = Date.now() + delaiMs;
  let valeur = await lire();
  while (!pret(valeur) && Date.now() < fin) {
    await new Promise((r) => setTimeout(r, 50));
    valeur = await lire();
  }
  return valeur;
}

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

  describe('Notifications et e-mails', () => {
    let mail: MailPort;
    let espion: jest.SpyInstance;

    beforeAll(() => {
      mail = ctx.app.get<MailPort>(MAIL_PORT);
      espion = jest.spyOn(mail, 'envoyer');
    });

    afterAll(() => espion.mockRestore());

    const notificationsDe = (messageId: string) =>
      ctx.dataSource.getRepository(Notification).find({
        where: { reference_type: 'MessageContact', reference_id: messageId },
      });

    it('un message pour un établissement notifie ses utilisateurs uniquement', async () => {
      const r = await request(url())
        .post('/api/public/contact')
        .send({
          ...valide,
          sujet: 'Message pour la faculté',
          message: 'Bonjour, question pour la faculté des sciences.',
          etablissement_id: etab1.id,
        });
      expect(r.status).toBe(201);
      const messageId = donnees(r.body).id;

      const notifs = await attendre(
        () => notificationsDe(messageId),
        (n) => n.length > 0,
      );
      expect(notifs).toHaveLength(1);
      expect(notifs[0].utilisateur_id).toBe(userEtab1.id);
      expect(notifs[0].type).toBe(TypeNotification.MESSAGE_CONTACT);
    });

    it('un message général notifie la Présidence, pas les établissements ni le DÉCIDEUR', async () => {
      const r = await request(url())
        .post('/api/public/contact')
        .send({
          ...valide,
          sujet: 'Message général',
          message: 'Bonjour, message à la présidence.',
        });
      expect(r.status).toBe(201);
      const messageId = donnees(r.body).id;

      const notifs = await attendre(
        () => notificationsDe(messageId),
        (n) => n.length > 0,
      );
      expect(notifs.map((n) => n.utilisateur_id)).toEqual([presidence.id]);
      expect(notifs.map((n) => n.utilisateur_id)).not.toContain(decideur.id);
    });

    it('envoie un e-mail au destinataire avec un lien vers son espace, sans le contenu du message', async () => {
      const contenuSecret = 'Contenu confidentiel du message de test';
      await request(url())
        .post('/api/public/contact')
        .send({
          ...valide,
          sujet: 'Sujet A&B "test"',
          message: contenuSecret,
          etablissement_id: etab2.id,
        })
        .expect(201);

      await attendre(
        async () => espion.mock.calls.map((c) => c[0]),
        (appels: any[]) =>
          appels.some((a) => a.destinataire === userEtab2.email),
      );
      const envoi = espion.mock.calls
        .map((c) => c[0])
        .find((a: any) => a.destinataire === userEtab2.email);
      expect(envoi).toBeDefined();
      expect(envoi.sujet).toContain('Nouveau message de contact');
      expect(envoi.contenu_html).toContain('/etablissement/messages');
      expect(envoi.contenu_html).toContain('Sujet A&amp;B &quot;test&quot;');
      expect(envoi.contenu_html).toMatch(
        /Référence :<\/strong> MC-[A-HJ-NP-Z2-9]{8}/,
      );
      expect(envoi.contenu_texte).not.toContain(contenuSecret);
      expect(envoi.contenu_html).not.toContain(contenuSecret);
      // Le DÉCIDEUR ne reçoit jamais d'e-mail de message de contact
      expect(espion.mock.calls.map((c) => c[0].destinataire)).not.toContain(
        decideur.email,
      );
    });
  });

  describe('Contrôle du contenu et référence', () => {
    it('refuse les balises HTML dans le sujet et le message (400)', async () => {
      await request(url())
        .post('/api/public/contact')
        .send({ ...valide, sujet: 'Test <script>x</script>' })
        .expect(400);
      await request(url())
        .post('/api/public/contact')
        .send({ ...valide, message: 'Bonjour <img src=x onerror=alert(1)>' })
        .expect(400);
    });

    it('refuse un message symbolique ou une répétition abusive (400)', async () => {
      await request(url())
        .post('/api/public/contact')
        .send({ ...valide, message: '!!!!!!!!!!!!!!!!' })
        .expect(400);
      await request(url())
        .post('/api/public/contact')
        .send({ ...valide, message: 'aaaaaaaaaaaa bonjour' })
        .expect(400);
    });

    it('renvoie une référence unique et lisible à l’expéditeur', async () => {
      const r1 = await request(url())
        .post('/api/public/contact')
        .send(valide)
        .expect(201);
      const r2 = await request(url())
        .post('/api/public/contact')
        .send(valide)
        .expect(201);
      const ref1 = donnees(r1.body).reference;
      const ref2 = donnees(r2.body).reference;
      expect(ref1).toMatch(/^MC-[A-HJ-NP-Z2-9]{8}$/);
      expect(ref2).toMatch(/^MC-[A-HJ-NP-Z2-9]{8}$/);
      expect(ref1).not.toEqual(ref2);
    });
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
