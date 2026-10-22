import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Not, Repository } from 'typeorm';
import { CreatePorteurDto } from './dto/create-porteur.dto';
import { UpdatePorteurDto } from './dto/update-porteur.dto';
import { Porteur } from './entities/porteur.entity';
import { Etablissement } from '../../etablissements/entities/etablissement.entity';
import { TypePorteur } from '../../common/enums/type-porteur.enum';

@Injectable()
export class PorteursService {
  constructor(
    @InjectRepository(Porteur)
    private porteurRepo: Repository<Porteur>,
    @InjectRepository(Etablissement)
    private etablissementRepo: Repository<Etablissement>,
  ) {}

  async create(dto: CreatePorteurDto): Promise<Porteur> {
    await this.validerCommande(dto);
    await this.verifierDoublon(dto);

    const porteur = this.porteurRepo.create({
      type_porteur: dto.type_porteur,
      nom: dto.type_porteur === TypePorteur.ETABLISSEMENT ? null : dto.nom!.trim(),
      institution_rattachement: dto.institution_rattachement?.trim() || null,
      etablissement_id:
        dto.type_porteur === TypePorteur.ETABLISSEMENT
          ? (dto.etablissement_id ?? null)
          : null,
    });
    return this.porteurRepo.save(porteur);
  }

  async findAll(nom?: string): Promise<Porteur[]> {
    const query = this.porteurRepo
      .createQueryBuilder('porteur')
      .leftJoinAndSelect('porteur.etablissement', 'etablissement')
      .orderBy('COALESCE(etablissement.nom, porteur.nom)', 'ASC');
    if (nom) {
      query.andWhere(
        '(porteur.nom ILIKE :nom OR etablissement.nom ILIKE :nom)',
        { nom: `%${nom}%` },
      );
    }
    return query.getMany();
  }

  async findOne(id: string): Promise<Porteur> {
    const porteur = await this.porteurRepo.findOne({
      where: { id },
      relations: { etablissement: true },
    });
    if (!porteur) throw new NotFoundException('Porteur non trouvé');
    return porteur;
  }

  async update(id: string, dto: UpdatePorteurDto): Promise<Porteur> {
    const courant = await this.findOne(id);
    const commande: CreatePorteurDto = {
      type_porteur: dto.type_porteur ?? courant.type_porteur,
      nom: dto.nom ?? courant.nom ?? undefined,
      institution_rattachement:
        dto.institution_rattachement ?? courant.institution_rattachement ?? undefined,
      etablissement_id: dto.etablissement_id ?? courant.etablissement_id ?? undefined,
    };
    await this.validerCommande(commande);
    await this.verifierDoublon(commande, id);

    await this.porteurRepo.update(id, {
      type_porteur: commande.type_porteur,
      nom:
        commande.type_porteur === TypePorteur.ETABLISSEMENT
          ? null
          : commande.nom!.trim(),
      institution_rattachement: commande.institution_rattachement?.trim() || null,
      etablissement_id:
        commande.type_porteur === TypePorteur.ETABLISSEMENT
          ? (commande.etablissement_id ?? null)
          : null,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.porteurRepo.delete(id);
    return { message: 'Porteur supprimé' };
  }

  private async validerCommande(dto: CreatePorteurDto): Promise<void> {
    if (dto.type_porteur === TypePorteur.ETABLISSEMENT) {
      if (!dto.etablissement_id) {
        throw new BadRequestException('Sélectionnez un établissement porteur');
      }
      const existe = await this.etablissementRepo.existsBy({ id: dto.etablissement_id });
      if (!existe) throw new NotFoundException('Établissement porteur non trouvé');
      return;
    }
    if (!dto.nom?.trim()) throw new BadRequestException('Le nom du porteur est requis');
  }

  private async verifierDoublon(dto: CreatePorteurDto, idExclu?: string): Promise<void> {
    if (dto.type_porteur === TypePorteur.ETABLISSEMENT) {
      const existant = await this.porteurRepo.findOne({
        where: {
          etablissement_id: dto.etablissement_id,
          ...(idExclu ? { id: Not(idExclu) } : {}),
        },
      });
      if (existant) throw new ConflictException('Cet établissement est déjà enregistré comme porteur');
      return;
    }

    const existant = await this.porteurRepo.findOne({
      where: {
        nom: ILike(dto.nom!.trim()),
        type_porteur: dto.type_porteur,
        ...(idExclu ? { id: Not(idExclu) } : {}),
      },
    });
    if (existant) {
      throw new ConflictException(`Un porteur nommé « ${dto.nom!.trim()} » existe déjà`);
    }
  }
}
