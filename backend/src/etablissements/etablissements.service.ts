import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EtablissementResponseDto } from './dto/etablissement-response.dto';

@Injectable()
export class EtablissementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<EtablissementResponseDto[]> {
    const etablissements = await this.prisma.etablissement.findMany({
      orderBy: { nom: 'asc' },
    });
    return etablissements;
  }

  async findOne(id: string): Promise<EtablissementResponseDto> {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id },
    });
    if (!etablissement) {
      throw new NotFoundException('Établissement non trouvé');
    }
    return etablissement;
  }
}