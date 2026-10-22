import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from '../entities/contact.entity';
import { Partenaire } from '../entities/partenaire.entity';
import { CoordonneesService } from '../../coordonnees/coordonnees.service';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
    private dataSource: DataSource,
    private coordonnees: CoordonneesService,
  ) {}

  async create(
    partenaireId: string,
    dto: CreateContactDto,
    etablissementId?: string,
  ) {
    const partenaire = await this.partenaireRepo.findOne({
      where: {
        id: partenaireId,
        archive: false,
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
    });
    if (!partenaire) throw new NotFoundException('Partenaire non trouvé');
    if (
      etablissementId &&
      partenaire.cree_par_role !== Role.ETABLISSEMENT
    ) {
      throw new ForbiddenException(
        'Un établissement ne peut modifier que les partenaires qu’il a créés.',
      );
    }
    if (etablissementId && partenaire.soumis_le) {
      throw new ConflictException(
        "Les contacts d'un partenaire déjà soumis ne peuvent plus être modifiés par l'établissement.",
      );
    }

    const id = await this.dataSource.transaction(async (manager) => {
      const repo = manager.getRepository(Contact);
      const email = dto.email?.trim() || dto.emails?.[0]?.trim() || null;
      const telephone = dto.telephone?.trim() || dto.telephones?.[0]?.trim() || null;
      const contact = await repo.save(
        repo.create({
          nom: dto.nom.trim(),
          fonction: dto.fonction?.trim() || null,
          email,
          telephone,
          partenaire_id: partenaireId,
        }),
      );
      await this.coordonnees.synchroniserContact(contact.id, dto, manager);
      return contact.id;
    });

    return this.findOne(id, etablissementId);
  }

  async update(id: string, dto: UpdateContactDto, etablissementId?: string) {
    const contact = await this.trouverEntite(id, etablissementId);
    this.verifierModifiableParEtablissement(contact, etablissementId);
    const existantes = await this.coordonnees.valeursContact(id);
    const emails = dto.emails ?? (dto.email !== undefined ? [] : existantes.emails);
    const telephones = dto.telephones ?? (dto.telephone !== undefined ? [] : existantes.telephones);
    const email = dto.email !== undefined
      ? dto.email?.trim() || emails[0] || null
      : emails[0] ?? contact.email;
    const telephone = dto.telephone !== undefined
      ? dto.telephone?.trim() || telephones[0] || null
      : telephones[0] ?? contact.telephone;

    await this.dataSource.transaction(async (manager) => {
      await this.coordonnees.synchroniserContact(
        id,
        { email, emails, telephone, telephones },
        manager,
      );
      await manager.getRepository(Contact).update(id, {
        nom: dto.nom?.trim(),
        fonction: dto.fonction !== undefined ? dto.fonction?.trim() || null : undefined,
        email,
        telephone,
      });
    });
    return this.findOne(id, etablissementId);
  }

  async remove(id: string, etablissementId?: string) {
    const contact = await this.trouverEntite(id, etablissementId);
    this.verifierModifiableParEtablissement(contact, etablissementId);
    await this.contactRepo.delete(id);
    return { message: 'Contact supprimé' };
  }

  async findAllByPartenaire(partenaireId: string, etablissementId?: string) {
    const partenaire = await this.partenaireRepo.findOne({
      where: {
        id: partenaireId,
        ...(etablissementId ? { etablissement_id: etablissementId } : {}),
      },
    });
    if (!partenaire) throw new NotFoundException('Partenaire non trouvé');
    const contacts = await this.contactRepo.find({
      where: { partenaire_id: partenaireId },
      order: { nom: 'ASC' },
    });
    return Promise.all(contacts.map((contact) => this.enrichir(contact)));
  }

  rechercherDoublon(email?: string, telephone?: string) {
    return this.coordonnees.rechercher(email, telephone);
  }

  private async findOne(id: string, etablissementId?: string) {
    return this.enrichir(await this.trouverEntite(id, etablissementId));
  }

  private async trouverEntite(id: string, etablissementId?: string) {
    const contact = await this.contactRepo.findOne({
      where: {
        id,
        ...(etablissementId
          ? { partenaire: { etablissement_id: etablissementId } }
          : {}),
      },
      relations: { partenaire: true },
    });
    if (!contact) throw new NotFoundException('Contact non trouvé');
    return contact;
  }

  private verifierModifiableParEtablissement(
    contact: Contact,
    etablissementId?: string,
  ): void {
    if (
      etablissementId &&
      contact.partenaire?.cree_par_role !== Role.ETABLISSEMENT
    ) {
      throw new ForbiddenException(
        'Un établissement ne peut modifier que les partenaires qu’il a créés.',
      );
    }
    if (etablissementId && contact.partenaire?.soumis_le) {
      throw new ConflictException(
        "Les contacts d'un partenaire déjà soumis ne peuvent plus être modifiés par l'établissement.",
      );
    }
  }

  private async enrichir(contact: Contact) {
    const valeurs = await this.coordonnees.valeursContact(contact.id);
    return Object.assign(contact, valeurs);
  }
}
