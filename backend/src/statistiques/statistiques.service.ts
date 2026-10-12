import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Partenariat } from '../partenariats/entities/partenariat.entity';
import { PartenariatEtablissement } from '../partenariats/entities/partenariat-etablissement.entity';
import { Projet } from '../projets/entities/projet.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import {
  ComparatifEtablissementsResponseDto,
  StatistiquesEtablissementDto,
} from './dto/comparatif-response.dto';
import { StatutProjet } from '../common/enums/statut-projet.enum';

@Injectable()
export class StatistiquesService {
  constructor(
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    @InjectRepository(Partenariat)
    private partenariatRepo: Repository<Partenariat>,
    @InjectRepository(PartenariatEtablissement)
    private peRepo: Repository<PartenariatEtablissement>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(CotutelleThese)
    private cotutelleRepo: Repository<CotutelleThese>,
  ) {}

  async comparatifEtablissements(): Promise<ComparatifEtablissementsResponseDto> {
    const etablissements = await this.etablissementRepo.find({
      order: { nom: 'ASC' },
    });

    const resultats: StatistiquesEtablissementDto[] = [];

    for (const etab of etablissements) {
      const [partenaires, partenariats, projets, projets_actifs, cotutelles] =
        await Promise.all([
          this.partenaireRepo.count({
            where: { archive: false, etablissement_id: etab.id },
          }),
          this.peRepo
            .createQueryBuilder('pe')
            .innerJoin('pe.partenariat', 'partenariat')
            .where('pe.etablissement_id = :etablissementId', {
              etablissementId: etab.id,
            })
            .andWhere('partenariat.archive = false')
            .getCount(),
          this.projetRepo.count({
            where: { archive: false, etablissement_id: etab.id },
          }),
          this.projetRepo.count({
            where: {
              archive: false,
              etablissement_id: etab.id,
              statut: In([StatutProjet.EN_COURS, StatutProjet.EN_ATTENTE]),
            },
          }),
          this.cotutelleRepo.count({
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
