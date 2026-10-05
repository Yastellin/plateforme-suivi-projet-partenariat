import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { Utilisateur } from '../entities/utilisateur.entity';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Utilisateur)
    private utilisateurRepo: Repository<Utilisateur>,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET non défini dans les variables d environnement');
    }
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.body.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token manquant');
    }
    const user = await this.utilisateurRepo.findOne({
      where: { id: payload.sub },
      relations: { etablissement: true },
    });
    if (!user || !user.actif) {
      throw new UnauthorizedException('Utilisateur inactif ou introuvable');
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      etablissement_id: user.etablissement_id,
      etablissement_nom: user.etablissement?.nom || null,
    };
  }
}