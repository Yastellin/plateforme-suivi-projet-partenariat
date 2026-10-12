import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { OwnEtablissementGuard } from '../../common/guards/own-etablissement.guard';

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('partenaires/:partenaireId/contacts')
@UseGuards(OwnEtablissementGuard)
export class ContactsController {
  constructor(private contactsService: ContactsService) {}

  @Post()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Ajouter un contact à un partenaire' })
  create(
    @Param('partenaireId', ParseUUIDPipe) partenaireId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(partenaireId, dto);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Mettre à jour un contact' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Supprimer un contact' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.remove(id);
  }
}

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsDirectController {
  constructor(private contactsService: ContactsService) {}

  @Patch(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Mettre à jour un contact' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Supprimer un contact' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contactsService.remove(id);
  }
}
