import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(private prisma: PrismaService) {}

  async create(partenaireId: string, dto: CreateContactDto) {
    const partenaire = await this.prisma.partenaire.findUnique({
      where: { id: partenaireId, archive: false },
    });
    if (!partenaire) throw new NotFoundException('Partenaire non trouvé');

    return this.prisma.contact.create({
      data: { ...dto, partenaire_id: partenaireId },
    });
  }

  async update(id: string, dto: UpdateContactDto) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contact non trouvé');

    return this.prisma.contact.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    if (!contact) throw new NotFoundException('Contact non trouvé');

    return this.prisma.contact.delete({ where: { id } });
  }

  async findAllByPartenaire(partenaireId: string) {
    return this.prisma.contact.findMany({
      where: { partenaire_id: partenaireId },
      orderBy: { nom: 'asc' },
    });
  }
}