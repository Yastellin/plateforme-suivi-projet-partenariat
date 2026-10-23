/**
 * Authentification : connexion, profil, rotation des refresh tokens,
 * deconnexion et controle des roles.
 *
 * Reprend les verifications de test-refresh-rotation.ps1 et test-mot-de-passe-oublie.ps1.
 */
import request from 'supertest';
import {
  creerApplicationTest,
  type ApplicationTest,
} from './harness/application-test';
import { donnees, enteteBearer } from './harness/jetons';
import { dateIsoDans } from './harness/dates';
import { Role } from '../src/common/enums/role.enum';
import { STORAGE_PORT, type StoragePort } from '../src/storage/storage.port';
import { getStorageToken, ThrottlerStorageService } from '@nestjs/throttler';

const MOT_DE_PASSE = 'password123';
const PNG_PIXEL_TRANSPARENT = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

describe('Authentification (e2e)', () => {
  let ctx: ApplicationTest;
  let utilisateurPresidence: { id: string; email: string; role: Role };
  let utilisateurEtablissement: { id: string; email: string; role: Role };
  let utilisateurDecideur: { id: string; email: string; role: Role };

  beforeAll(async () => {
    ctx = await creerApplicationTest();
    await ctx.seed();

    const utilisateurs = await ctx.dataSource.query(
      `SELECT id, email, role FROM "Utilisateur" ORDER BY email`,
    );
    utilisateurPresidence = utilisateurs.find((u: any) =>
      u.email.startsWith('presidence@'),
    );
    utilisateurEtablissement = utilisateurs.find((u: any) =>
      u.email.startsWith('fds@'),
    );
    utilisateurDecideur = utilisateurs.find((u: any) =>
      u.email.startsWith('president@'),
    );
  }, 120000);

  afterAll(async () => {
    await ctx.fermer();
  });

  describe('POST /api/auth/login', () => {
    it('refuse un mot de passe incorrect (401)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: utilisateurPresidence.email,
          mot_de_passe: 'mauvais-mot-de-passe',
        })
        .expect(401);

      expect(reponse.body.status).toBe('error');
      expect(reponse.body.message).toBe('Identifiants invalides');
    });

    it('refuse un compte inexistant (401) sans reveler sil existe', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'inconnu@univ-fianarantsoa.mg',
          mot_de_passe: MOT_DE_PASSE,
        })
        .expect(401);

      expect(reponse.body.message).toBe('Identifiants invalides');
    });

    it('explique le refus lorsqu’un compte établissement est désactivé', async () => {
      await ctx.dataSource.query(
        `UPDATE "Utilisateur" SET actif = false WHERE id = $1`,
        [utilisateurEtablissement.id],
      );

      try {
        const reponse = await request(ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({
            email: utilisateurEtablissement.email,
            mot_de_passe: MOT_DE_PASSE,
          })
          .expect(401);

        expect(reponse.body.message).toBe(
          'Votre compte a été désactivé. Veuillez contacter la Présidence.',
        );
      } finally {
        await ctx.dataSource.query(
          `UPDATE "Utilisateur" SET actif = true WHERE id = $1`,
          [utilisateurEtablissement.id],
        );
        ctx.app.get<ThrottlerStorageService>(getStorageToken()).storage.clear();
      }
    });

    it('renvoie les jetons et le profil pour des identifiants valides', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: utilisateurPresidence.email,
          mot_de_passe: MOT_DE_PASSE,
        })
        .expect(200);

      const donneesConnexion = donnees<any>(reponse.body);
      expect(donneesConnexion.access_token).toEqual(expect.any(String));
      expect(donneesConnexion.refresh_token).toEqual(expect.any(String));
      expect(donneesConnexion.utilisateur.role).toBe(Role.PRESIDENCE);
      expect(donneesConnexion.expires_in).toBe(3600);
    });
  });

  describe('GET /api/auth/me', () => {
    it('renvoie le profil de l utilisateur authentifie', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .get('/api/auth/me')
        .set(...enteteBearer(utilisateurPresidence))
        .expect(200);

      const profil = donnees<any>(reponse.body);
      expect(profil.id).toBe(utilisateurPresidence.id);
      expect(profil.email).toBe(utilisateurPresidence.email);
      expect(profil.role).toBe(Role.PRESIDENCE);
    });

    it('refuse un jeton absent (401)', async () => {
      await request(ctx.app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('refuse un jeton invalide (401)', async () => {
      await request(ctx.app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', 'Bearer jeton.bidon.inexistant')
        .expect(401);
    });

    it('refuse le jeton dun utilisateur supprime (401)', async () => {
      await request(ctx.app.getHttpServer())
        .get('/api/auth/me')
        .set(
          ...enteteBearer({
            id: '99999999-9999-4999-8999-999999999999',
            email: 'fantome@test.mg',
            role: Role.PRESIDENCE,
          }),
        )
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('emet un nouveau couple de jetons et invalide l ancien (rotation)', async () => {
      const connexion = await request(ctx.app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: utilisateurEtablissement.email,
          mot_de_passe: MOT_DE_PASSE,
        })
        .expect(200);

      const premierRefresh = donnees<any>(connexion.body).refresh_token;

      const rotation = await request(ctx.app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refresh_token: premierRefresh })
        .expect(200);

      const nouveaux = donnees<any>(rotation.body);
      expect(nouveaux.access_token).toEqual(expect.any(String));
      expect(nouveaux.refresh_token).toEqual(expect.any(String));
      expect(nouveaux.refresh_token).not.toBe(premierRefresh);

      // L'ancien jeton ne doit plus etre utilisable
      const reutilisation = await request(ctx.app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refresh_token: premierRefresh })
        .expect(401);
      expect(reutilisation.body.status).toBe('error');
    });

    it('refuse un refresh token fabrique (401)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refresh_token: 'jeton.invalide.signature' })
        .expect(401);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('revoque les refresh tokens de l utilisateur', async () => {
      const connexion = await request(ctx.app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: utilisateurDecideur.email, mot_de_passe: MOT_DE_PASSE })
        .expect(200);

      const jeton = donnees<any>(connexion.body);

      await request(ctx.app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${jeton.access_token}`)
        .send({ refresh_token: jeton.refresh_token })
        .expect(200);

      await request(ctx.app.getHttpServer())
        .post('/api/auth/refresh')
        .send({ refresh_token: jeton.refresh_token })
        .expect(401);
    });
  });

  describe('Compte, préférences et administration des accès', () => {
    it('expose le compte établissement et mémorise ses préférences', async () => {
      const compte = donnees<any>(
        (
          await request(ctx.app.getHttpServer())
            .get('/api/compte')
            .set(...enteteBearer(utilisateurEtablissement))
            .expect(200)
        ).body,
      );
      expect(compte.etablissement_nom).toEqual(expect.any(String));
      expect(compte.preferences).toEqual(expect.any(Object));

      const modifie = donnees<any>(
        (
          await request(ctx.app.getHttpServer())
            .patch('/api/compte/preferences')
            .set(...enteteBearer(utilisateurEtablissement))
            .send({
              theme: 'SOMBRE',
              densite: 'COMPACTE',
              animations: false,
              aide_contextuelle: false,
            })
            .expect(200)
        ).body,
      );
      expect(modifie.preferences).toMatchObject({
        theme: 'SOMBRE',
        densite: 'COMPACTE',
        animations: false,
        aide_contextuelle: false,
      });

      const profil = donnees<any>(
        (
          await request(ctx.app.getHttpServer())
            .get('/api/auth/me')
            .set(...enteteBearer(utilisateurEtablissement))
            .expect(200)
        ).body,
      );
      expect(profil.preferences.theme).toBe('SOMBRE');
      expect(profil.etablissement_nom).toEqual(expect.any(String));
    });

    it('ajoute puis remplace le logo Présidence et sert le média via le préfixe API', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/configuration/logo')
        .set(...enteteBearer(utilisateurPresidence))
        .attach('fichier', PNG_PIXEL_TRANSPARENT, {
          filename: 'logo-presidence.png',
          contentType: 'image/png',
        })
        .expect(200);

      const configuration = donnees<any>(reponse.body);
      expect(configuration.logo_url).toMatch(
        /^\/uploads\/logos\/presidence\/.+\.png$/,
      );

      await request(ctx.app.getHttpServer())
        .get(configuration.logo_url.replace('/uploads/', '/api/uploads/'))
        .expect('Content-Type', /image\/png/)
        .expect('Content-Length', String(PNG_PIXEL_TRANSPARENT.length))
        .expect(200);

      const remplacement = donnees<any>(
        (
          await request(ctx.app.getHttpServer())
            .post('/api/configuration/logo')
            .set(...enteteBearer(utilisateurPresidence))
            .attach('fichier', PNG_PIXEL_TRANSPARENT, {
              filename: 'logo-presidence-remplace.png',
              contentType: 'image/png',
            })
            .expect(200)
        ).body,
      );
      expect(remplacement.logo_url).not.toBe(configuration.logo_url);

      await request(ctx.app.getHttpServer())
        .get(configuration.logo_url.replace('/uploads/', '/api/uploads/'))
        .expect(404);
      await request(ctx.app.getHttpServer())
        .get(remplacement.logo_url.replace('/uploads/', '/api/uploads/'))
        .expect('Content-Type', /image\/png/)
        .expect(200);

      await request(ctx.app.getHttpServer())
        .post('/api/configuration/logo')
        .set(...enteteBearer(utilisateurEtablissement))
        .attach('fichier', PNG_PIXEL_TRANSPARENT, {
          filename: 'logo-interdit.png',
          contentType: 'image/png',
        })
        .expect(403);

      await ctx.app
        .get<StoragePort>(STORAGE_PORT)
        .supprimer(remplacement.logo_url);
    });

    it("permet l'historique global aux rôles centraux et un historique cloisonné à l'établissement", async () => {
      const historique = donnees<any>(
        (
          await request(ctx.app.getHttpServer())
            .get(
              '/api/historique?action=MODIFICATION&entite_type=Configuration',
            )
            .set(...enteteBearer(utilisateurPresidence))
            .expect(200)
        ).body,
      );
      expect(historique.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: 'MODIFICATION',
            entite_type: 'Configuration',
          }),
        ]),
      );

      await request(ctx.app.getHttpServer())
        .get('/api/historique')
        .set(...enteteBearer(utilisateurDecideur))
        .expect(200);
      const historiqueEtablissement = donnees<any>(
        (
          await request(ctx.app.getHttpServer())
            .get('/api/historique?limit=100')
            .set(...enteteBearer(utilisateurEtablissement))
            .expect(200)
        ).body,
      );
      expect(
        historiqueEtablissement.data.every(
          (entree: any) =>
            entree.utilisateur_id === utilisateurEtablissement.id,
        ),
      ).toBe(true);
      expect(
        historiqueEtablissement.data.some(
          (entree: any) => entree.entite_type === 'Configuration',
        ),
      ).toBe(false);
    });

    it('réserve la gestion des utilisateurs à la Présidence', async () => {
      await request(ctx.app.getHttpServer())
        .get('/api/utilisateurs')
        .set(...enteteBearer(utilisateurEtablissement))
        .expect(403);

      const email = `decision-${Date.now()}@univ-toliara.mg`;
      const cree = donnees<any>(
        (
          await request(ctx.app.getHttpServer())
            .post('/api/utilisateurs')
            .set(...enteteBearer(utilisateurPresidence))
            .send({
              email,
              mot_de_passe: 'mot-de-passe-123',
              role: Role.DECIDEUR,
            })
            .expect(201)
        ).body,
      );
      expect(cree).toMatchObject({ email, role: Role.DECIDEUR, actif: true });

      const desactive = donnees<any>(
        (
          await request(ctx.app.getHttpServer())
            .patch(`/api/utilisateurs/${cree.id}/acces`)
            .set(...enteteBearer(utilisateurPresidence))
            .send({ actif: false })
            .expect(200)
        ).body,
      );
      expect(desactive.actif).toBe(false);

      await request(ctx.app.getHttpServer())
        .get('/api/auth/me')
        .set(
          ...enteteBearer({
            id: cree.id,
            email,
            role: Role.DECIDEUR,
          }),
        )
        .expect(401);
    });
  });

  describe('Controle des roles', () => {
    it('interdit a un DECIDEUR de creer un projet (403)', async () => {
      const reponse = await request(ctx.app.getHttpServer())
        .post('/api/projets')
        .set(...enteteBearer(utilisateurDecideur))
        .send({
          nom: 'Projet interdit',
          type: 'Recherche',
          date_debut: dateIsoDans(30),
          date_fin_prevue: dateIsoDans(400),
        })
        .expect(403);

      expect(reponse.body.status).toBe('error');
    });

    it('interdit a un ETABLISSEMENT de creer une convention (403)', async () => {
      await request(ctx.app.getHttpServer())
        .post('/api/conventions')
        .set(...enteteBearer(utilisateurEtablissement))
        .send({ reference: 'CONV-TEST-403', titre: 'Convention interdite' })
        .expect(403);
    });
  });
});
