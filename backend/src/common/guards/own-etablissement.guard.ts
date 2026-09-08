import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../enums/role.enum';

@Injectable()
export class OwnEtablissementGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    if (user.role !== Role.ETABLISSEMENT) {
      return true;
    }

    const resourceId = params.id;
    if (!resourceId) {
      return true;
    }

    const routePath = request.route.path;

    // Partenaire : champ direct
    if (routePath.includes('/partenaires')) {
      const entity = await this.prisma.partenaire.findUnique({
        where: { id: resourceId },
        select: { etablissement_id: true },
      });
      if (!entity) throw new NotFoundException('Ressource non trouvée');
      if (entity.etablissement_id !== user.etablissement_id) {
        throw new ForbiddenException('Vous ne pouvez accéder qu à vos propres données');
      }
      return true;
    }

    // Projet : champ direct
    if (routePath.includes('/projets')) {
      const entity = await this.prisma.projet.findUnique({
        where: { id: resourceId },
        select: { etablissement_id: true },
      });
      if (!entity) throw new NotFoundException('Ressource non trouvée');
      if (entity.etablissement_id !== user.etablissement_id) {
        throw new ForbiddenException('Vous ne pouvez accéder qu à vos propres données');
      }
      return true;
    }

    // Partenariat : relation via table d'association
    if (routePath.includes('/partenariats')) {
      const association = await this.prisma.partenariatEtablissement.findFirst({
        where: {
          partenariat_id: resourceId,
          etablissement_id: user.etablissement_id,
        },
      });
      if (!association) {
        throw new ForbiddenException('Vous ne pouvez accéder qu à vos propres données');
      }
      return true;
    }

    return true;
  }
}