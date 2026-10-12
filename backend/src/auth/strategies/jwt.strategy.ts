import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilisateur } from '../entities/utilisateur.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(Utilisateur)
    private utilisateurRepo: Repository<Utilisateur>,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_SECRET non défini dans les variables d environnement',
      );
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
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
