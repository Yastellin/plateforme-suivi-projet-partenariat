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
    if (user.role !== Role.ETABLISSEMENT) return true;
    const resourceId = params.id;
    if (!resourceId) return true;
    const routePath = request.route.path;
    let entityName: string;
    if (routePath.includes('/partenaires')) entityName = 'partenaire';
    else if (routePath.includes('/partenariats')) entityName = 'partenariat';
    else if (routePath.includes('/projets')) entityName = 'projet';
    else return true;
    const entity = await this.prisma[entityName].findUnique({
      where: { id: resourceId },
      select: { etablissement_id: true },
    });
    if (!entity) throw new NotFoundException('Ressource non trouvée');
    if (entity.etablissement_id !== user.etablissement_id) {
      throw new ForbiddenException('Vous ne pouvez accéder qu à vos propres données');
    }
    return true;
  }
}