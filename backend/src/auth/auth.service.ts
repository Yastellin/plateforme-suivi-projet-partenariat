import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Inject } from '@nestjs/common';
import { MAIL_PORT, type MailPort } from '../mail/mail.port';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import {
  MotDePasseModifieEvent,
  MOT_DE_PASSE_MODIFIE,
} from './events/mot-de-passe-modifie.event';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Utilisateur } from './entities/utilisateur.entity';
import { RefreshToken } from './entities/refresh-token.entity';

const REFRESH_TOKEN_DUREE_JOURS = 7;

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Utilisateur)
    private utilisateurRepo: Repository<Utilisateur>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    @InjectRepository(PasswordResetToken)
    private passwordResetTokenRepo: Repository<PasswordResetToken>,
    @Inject(MAIL_PORT) private readonly mail: MailPort,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, mot_de_passe } = dto;

    const utilisateur = await this.utilisateurRepo.findOne({
      where: { email },
      relations: { etablissement: true },
    });

    if (!utilisateur) throw new UnauthorizedException('Identifiants invalides');
    if (!utilisateur.actif) {
      throw new UnauthorizedException(
        'Votre compte a été désactivé. Veuillez contacter la Présidence.',
      );
    }

    const valid = await bcrypt.compare(mot_de_passe, utilisateur.password_hash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    await this.utilisateurRepo.update(utilisateur.id, {
      derniere_connexion: new Date(),
    });

    const { accessToken, refreshToken } = await this.genererTokens(
      utilisateur.id,
      utilisateur.email,
      utilisateur.role,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
        etablissement_id: utilisateur.etablissement_id || undefined,
        etablissement_nom: utilisateur.etablissement?.nom || undefined,
        preferences: utilisateur.preferences ?? {},
      },
    };
  }

  async refresh(
    dto: RefreshDto,
  ): Promise<{ access_token: string; refresh_token: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }

    const tokenHash = this.hasherToken(dto.refresh_token);
    const storedToken = await this.refreshTokenRepo.findOne({
      where: { token_hash: tokenHash },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inconnu');
    }
    if (storedToken.revoked_at) {
      throw new UnauthorizedException('Refresh token deja revoque');
    }
    if (storedToken.expires_at < new Date()) {
      throw new UnauthorizedException('Refresh token expire');
    }

    const user = await this.utilisateurRepo.findOne({
      where: { id: payload.sub },
    });
    if (!user || !user.actif) {
      throw new UnauthorizedException('Utilisateur inactif ou introuvable');
    }

    await this.refreshTokenRepo.update(storedToken.id, {
      revoked_at: new Date(),
    });

    const { accessToken, refreshToken } = await this.genererTokens(
      user.id,
      user.email,
      user.role,
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async logout(utilisateurId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const tokenHash = this.hasherToken(refreshToken);
      await this.refreshTokenRepo.update(
        {
          token_hash: tokenHash,
          utilisateur_id: utilisateurId,
          revoked_at: IsNull(),
        },
        { revoked_at: new Date() },
      );
    } else {
      await this.refreshTokenRepo.update(
        { utilisateur_id: utilisateurId, revoked_at: IsNull() },
        { revoked_at: new Date() },
      );
    }
  }

  async me(utilisateurId: string) {
    const utilisateur = await this.utilisateurRepo.findOne({
      where: { id: utilisateurId },
      relations: { etablissement: true },
    });
    if (!utilisateur)
      throw new UnauthorizedException('Utilisateur introuvable');
    return {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      actif: utilisateur.actif,
      derniere_connexion: utilisateur.derniere_connexion,
      preferences: utilisateur.preferences ?? {},
      etablissement_id: utilisateur.etablissement_id,
      etablissement_nom: utilisateur.etablissement?.nom ?? null,
      etablissement: utilisateur.etablissement
        ? {
            id: utilisateur.etablissement.id,
            nom: utilisateur.etablissement.nom,
            sigle: utilisateur.etablissement.sigle,
            logo_url: utilisateur.etablissement.logo_url,
          }
        : null,
    };
  }

  async demanderReinitialisation(email: string): Promise<{ message: string }> {
    // Reponse volontairement identique que l'e-mail existe ou non (anti-enumeration).
    const message =
      'Si un compte existe avec cet e-mail, un lien de reinitialisation a ete envoye.';

    const utilisateur = await this.utilisateurRepo.findOne({
      where: { email },
    });
    if (!utilisateur || !utilisateur.actif) {
      return { message };
    }

    // Invalider les tokens de reinitialisation precedents non utilises.
    await this.passwordResetTokenRepo.update(
      { utilisateur_id: utilisateur.id, utilise_le: IsNull() },
      { utilise_le: new Date() },
    );

    // Token brut : 32 octets aleatoires, encodes en base64url (43 caracteres).
    const tokenBrut = crypto.randomBytes(32).toString('base64url');
    const tokenHash = this.hasherToken(tokenBrut);

    const expirationMinutes = parseInt(
      process.env.MOT_DE_PASSE_RESET_EXPIRATION_MINUTES || '30',
      10,
    );
    const expireLe = new Date(Date.now() + expirationMinutes * 60 * 1000);

    const entite = this.passwordResetTokenRepo.create({
      token_hash: tokenHash,
      utilisateur_id: utilisateur.id,
      expire_le: expireLe,
    });
    await this.passwordResetTokenRepo.save(entite);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const lien = `${frontendUrl}/reset-password?token=${tokenBrut}`;
    const texte =
      `Bonjour,\n\n` +
      `Vous avez demande la reinitialisation de votre mot de passe.\n` +
      `Cliquez sur le lien suivant (valable ${expirationMinutes} minutes) :\n${lien}\n\n` +
      `Si vous n etes pas a l origine de cette demande, ignorez ce message.`;
    const html =
      `<p>Bonjour,</p>` +
      `<p>Vous avez demande la reinitialisation de votre mot de passe.</p>` +
      `<p><a href="${lien}">Reinitialiser mon mot de passe</a></p>` +
      `<p>Ce lien est valable ${expirationMinutes} minutes. ` +
      `Si vous n etes pas a l origine de cette demande, ignorez ce message.</p>`;

    await this.mail.envoyer({
      destinataire: utilisateur.email,
      sujet: 'Reinitialisation de votre mot de passe',
      contenu_texte: texte,
      contenu_html: html,
    });

    return { message };
  }

  async reinitialiserMotDePasse(dto: {
    token: string;
    nouveau_mot_de_passe: string;
  }): Promise<{ message: string }> {
    const tokenHash = this.hasherToken(dto.token);
    const entite = await this.passwordResetTokenRepo.findOne({
      where: { token_hash: tokenHash },
    });

    if (!entite) {
      throw new BadRequestException('Token de reinitialisation invalide.');
    }
    if (entite.utilise_le) {
      throw new BadRequestException('Token de reinitialisation deja utilise.');
    }
    if (entite.expire_le < new Date()) {
      throw new BadRequestException('Token de reinitialisation expire.');
    }

    const utilisateur = await this.utilisateurRepo.findOne({
      where: { id: entite.utilisateur_id },
    });
    if (!utilisateur || !utilisateur.actif) {
      throw new BadRequestException('Utilisateur introuvable ou desactive.');
    }

    const nouveauHash = await bcrypt.hash(dto.nouveau_mot_de_passe, 10);

    await this.utilisateurRepo.update(utilisateur.id, {
      password_hash: nouveauHash,
    });

    await this.passwordResetTokenRepo.update(entite.id, {
      utilise_le: new Date(),
    });

    // Invalider toutes les sessions actives (refresh tokens non revoques).
    await this.refreshTokenRepo.update(
      { utilisateur_id: utilisateur.id, revoked_at: IsNull() },
      { revoked_at: new Date() },
    );

    // Notifier l'utilisateur par e-mail.
    this.eventEmitter.emit(
      MOT_DE_PASSE_MODIFIE,
      new MotDePasseModifieEvent(utilisateur.id, utilisateur.email),
    );

    return {
      message:
        'Mot de passe reinitialise avec succes. Veuillez vous reconnecter.',
    };
  }

  async nettoyerTokensExpires(): Promise<{ supprimes: number }> {
    const seuil = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const r1 = await this.refreshTokenRepo.delete({
      expires_at: LessThan(seuil),
    });
    const r2 = await this.refreshTokenRepo.delete({
      revoked_at: LessThan(seuil),
    });
    return { supprimes: (r1.affected ?? 0) + (r2.affected ?? 0) };
  }

  private async genererTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payloadBase = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payloadBase);

    const refreshPayload = { ...payloadBase, jti: crypto.randomUUID() };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: `${REFRESH_TOKEN_DUREE_JOURS}d`,
    });

    const expiresAt = new Date(
      Date.now() + REFRESH_TOKEN_DUREE_JOURS * 24 * 60 * 60 * 1000,
    );
    const token = this.refreshTokenRepo.create({
      token_hash: this.hasherToken(refreshToken),
      utilisateur_id: userId,
      expires_at: expiresAt,
    });
    await this.refreshTokenRepo.save(token);

    return { accessToken, refreshToken };
  }

  private hasherToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
