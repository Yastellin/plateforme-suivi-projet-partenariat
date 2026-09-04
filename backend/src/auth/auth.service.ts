import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

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
    const payload = { sub: utilisateur.id, email: utilisateur.email, role: utilisateur.role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
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

  async refresh(dto: RefreshDto): Promise<{ access_token: string }> {
    try {
      const payload = this.jwtService.verify(dto.refresh_token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.utilisateur.findUnique({
        where: { id: payload.sub },
      });
      if (!user || !user.actif) throw new UnauthorizedException('Refresh token invalide');
      const newPayload = { sub: user.id, email: user.email, role: user.role };
      return { access_token: this.jwtService.sign(newPayload) };
    } catch {
      throw new UnauthorizedException('Refresh token invalide');
    }
  }

  async logout(utilisateurId: string): Promise<void> {
    // Rien à faire en stateless
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
}