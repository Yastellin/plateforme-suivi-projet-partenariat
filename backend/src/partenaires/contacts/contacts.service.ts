import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Contact } from '../entities/contact.entity';
import { Partenaire } from '../entities/partenaire.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Partenaire)
    private partenaireRepo: Repository<Partenaire>,
  ) {}

  async create(partenaireId: string, dto: CreateContactDto) {
    const partenaire = await this.partenaireRepo.findOne({
      where: { id: partenaireId, archive: false },
    });
    if (!partenaire) throw new NotFoundException('Partenaire non trouve');

    const contact = this.contactRepo.create({
      nom: dto.nom,
      fonction: dto.fonction ?? null,
      email: dto.email ?? null,
      telephone: dto.telephone ?? null,
      partenaire_id: partenaireId,
    });
    return this.contactRepo.save(contact);
  }

  async update(id: string, dto: UpdateContactDto) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact non trouve');

    Object.assign(contact, dto);
    return this.contactRepo.save(contact);
  }

  async remove(id: string) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (!contact) throw new NotFoundException('Contact non trouve');

    await this.contactRepo.delete(id);
    return { message: 'Contact supprime' };
  }

  async findAllByPartenaire(partenaireId: string) {
    return this.contactRepo.find({
      where: { partenaire_id: partenaireId },
      order: { nom: 'ASC' },
    });
  }
}