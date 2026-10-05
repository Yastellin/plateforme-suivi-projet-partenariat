import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { CreatePartenaireDto } from './dto/create-partenaire.dto';
import { UpdatePartenaireDto } from './dto/update-partenaire.dto';
import { QueryPartenaireDto } from './dto/query-partenaire.dto';
import { Partenaire } from './entities/partenaire.entity';
import { StatutPartenaire } from '../common/enums/statut-partenaire.enum';

@Injectable()
export class PartenairesService {
  constructor(
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
  ) {}

  async create(etablissementId: string, dto: CreatePartenaireDto): Promise<Partenaire> {
    const existant = await this.partenaireRepo.findOne({
      where: { nom: dto.nom, etablissement_id: etablissementId, archive: false },
    });
    if (existant) {
      throw new ConflictException(
        `Un partenaire nomme "${dto.nom}" existe deja pour cet etablissement.`,
      );
    }

    const partenaire = new Partenaire();
    partenaire.nom = dto.nom;
    partenaire.type = dto.type;
    partenaire.pays = dto.pays;
    partenaire.adresse = dto.adresse ?? null;
    partenaire.telephone = dto.telephone ?? null;
    partenaire.email = dto.email ?? null;
    partenaire.site_web = dto.site_web ?? null;
    partenaire.description = dto.description ?? null;
    partenaire.statut = dto.statut || StatutPartenaire.ACTIF;
    partenaire.visibilite = (dto.visibilite || 'PRIVE') as any;
    partenaire.est_strategique = dto.est_strategique || false;
    partenaire.etablissement_id = etablissementId;

    return await this.partenaireRepo.save(partenaire);
  }

  async findAll(query: QueryPartenaireDto, etablissementId?: string) {
    const { page = 1, limit = 20, nom, type, pays, statut, visibilite } = query;

    const where: any = { archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;
    if (nom) where.nom = ILike(`%${nom}%`);
    if (type) where.type = ILike(`%${type}%`);
    if (pays) where.pays = ILike(`%${pays}%`);
    if (statut) where.statut = statut;
    if (visibilite) where.visibilite = visibilite;

    const [data, total] = await this.partenaireRepo.findAndCount({
      where,
      relations: { contacts: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { nom: 'ASC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, etablissementId?: string) {
    const where: any = { id, archive: false };
    if (etablissementId) where.etablissement_id = etablissementId;

    const partenaire = await this.partenaireRepo.findOne({
      where,
      relations: { contacts: true },
    });

    if (!partenaire) throw new NotFoundException('Partenaire non trouve');
    return partenaire;
  }

  async update(id: string, dto: UpdatePartenaireDto, etablissementId?: string) {
    await this.findOne(id, etablissementId);

    const { etablissement_id, ...data } = dto;

    if (data.nom) {
      const existant = await this.partenaireRepo.findOne({
        where: {
          nom: data.nom,
          etablissement_id: etablissementId,
          id: Not(id),
          archive: false,
        },
      });
      if (existant) {
        throw new ConflictException(`Un partenaire nomme "${data.nom}" existe deja.`);
      }
    }

    await this.partenaireRepo.update(id, data as any);
    return this.findOne(id, etablissementId);
  }

  async archiver(id: string) {
    const partenaire = await this.partenaireRepo.findOne({
      where: { id, archive: false },
    });
    if (!partenaire) throw new NotFoundException('Partenaire non trouve');

    // Verifications des associations : on les laisse au niveau base (FK)
    // tant que Projet et Partenariat ne sont pas migres.

    await this.partenaireRepo.update(id, { archive: true });
    return this.partenaireRepo.findOne({ where: { id } });
  }

  async rechercherDoublon(nom: string, etablissementId: string) {
    return this.partenaireRepo.findOne({
      where: { nom: ILike(nom), etablissement_id: etablissementId, archive: false },
      relations: { contacts: true },
    });
  }
}