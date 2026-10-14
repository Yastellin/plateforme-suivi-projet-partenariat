import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreatePorteurDto } from './dto/create-porteur.dto';
import { UpdatePorteurDto } from './dto/update-porteur.dto';
import { PorteurResponseDto } from './dto/porteur-response.dto';
import { Porteur } from './entities/porteur.entity';
import { TypePorteur } from '../../common/enums/type-porteur.enum';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';

@Injectable()
export class PorteursService {
  constructor(
    @InjectRepository(Porteur)
    private porteurRepo: Repository<Porteur>,
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
  ) {}

  // Construit le DTO de reponse. Expose etablissement_nom (relation chargee)
  // pour afficher un porteur de type ETABLISSEMENT qui n'a pas de nom propre.
  private versReponse(porteur: Porteur): PorteurResponseDto {
    return {
      id: porteur.id,
      type_porteur: porteur.type_porteur,
      nom: porteur.nom,
      institution_rattachement: porteur.institution_rattachement,
      etablissement_id: porteur.etablissement_id,
      etablissement_nom: porteur.etablissement?.nom ?? null,
      created_at: porteur.created_at,
      updated_at: porteur.updated_at,
    };
  }

  // Valide l'existence de l'etablissement vise (type ETABLISSEMENT).
  private async validerEtablissement(etablissementId?: string): Promise<void> {
    if (!etablissementId) return;
    const etablissement = await this.etablissementRepo.findOneBy({
      id: etablissementId,
    });
    if (!etablissement) {
      throw new NotFoundException('Etablissement non trouve pour le porteur.');
    }
  }

  async create(dto: CreatePorteurDto): Promise<PorteurResponseDto> {
    await this.validerEtablissement(dto.etablissement_id);

    // Doublon sur le nom (seulement quand un nom est fourni).
    if (dto.nom) {
      const existant = await this.porteurRepo.findOne({
        where: { nom: ILike(dto.nom) },
      });
      if (existant) {
        throw new ConflictException(`Un porteur nomme "${dto.nom}" existe deja.`);
      }
    }

    const porteur = this.porteurRepo.create({
      type_porteur: dto.type_porteur,
      nom: dto.type_porteur === TypePorteur.ETABLISSEMENT ? null : (dto.nom ?? null),
      institution_rattachement: dto.institution_rattachement ?? null,
      etablissement_id:
        dto.type_porteur === TypePorteur.ETABLISSEMENT
          ? (dto.etablissement_id ?? null)
          : null,
    });
    const sauvegarde = await this.porteurRepo.save(porteur);
    return this.versReponse(await this.chargerAvecEtablissement(sauvegarde.id));
  }

  private async chargerAvecEtablissement(id: string): Promise<Porteur> {
    const porteur = await this.porteurRepo.findOne({
      where: { id },
      relations: { etablissement: true },
    });
    if (!porteur) throw new NotFoundException('Porteur non trouve');
    return porteur;
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    nom?: string,
  ): Promise<{
    data: PorteurResponseDto[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const where = nom ? { nom: ILike(`%${nom}%`) } : {};

    const [porteurs, total] = await this.porteurRepo.findAndCount({
      where,
      relations: { etablissement: true },
      // NULLS LAST explicite : les porteurs ETABLISSEMENT (nom nul) sont
      // classes en fin de liste, apres les personnes/autres par ordre alpha.
      order: {
        nom: { direction: 'ASC', nulls: 'LAST' },
        created_at: 'ASC',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: porteurs.map((p) => this.versReponse(p)),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<PorteurResponseDto> {
    return this.versReponse(await this.chargerAvecEtablissement(id));
  }

  async update(
    id: string,
    dto: UpdatePorteurDto,
  ): Promise<PorteurResponseDto> {
    const actuel = await this.chargerAvecEtablissement(id);
    const typeFinal = dto.type_porteur ?? actuel.type_porteur;

    await this.validerEtablissement(dto.etablissement_id);

    if (
      typeFinal === TypePorteur.ETABLISSEMENT &&
      !(dto.etablissement_id ?? actuel.etablissement_id)
    ) {
      throw new BadRequestException(
        'Un porteur de type etablissement doit pointer vers un etablissement.',
      );
    }

    // Doublon sur le nom (seulement si le nom change et reste pertinent).
    const nomFinal =
      typeFinal === TypePorteur.ETABLISSEMENT
        ? null
        : dto.nom !== undefined
          ? dto.nom
          : actuel.nom;
    if (nomFinal && nomFinal !== actuel.nom) {
      const doublon = await this.porteurRepo.findOne({
        where: { nom: ILike(nomFinal) },
      });
      if (doublon && doublon.id !== id) {
        throw new ConflictException(`Un porteur nomme "${nomFinal}" existe deja.`);
      }
    }

    await this.porteurRepo.update(id, {
      type_porteur: typeFinal,
      nom: nomFinal,
      institution_rattachement:
        dto.institution_rattachement !== undefined
          ? dto.institution_rattachement
          : actuel.institution_rattachement,
      etablissement_id:
        typeFinal === TypePorteur.ETABLISSEMENT
          ? (dto.etablissement_id ?? actuel.etablissement_id)
          : null,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.chargerAvecEtablissement(id);

    // Verification des projets associes : a reactiver quand Projet sera migre.
    // Pour l'instant, on se repose sur la contrainte PostgreSQL existante.

    await this.porteurRepo.delete(id);
    return { message: 'Porteur supprime' };
  }
}
