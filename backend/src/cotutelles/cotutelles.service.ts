import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCotutelleDto } from './dto/create-cotutelle.dto';
import { UpdateCotutelleDto } from './dto/update-cotutelle.dto';
import { QueryCotutelleDto } from './dto/query-cotutelle.dto';
import { CotutelleResponseDto } from './dto/cotutelle-response.dto';

@Injectable()
export class CotutellesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCotutelleDto): Promise<CotutelleResponseDto> {
    const etablissement = await this.prisma.etablissement.findUnique({
      where: { id: dto.etablissement_id },
    });
    if (!etablissement) throw new NotFoundException('Etablissement non trouve');

    const partenaire = await this.prisma.partenaire.findUnique({
      where: { id: dto.partenaire_id, archive: false },
    });
    if (!partenaire) throw new NotFoundException('Partenaire non trouve');

    if (dto.convention_id) {
      const convention = await this.prisma.convention.findUnique({
        where: { id: dto.convention_id, archive: false },
      });
      if (!convention) throw new NotFoundException('Convention non trouvee');
    }

    const cotutelle = await this.prisma.cotutelleThese.create({
      data: {
        nom_doctorant: dto.nom_doctorant,
        specialite: dto.specialite,
        directeur_these_local: dto.directeur_these_local,
        directeur_these_partenaire: dto.directeur_these_partenaire,
        type: dto.type,
        date_debut: new Date(dto.date_debut),
        date_prevue_soutenance: dto.date_prevue_soutenance
          ? new Date(dto.date_prevue_soutenance)
          : null,
        financement_bourse: dto.financement_bourse,
        mobilite_realisee: dto.mobilite_realisee,
        publications_produites: dto.publications_produites,
        etat_avancement: dto.etat_avancement,
        difficultes_rencontrees: dto.difficultes_rencontrees,
        perspectives: dto.perspectives,
        etablissement_id: dto.etablissement_id,
        partenaire_id: dto.partenaire_id,
        convention_id: dto.convention_id,
      },
    });

    return this.mapToResponse(cotutelle);
  }

  async findAll(query: QueryCotutelleDto) {
    const { page = 1, limit = 20, nom_doctorant, type, etablissement_id, partenaire_id, archive } = query;

    const where: any = { archive: archive !== undefined ? archive : false };
    if (nom_doctorant) where.nom_doctorant = { contains: nom_doctorant, mode: 'insensitive' };
    if (type) where.type = type;
    if (etablissement_id) where.etablissement_id = etablissement_id;
    if (partenaire_id) where.partenaire_id = partenaire_id;

    const [data, total] = await Promise.all([
      this.prisma.cotutelleThese.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.cotutelleThese.count({ where }),
    ]);

    return {
      data: data.map((c) => this.mapToResponse(c)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<CotutelleResponseDto> {
    const cotutelle = await this.prisma.cotutelleThese.findUnique({
      where: { id, archive: false },
    });
    if (!cotutelle) throw new NotFoundException('Cotutelle non trouvee');
    return this.mapToResponse(cotutelle);
  }

  async update(id: string, dto: UpdateCotutelleDto): Promise<CotutelleResponseDto> {
    await this.findOne(id);

    const data: any = {};
    if (dto.nom_doctorant) data.nom_doctorant = dto.nom_doctorant;
    if (dto.specialite !== undefined) data.specialite = dto.specialite;
    if (dto.directeur_these_local !== undefined) data.directeur_these_local = dto.directeur_these_local;
    if (dto.directeur_these_partenaire !== undefined) data.directeur_these_partenaire = dto.directeur_these_partenaire;
    if (dto.type) data.type = dto.type;
    if (dto.date_debut) data.date_debut = new Date(dto.date_debut);
    if (dto.date_prevue_soutenance !== undefined) {
      data.date_prevue_soutenance = dto.date_prevue_soutenance ? new Date(dto.date_prevue_soutenance) : null;
    }
    if (dto.financement_bourse !== undefined) data.financement_bourse = dto.financement_bourse;
    if (dto.mobilite_realisee !== undefined) data.mobilite_realisee = dto.mobilite_realisee;
    if (dto.publications_produites !== undefined) data.publications_produites = dto.publications_produites;
    if (dto.etat_avancement !== undefined) data.etat_avancement = dto.etat_avancement;
    if (dto.difficultes_rencontrees !== undefined) data.difficultes_rencontrees = dto.difficultes_rencontrees;
    if (dto.perspectives !== undefined) data.perspectives = dto.perspectives;
    if (dto.etablissement_id) data.etablissement_id = dto.etablissement_id;
    if (dto.partenaire_id) data.partenaire_id = dto.partenaire_id;
    if (dto.convention_id !== undefined) data.convention_id = dto.convention_id;

    const updated = await this.prisma.cotutelleThese.update({
      where: { id },
      data,
    });

    return this.mapToResponse(updated);
  }

  async archiver(id: string): Promise<CotutelleResponseDto> {
    await this.findOne(id);

    const archived = await this.prisma.cotutelleThese.update({
      where: { id },
      data: { archive: true },
    });

    return this.mapToResponse(archived);
  }

  private mapToResponse(data: any): CotutelleResponseDto {
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