import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { Convention } from '../conventions/entities/convention.entity';
import { StatutConvention } from '../common/enums/statut-convention.enum';
import { StatutProjet } from '../common/enums/statut-projet.enum';
import { Projet } from '../projets/entities/projet.entity';
import { CotutelleThese } from '../cotutelles/entities/cotutelle-these.entity';
import { CreateSyntheseItemDto } from './dto/create-synthese-item.dto';
import { CreateSynthesePartenaireStrategiqueDto } from './dto/create-synthese-partenaire-strategique.dto';
import {
  SyntheseEtablissementDto,
  SyntheseGlobaleDto,
} from './dto/synthese-response.dto';
import { SyntheseItem } from './entities/synthese-item.entity';
import { SynthesePartenaireStrategique } from './entities/synthese-partenaire-strategique.entity';

export interface FiltresSynthese {
  etablissement_id?: string;
  annee?: number;
  type?: string;
}

@Injectable()
export class SyntheseService {
  constructor(
    @InjectRepository(SyntheseItem) private itemRepo: Repository<SyntheseItem>,
    @InjectRepository(SynthesePartenaireStrategique)
    private partenaireStrategiqueRepo: Repository<SynthesePartenaireStrategique>,
    @InjectRepository(Etablissement) private etablissementRepo: Repository<Etablissement>,
    @InjectRepository(Partenaire) private partenaireRepo: Repository<Partenaire>,
    @InjectRepository(Convention) private conventionRepo: Repository<Convention>,
    @InjectRepository(Projet) private projetRepo: Repository<Projet>,
    @InjectRepository(CotutelleThese) private cotutelleRepo: Repository<CotutelleThese>,
  ) {}

  async getSyntheseGlobale(annee: number): Promise<SyntheseGlobaleDto> {
    const etablissements = await this.etablissementRepo.find({ order: { nom: 'ASC' } });
    return {
      annee,
      etablissements: await Promise.all(
        etablissements.map((etablissement) =>
          this.getSyntheseEtablissement(etablissement.id, annee),
        ),
      ),
    };
  }

  async getSyntheseEtablissement(
    etablissementId: string,
    annee: number,
  ): Promise<SyntheseEtablissementDto> {
    const etablissement = await this.etablissementRepo.findOne({
      where: { id: etablissementId },
    });
    if (!etablissement) {
      throw new NotFoundException('Établissement introuvable.');
    }

    const compterConventions = (statut: StatutConvention | StatutConvention[]) =>
      this.conventionRepo
        .createQueryBuilder('convention')
        .leftJoin('convention.projet', 'projet')
        .leftJoin('convention.partenariat', 'partenariat')
        .leftJoin('partenariat.etablissements', 'partenariatEtablissement')
        .where('convention.archive = false')
        .andWhere('convention.statut IN (:...statuts)', {
          statuts: Array.isArray(statut) ? statut : [statut],
        })
        .andWhere(
          '(projet.etablissement_id = :etablissementId OR partenariatEtablissement.etablissement_id = :etablissementId)',
          { etablissementId },
        )
        .distinct(true)
        .getCount();

    const [
      partenaires,
      conventions_actives,
      conventions_expirees,
      cotutelles,
      projets_actifs,
      items,
      partenairesStrategiques,
    ] = await Promise.all([
      this.partenaireRepo.count({
        where: { etablissement_id: etablissementId, archive: false },
      }),
      compterConventions([StatutConvention.ACTIVE, StatutConvention.SIGNEE]),
      compterConventions(StatutConvention.EXPIREE),
      this.cotutelleRepo.count({
        where: { etablissement_id: etablissementId, archive: false },
      }),
      this.projetRepo.count({
        where: {
          etablissement_id: etablissementId,
          archive: false,
          statut: In([StatutProjet.EN_COURS, StatutProjet.EN_ATTENTE]),
        },
      }),
      this.itemRepo.find({ where: { etablissement_id: etablissementId, annee } }),
      this.partenaireStrategiqueRepo.find({
        where: { etablissement_id: etablissementId, annee },
        relations: { partenaire: true },
      }),
    ]);

    return {
      etablissement_id: etablissement.id,
      etablissement_nom: etablissement.nom,
      annee,
      compteurs: {
        partenaires,
        conventions_actives,
        conventions_expirees,
        cotutelles,
        projets_actifs,
      },
      items,
      partenaires_strategiques: partenairesStrategiques.map((item) => ({
        id: item.id,
        partenaire_id: item.partenaire_id,
        partenaire_nom: item.partenaire.nom,
      })),
    };
  }

  async creerItem(dto: CreateSyntheseItemDto): Promise<SyntheseItem> {
    const etablissement = await this.etablissementRepo.findOne({
      where: { id: dto.etablissement_id },
    });
    if (!etablissement) {
      throw new NotFoundException('Établissement introuvable.');
    }

    const existant = await this.itemRepo.findOne({
      where: {
        etablissement_id: dto.etablissement_id,
        annee: dto.annee,
        type: dto.type,
      },
    });
    if (existant) {
      throw new ConflictException(
        'Un item de synthèse de ce type existe déjà pour cet établissement et cette année.',
      );
    }

    return this.itemRepo.save(this.itemRepo.create(dto));
  }

  async listerItems(filtres: FiltresSynthese) {
    const where = {
      ...(filtres.etablissement_id ? { etablissement_id: filtres.etablissement_id } : {}),
      ...(filtres.annee !== undefined ? { annee: filtres.annee } : {}),
      ...(filtres.type ? { type: filtres.type } : {}),
    };
    const [data, total] = await this.itemRepo.findAndCount({
      where,
      order: { annee: 'DESC', type: 'ASC' },
    });
    return { data, total };
  }

  async creerPartenaireStrategique(
    dto: CreateSynthesePartenaireStrategiqueDto,
  ): Promise<SynthesePartenaireStrategique> {
    const [etablissement, partenaire] = await Promise.all([
      this.etablissementRepo.findOne({ where: { id: dto.etablissement_id } }),
      this.partenaireRepo.findOne({ where: { id: dto.partenaire_id } }),
    ]);
    if (!etablissement) {
      throw new NotFoundException('Établissement introuvable.');
    }
    if (!partenaire) {
      throw new NotFoundException('Partenaire introuvable.');
    }

    const existant = await this.partenaireStrategiqueRepo.findOne({
      where: {
        etablissement_id: dto.etablissement_id,
        annee: dto.annee,
        partenaire_id: dto.partenaire_id,
      },
    });
    if (existant) {
      throw new ConflictException(
        'Ce partenaire est déjà désigné comme stratégique pour cet établissement et cette année.',
      );
    }

    return this.partenaireStrategiqueRepo.save(
      this.partenaireStrategiqueRepo.create(dto),
    );
  }

  async listerPartenairesStrategiques(filtres: FiltresSynthese) {
    const partenairesStrategiques = await this.partenaireStrategiqueRepo.find({
      where: {
        ...(filtres.etablissement_id ? { etablissement_id: filtres.etablissement_id } : {}),
        ...(filtres.annee !== undefined ? { annee: filtres.annee } : {}),
      },
      relations: { partenaire: true },
      order: { annee: 'DESC' },
    });
    return partenairesStrategiques.map((item) => ({
      id: item.id,
      partenaire_id: item.partenaire_id,
      partenaire_nom: item.partenaire.nom,
    }));
  }

  async supprimerItem(id: string): Promise<void> {
    const resultat = await this.itemRepo.delete(id);
    if (!resultat.affected) {
      throw new NotFoundException('Item de synthèse introuvable.');
    }
  }

  async supprimerPartenaireStrategique(id: string): Promise<void> {
    const resultat = await this.partenaireStrategiqueRepo.delete(id);
    if (!resultat.affected) {
      throw new NotFoundException('Partenaire stratégique introuvable.');
    }
  }
}