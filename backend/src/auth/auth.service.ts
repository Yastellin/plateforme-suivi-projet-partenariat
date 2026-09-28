import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

const REFRESH_TOKEN_DUREE_JOURS = 7;

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const { email, mot_de_passe } = dto;
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email },
      include: { etablissement: { select: { nom: true } } },
    });
    if (!utilisateur) throw new UnauthorizedException('Identifiants invalides');
    if (!utilisateur.actif) throw new UnauthorizedException('Compte désactivé');
    const valid = await bcrypt.compare(mot_de_passe, utilisateur.password_hash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    await this.prisma.utilisateur.update({
      where: { id: utilisateur.id },
      data: { derniere_connexion: new Date() },
    });

    const { accessToken, refreshToken } = await this.genererTokens(utilisateur.id, utilisateur.email, utilisateur.role);

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
    // 1. Verification de la signature JWT
    let payload: any;
    try {
      payload = this.jwtService.verify(dto.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }

    // 2. Verification en base : le token doit exister, ne pas etre revoque et ne pas etre expire
    const tokenHash = this.hasherToken(dto.refresh_token);
    const storedToken = await this.prisma.refreshToken.findUnique({
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

    const user = await this.prisma.utilisateur.findUnique({
      where: { id: payload.sub },
    });
    if (!user || !user.actif) {
      throw new UnauthorizedException('Utilisateur inactif ou introuvable');
    }

    // 3. Rotation : on revoque l'ancien token et on en genere un nouveau
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked_at: new Date() },
    });

    const { accessToken, refreshToken } = await this.genererTokens(user.id, user.email, user.role);

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async logout(utilisateurId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoquer uniquement le token fourni
      const tokenHash = this.hasherToken(refreshToken);
      await this.prisma.refreshToken.updateMany({
        where: { token_hash: tokenHash, utilisateur_id: utilisateurId, revoked_at: null },
        data: { revoked_at: new Date() },
      });
    } else {
      // Revoquer tous les tokens de l'utilisateur (deconnexion globale)
      await this.prisma.refreshToken.updateMany({
        where: { utilisateur_id: utilisateurId, revoked_at: null },
        data: { revoked_at: new Date() },
      });
    }
  }

  async me(utilisateurId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: utilisateurId },
      select: {
        id: true,
        email: true,
        role: true,
        actif: true,
        derniere_connexion: true,
        etablissement_id: true,
        etablissement: { select: { id: true, nom: true, sigle: true, logo_url: true } },
      },
    });
    if (!utilisateur) throw new UnauthorizedException('Utilisateur introuvable');
    return utilisateur;
  }

  /**
   * Supprime les refresh tokens expires depuis plus de 30 jours.
   * Appele par le scheduler de nettoyage.
   */
  async nettoyerTokensExpires(): Promise<{ supprimes: number }> {
    const seuil = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expires_at: { lt: seuil } },
          { revoked_at: { lt: seuil } },
        ],
      },
    });
    return { supprimes: result.count };
  }

  private async genererTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payloadBase = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payloadBase);

    // Le jti garantit l unicite du refresh token meme s il est genere
    // dans la meme seconde que le precedent (JWT iat en secondes).
    const refreshPayload = { ...payloadBase, jti: crypto.randomUUID() };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: `${REFRESH_TOKEN_DUREE_JOURS}d`,
    });

    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DUREE_JOURS * 24 * 60 * 60 * 1000);
    await this.prisma.refreshToken.create({
      data: {
        token_hash: this.hasherToken(refreshToken),
        utilisateur_id: userId,
        expires_at: expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }

  /**
   * Hash SHA-256 du token. Les refresh tokens sont deja cryptographiquement
   * aleatoires (signes par JWT), donc un hash rapide suffit (pas besoin de bcrypt).
   */
  private hasherToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}