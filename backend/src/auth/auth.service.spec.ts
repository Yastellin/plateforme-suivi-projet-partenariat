jest.mock('bcrypt', () => ({
  hash: jest.fn(async (valeur: string) => `hash:${valeur}`),
  compare: jest.fn(
    async (valeur: string, empreinte: string) => empreinte === `hash:${valeur}`,
  ),
}));

import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Role } from '../common/enums/role.enum';
import type { Repository } from 'typeorm';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { Utilisateur } from './entities/utilisateur.entity';
import type { RefreshToken } from './entities/refresh-token.entity';
import type { PasswordResetToken } from './entities/password-reset-token.entity';

const JWT_SECRET = 'secret-de-test-jwt-secret-de-test-32-caracteres';
const JWT_REFRESH_SECRET = 'secret-refresh-test-refresh-secret-32c';

function creerDepot() {
  return {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    create: jest.fn((valeur) => valeur),
    save: jest.fn((valeur) => Promise.resolve(valeur)),
    delete: jest.fn(),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let utilisateurRepo: ReturnType<typeof creerDepot>;
  let refreshTokenRepo: ReturnType<typeof creerDepot>;
  let passwordResetTokenRepo: ReturnType<typeof creerDepot>;
  let mail: { envoyer: jest.Mock };
  let eventEmitter: { emit: jest.Mock };

  const motDePasse = 'password123';
  let hash: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = JWT_REFRESH_SECRET;
    hash = await bcrypt.hash(motDePasse, 10);
  }, 30000);

  beforeEach(() => {
    utilisateurRepo = creerDepot();
    refreshTokenRepo = creerDepot();
    passwordResetTokenRepo = creerDepot();
    mail = { envoyer: jest.fn().mockResolvedValue(undefined) };
    eventEmitter = { emit: jest.fn() };

    // Depots simules : seules les methodes utilisees sont implementees
    service = new AuthService(
      new JwtService({ secret: JWT_SECRET, signOptions: { expiresIn: '1h' } }),
      utilisateurRepo as unknown as Repository<Utilisateur>,
      refreshTokenRepo as unknown as Repository<RefreshToken>,
      passwordResetTokenRepo as unknown as Repository<PasswordResetToken>,
      mail,
      eventEmitter as unknown as EventEmitter2,
    );
  });

  describe('login', () => {
    it('rejette un compte inexistant avec un message generique', async () => {
      utilisateurRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inconnu@univ.mg', mot_de_passe: motDePasse }),
      ).rejects.toThrow(new UnauthorizedException('Identifiants invalides'));
    });

    it('rejette un compte desactive', async () => {
      utilisateurRepo.findOne.mockResolvedValue({
        id: 'u1',
        email: 'desactive@univ.mg',
        password_hash: hash,
        role: Role.PRESIDENCE,
        actif: false,
      });

      await expect(
        service.login({ email: 'desactive@univ.mg', mot_de_passe: motDePasse }),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Votre compte a été désactivé. Veuillez contacter la Présidence.',
        ),
      );
    });

    it('rejette un mot de passe incorrect', async () => {
      utilisateurRepo.findOne.mockResolvedValue({
        id: 'u1',
        email: 'actif@univ.mg',
        password_hash: hash,
        role: Role.PRESIDENCE,
        actif: true,
      });

      await expect(
        service.login({
          email: 'actif@univ.mg',
          mot_de_passe: 'mauvais-mot-de-passe',
        }),
      ).rejects.toThrow(new UnauthorizedException('Identifiants invalides'));
    });

    it('renvoie les jetons et met a jour la derniere connexion', async () => {
      utilisateurRepo.findOne.mockResolvedValue({
        id: 'u1',
        email: 'actif@univ.mg',
        password_hash: hash,
        role: Role.ETABLISSEMENT,
        actif: true,
        etablissement_id: 'e1',
        etablissement: { nom: 'Faculté des Sciences' },
      });

      const resultat = await service.login({
        email: 'actif@univ.mg',
        mot_de_passe: motDePasse,
      });

      expect(resultat.access_token).toEqual(expect.any(String));
      expect(resultat.refresh_token).toEqual(expect.any(String));
      expect(resultat.expires_in).toBe(3600);
      expect(resultat.utilisateur).toEqual({
        id: 'u1',
        email: 'actif@univ.mg',
        role: Role.ETABLISSEMENT,
        etablissement_id: 'e1',
        etablissement_nom: 'Faculté des Sciences',
        preferences: {},
      });
      expect(utilisateurRepo.update).toHaveBeenCalledWith('u1', {
        derniere_connexion: expect.any(Date),
      });
      // Le refresh token est persiste sous forme de hash (jamais en clair)
      const enregistre = refreshTokenRepo.save.mock.calls[0][0];
      expect(enregistre.token_hash).toHaveLength(64);
      expect(enregistre.token_hash).not.toBe(resultat.refresh_token);
    });
  });

  describe('refresh', () => {
    it('rejette un jeton dont la signature est invalide', async () => {
      await expect(
        service.refresh({ refresh_token: 'jeton.falsifie' }),
      ).rejects.toThrow(new UnauthorizedException('Refresh token invalide'));
    });

    it('rejette un jeton absent de la base', async () => {
      const jwtService = new JwtService({ secret: JWT_REFRESH_SECRET });
      const jeton = jwtService.sign({
        sub: 'u1',
        email: 'a@b.mg',
        role: Role.PRESIDENCE,
      });
      refreshTokenRepo.findOne.mockResolvedValue(null);

      await expect(service.refresh({ refresh_token: jeton })).rejects.toThrow(
        new UnauthorizedException('Refresh token inconnu'),
      );
    });

    it('rejette un jeton deja revoque', async () => {
      const jwtService = new JwtService({ secret: JWT_REFRESH_SECRET });
      const jeton = jwtService.sign({
        sub: 'u1',
        email: 'a@b.mg',
        role: Role.PRESIDENCE,
      });
      refreshTokenRepo.findOne.mockResolvedValue({
        id: 'r1',
        revoked_at: new Date(),
        expires_at: new Date(Date.now() + 3600_000),
      });

      await expect(service.refresh({ refresh_token: jeton })).rejects.toThrow(
        new UnauthorizedException('Refresh token deja revoque'),
      );
    });

    it('rejette un jeton expire en base', async () => {
      const jwtService = new JwtService({ secret: JWT_REFRESH_SECRET });
      const jeton = jwtService.sign({
        sub: 'u1',
        email: 'a@b.mg',
        role: Role.PRESIDENCE,
      });
      refreshTokenRepo.findOne.mockResolvedValue({
        id: 'r1',
        revoked_at: null,
        expires_at: new Date(Date.now() - 1000),
      });

      await expect(service.refresh({ refresh_token: jeton })).rejects.toThrow(
        new UnauthorizedException('Refresh token expire'),
      );
    });

    it('effectue une rotation en revoquant l ancien jeton', async () => {
      const jwtService = new JwtService({ secret: JWT_REFRESH_SECRET });
      const jeton = jwtService.sign({
        sub: 'u1',
        email: 'a@b.mg',
        role: Role.PRESIDENCE,
      });
      refreshTokenRepo.findOne.mockResolvedValue({
        id: 'r1',
        revoked_at: null,
        expires_at: new Date(Date.now() + 3600_000),
      });
      utilisateurRepo.findOne.mockResolvedValue({
        id: 'u1',
        email: 'a@b.mg',
        role: Role.PRESIDENCE,
        actif: true,
      });

      const resultat = await service.refresh({ refresh_token: jeton });

      expect(resultat.access_token).toEqual(expect.any(String));
      expect(resultat.refresh_token).not.toBe(jeton);
      expect(refreshTokenRepo.update).toHaveBeenCalledWith('r1', {
        revoked_at: expect.any(Date),
      });
    });
  });

  describe('reinitialiserMotDePasse', () => {
    it('rejette un token inconnu', async () => {
      passwordResetTokenRepo.findOne.mockResolvedValue(null);

      await expect(
        service.reinitialiserMotDePasse({
          token: 'inconnu',
          nouveau_mot_de_passe: motDePasse,
        }),
      ).rejects.toThrow(
        new BadRequestException('Token de reinitialisation invalide.'),
      );
    });

    it('rejette un token deja utilise', async () => {
      passwordResetTokenRepo.findOne.mockResolvedValue({
        id: 't1',
        utilise_le: new Date(),
        expire_le: new Date(Date.now() + 60_000),
      });

      await expect(
        service.reinitialiserMotDePasse({
          token: 'utilise',
          nouveau_mot_de_passe: motDePasse,
        }),
      ).rejects.toThrow(
        new BadRequestException('Token de reinitialisation deja utilise.'),
      );
    });

    it('rejette un token expire', async () => {
      passwordResetTokenRepo.findOne.mockResolvedValue({
        id: 't1',
        utilise_le: null,
        expire_le: new Date(Date.now() - 60_000),
      });

      await expect(
        service.reinitialiserMotDePasse({
          token: 'expire',
          nouveau_mot_de_passe: motDePasse,
        }),
      ).rejects.toThrow(
        new BadRequestException('Token de reinitialisation expire.'),
      );
    });
  });

  describe('demanderReinitialisation', () => {
    it('repond toujours la meme chose (anti-enumeration) sans envoyer d e-mail', async () => {
      utilisateurRepo.findOne.mockResolvedValue(null);

      const resultat =
        await service.demanderReinitialisation('inconnu@univ.mg');

      expect(resultat.message).toContain('Si un compte existe');
      expect(mail.envoyer).not.toHaveBeenCalled();
    });

    it('cree un token hashe et envoie le lien par e-mail', async () => {
      utilisateurRepo.findOne.mockResolvedValue({
        id: 'u1',
        email: 'actif@univ.mg',
        actif: true,
      });

      const resultat = await service.demanderReinitialisation('actif@univ.mg');

      expect(resultat.message).toContain('Si un compte existe');
      expect(passwordResetTokenRepo.update).toHaveBeenCalled();
      expect(passwordResetTokenRepo.save).toHaveBeenCalled();

      const enregistre = passwordResetTokenRepo.save.mock.calls[0][0];
      expect(enregistre.utlisateur_id ?? enregistre.utilisateur_id).toBe('u1');
      expect(enregistre.token_hash).toHaveLength(64);

      expect(mail.envoyer).toHaveBeenCalledTimes(1);
      const message = mail.envoyer.mock.calls[0][0];
      expect(message.destinataire).toBe('actif@univ.mg');
      expect(message.contenu_texte).toContain('/reset-password?token=');
    });
  });
});
