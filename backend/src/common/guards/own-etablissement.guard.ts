import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Role } from '../enums/role.enum';
import { Projet } from '../../projets/entities/projet.entity';
import { Partenariat } from '../../partenariats/entities/partenariat.entity';
import { PartenariatEtablissement } from '../../partenariats/entities/partenariat-etablissement.entity';

/**
 * Restreint l'acces d'un utilisateur ETABLISSEMENT aux ressources de son
 * propre etablissement (RG « cloisonnement par etablissement »).
 *
 * Les autres roles (PRESIDENCE, DECIDEUR) ne sont pas filtres par ce garde.
 */
@Injectable()
export class OwnEtablissementGuard implements CanActivate {
  constructor(private readonly dataSource: DataSource) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params ?? {};

    if (!user || user.role !== Role.ETABLISSEMENT) {
      return true;
    }

    const resourceId: string | undefined = params.id;
    if (!resourceId) {
      return true;
    }

    const routePath: string = request.route?.path ?? '';

    // Projet : l'etablissement est porte directement par la ressource
    if (routePath.includes('/projets')) {
      const projet = await this.dataSource.getRepository(Projet).findOne({
        where: { id: resourceId },
        select: { id: true, etablissement_id: true },
      });
      if (!projet) throw new NotFoundException('Ressource non trouvée');
      if (projet.etablissement_id !== user.etablissement_id) {
        throw new ForbiddenException(
          'Vous ne pouvez accéder qu à vos propres données',
        );
      }
      return true;
    }

    // Partenariat : relation via la table d'association
    if (routePath.includes('/partenariats')) {
      const partenariat = await this.dataSource
        .getRepository(Partenariat)
        .findOne({
          where: { id: resourceId },
          select: { id: true },
        });
      if (!partenariat) {
        throw new NotFoundException('Partenariat non trouve');
      }

      const association = await this.dataSource
        .getRepository(PartenariatEtablissement)
        .findOne({
          where: {
            partenariat_id: resourceId,
            etablissement_id: user.etablissement_id,
          },
          select: { id: true },
        });
      if (!association) {
        throw new ForbiddenException(
          'Vous ne pouvez accéder qu à vos propres données',
        );
      }
      return true;
    }

    return true;
  }
}
