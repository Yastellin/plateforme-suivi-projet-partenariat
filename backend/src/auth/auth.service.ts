import { Injectable, UnauthorizedException } from '@nestjs/common';
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
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, mot_de_passe } = dto;

    const utilisateur = await this.utilisateurRepo.findOne({
      where: { email },
      relations: { etablissement: true },
    });

    if (!utilisateur) throw new UnauthorizedException('Identifiants invalides');
    if (!utilisateur.actif) throw new UnauthorizedException('Compte désactivé');

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
      },
    };
  }

  async refresh(dto: RefreshDto): Promise<{ access_token: string; refresh_token: string }> {
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
        { token_hash: tokenHash, utilisateur_id: utilisateurId, revoked_at: IsNull() },
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
    if (!utilisateur) throw new UnauthorizedException('Utilisateur introuvable');
    return {
      id: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
      actif: utilisateur.actif,
      derniere_connexion: utilisateur.derniere_connexion,
      etablissement_id: utilisateur.etablissement_id,
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

  async nettoyerTokensExpires(): Promise<{ supprimes: number }> {
    const seuil = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const r1 = await this.refreshTokenRepo.delete({ expires_at: LessThan(seuil) });
    const r2 = await this.refreshTokenRepo.delete({ revoked_at: LessThan(seuil) });
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

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DUREE_JOURS * 24 * 60 * 60 * 1000);
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