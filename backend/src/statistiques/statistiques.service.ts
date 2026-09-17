import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ComparatifEtablissementsResponseDto,
  StatistiquesEtablissementDto,
} from './dto/comparatif-response.dto';
import { StatutProjet } from '@prisma/client';

@Injectable()
export class StatistiquesService {
  constructor(private prisma: PrismaService) {}

  async comparatifEtablissements(): Promise<ComparatifEtablissementsResponseDto> {
    const etablissements = await this.prisma.etablissement.findMany({
      orderBy: { nom: 'asc' },
    });

    const resultats: StatistiquesEtablissementDto[] = [];

    for (const etab of etablissements) {
      const [partenaires, partenariats, projets, projets_actifs, cotutelles] =
        await Promise.all([
          this.prisma.partenaire.count({
            where: { archive: false, etablissement_id: etab.id },
          }),
          this.prisma.partenariat.count({
            where: {
              archive: false,
              etablissements: { some: { etablissement_id: etab.id } },
            },
          }),
          this.prisma.projet.count({
            where: { archive: false, etablissement_id: etab.id },
          }),
          this.prisma.projet.count({
            where: {
              archive: false,
              etablissement_id: etab.id,
              statut: { in: [StatutProjet.EN_COURS, StatutProjet.EN_ATTENTE] },
            },
          }),
          this.prisma.cotutelleThese.count({
            where: { archive: false, etablissement_id: etab.id },
          }),
        ]);

      resultats.push({
        etablissement_id: etab.id,
        etablissement_nom: etab.nom,
        etablissement_sigle: etab.sigle,
        partenaires,
        partenariats,
        projets,
        projets_actifs,
        cotutelles,
      });
    }

    return { etablissements: resultats };
  }
}