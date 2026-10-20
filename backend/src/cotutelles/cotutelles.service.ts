import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateCotutelleDto } from './dto/create-cotutelle.dto';
import { UpdateCotutelleDto } from './dto/update-cotutelle.dto';
import { QueryCotutelleDto } from './dto/query-cotutelle.dto';
import { CotutelleResponseDto } from './dto/cotutelle-response.dto';
import { CotutelleThese } from './entities/cotutelle-these.entity';
import { Etablissement } from '../etablissements/entities/etablissement.entity';
import { Partenaire } from '../partenaires/entities/partenaire.entity';
import { HistoriqueService } from '../historique/historique.service';
import type { ContexteUtilisateur } from '../historique/historique.service';
import { ActionHistorique } from '../common/enums/action-historique.enum';

@Injectable()
export class CotutellesService {
  constructor(
    @InjectRepository(CotutelleThese)
    private cotutelleRepo: Repository<CotutelleThese>,
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    private historique: HistoriqueService,
  ) {}

  async create(dto: CreateCotutelleDto): Promise<CotutelleResponseDto> {
    const etablissement = await this.etablissementRepo.findOneBy({
      id: dto.etablissement_id,
    });
    if (!etablissement) {
      throw new NotFoundException('Etablissement non trouve');
    }

    const partenaire = await this.partenaireRepo.findOneBy({
      id: dto.partenaire_id,
      archive: false,
    });
    if (!partenaire) {
      throw new NotFoundException('Partenaire non trouve');
    }

    if (dto.convention_id) {
      const conventions = await this.cotutelleRepo.manager.query(
        'SELECT id FROM "Convention" WHERE id = $1',
        [dto.convention_id],
      );
      if (conventions.length === 0) {
        throw new NotFoundException('Convention non trouvee');
      }
    }

    const cotutelle = this.cotutelleRepo.create({
      nom_doctorant: dto.nom_doctorant,
      specialite: dto.specialite ?? null,
      directeur_these_local: dto.directeur_these_local ?? null,
      directeur_these_partenaire: dto.directeur_these_partenaire ?? null,
      type: dto.type,
      date_debut: new Date(dto.date_debut),
      date_prevue_soutenance: dto.date_prevue_soutenance
        ? new Date(dto.date_prevue_soutenance)
        : null,
      financement_bourse: dto.financement_bourse ?? null,
      mobilite_realisee: dto.mobilite_realisee ?? null,
      publications_produites: dto.publications_produites ?? null,
      etat_avancement: dto.etat_avancement ?? null,
      difficultes_rencontrees: dto.difficultes_rencontrees ?? null,
      perspectives: dto.perspectives ?? null,
      archive: false,
      etablissement_id: dto.etablissement_id,
      partenaire_id: dto.partenaire_id,
      convention_id: dto.convention_id ?? null,
    });

    const saved = await this.cotutelleRepo.save(cotutelle);
    return this.mapToResponse(saved);
  }

  async findAll(query: QueryCotutelleDto) {
    const {
      page = 1,
      limit = 20,
      nom_doctorant,
      type,
      etablissement_id,
      partenaire_id,
      archive,
    } = query;

    const where: any = { archive: archive !== undefined ? archive : false };
    if (nom_doctorant) where.nom_doctorant = ILike(`%${nom_doctorant}%`);
    if (type) where.type = type;
    if (etablissement_id) where.etablissement_id = etablissement_id;
    if (partenaire_id) where.partenaire_id = partenaire_id;

    const [data, total] = await this.cotutelleRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: data.map((cotutelle) => this.mapToResponse(cotutelle)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<CotutelleResponseDto> {
    const cotutelle = await this.cotutelleRepo.findOne({
      where: { id, archive: false },
    });
    if (!cotutelle) throw new NotFoundException('Cotutelle non trouvee');
    return this.mapToResponse(cotutelle);
  }

  async update(
    id: string,
    dto: UpdateCotutelleDto,
  ): Promise<CotutelleResponseDto> {
    await this.findOne(id);

    const data: Partial<CotutelleThese> = {};
    if (dto.nom_doctorant) data.nom_doctorant = dto.nom_doctorant;
    if (dto.specialite !== undefined) data.specialite = dto.specialite ?? null;
    if (dto.directeur_these_local !== undefined) {
      data.directeur_these_local = dto.directeur_these_local ?? null;
    }
    if (dto.directeur_these_partenaire !== undefined) {
      data.directeur_these_partenaire = dto.directeur_these_partenaire ?? null;
    }
    if (dto.type) data.type = dto.type;
    if (dto.date_debut) data.date_debut = new Date(dto.date_debut);
    if (dto.date_prevue_soutenance !== undefined) {
      data.date_prevue_soutenance = dto.date_prevue_soutenance
        ? new Date(dto.date_prevue_soutenance)
        : null;
    }
    if (dto.financement_bourse !== undefined) {
      data.financement_bourse = dto.financement_bourse ?? null;
    }
    if (dto.mobilite_realisee !== undefined) {
      data.mobilite_realisee = dto.mobilite_realisee ?? null;
    }
    if (dto.publications_produites !== undefined) {
      data.publications_produites = dto.publications_produites ?? null;
    }
    if (dto.etat_avancement !== undefined) {
      data.etat_avancement = dto.etat_avancement ?? null;
    }
    if (dto.difficultes_rencontrees !== undefined) {
      data.difficultes_rencontrees = dto.difficultes_rencontrees ?? null;
    }
    if (dto.perspectives !== undefined) {
      data.perspectives = dto.perspectives ?? null;
    }
    if (dto.etablissement_id) data.etablissement_id = dto.etablissement_id;
    if (dto.partenaire_id) data.partenaire_id = dto.partenaire_id;
    if (dto.convention_id !== undefined) {
      data.convention_id = dto.convention_id ?? null;
    }

    await this.cotutelleRepo.update(id, data);
    return this.findOne(id);
  }

  async archiver(
    id: string,
    utilisateur?: ContexteUtilisateur | null,
  ): Promise<CotutelleResponseDto> {
    const cotutelle = await this.findOne(id);
    await this.cotutelleRepo.update(id, { archive: true });

    await this.historique.enregistrer({
      action: ActionHistorique.ARCHIVAGE,
      entite_type: 'CotutelleThese',
      entite_id: id,
      entite_nom: cotutelle.nom_doctorant,
      utilisateur: utilisateur ?? null,
    });

    return this.mapToResponse(await this.cotutelleRepo.findOneByOrFail({ id }));
  }

  private mapToResponse(data: CotutelleThese): CotutelleResponseDto {
    return {
      id: data.id,
      nom_doctorant: data.nom_doctorant,
      specialite: data.specialite,
      directeur_these_local: data.directeur_these_local,
      directeur_these_partenaire: data.directeur_these_partenaire,
      type: data.type,
      date_debut: data.date_debut,
      date_prevue_soutenance: data.date_prevue_soutenance,
      financement_bourse: data.financement_bourse,
      mobilite_realisee: data.mobilite_realisee,
      publications_produites: data.publications_produites,
      etat_avancement: data.etat_avancement,
      difficultes_rencontrees: data.difficultes_rencontrees,
      perspectives: data.perspectives,
      archive: data.archive,
      etablissement_id: data.etablissement_id,
      partenaire_id: data.partenaire_id,
      convention_id: data.convention_id,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }
}
