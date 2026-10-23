import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ContactsService } from './contacts.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { OwnEtablissementGuard } from '../../common/guards/own-etablissement.guard';

function etablissementDuCompte(user: any): string | undefined {
  return user.role === Role.ETABLISSEMENT ? user.etablissement_id : undefined;
}

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
    @CurrentUser() user: any,
    @Param('partenaireId', ParseUUIDPipe) partenaireId: string,
    @Body() dto: CreateContactDto,
  ) {
    return this.contactsService.create(
      partenaireId,
      dto,
      etablissementDuCompte(user),
    );
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Mettre à jour un contact' })
  update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, dto, etablissementDuCompte(user));
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Supprimer un contact' })
  remove(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contactsService.remove(id, etablissementDuCompte(user));
  }
}

@ApiTags('Contacts')
@ApiBearerAuth()
@Controller('contacts')
export class ContactsDirectController {
  constructor(private contactsService: ContactsService) {}

  @Get('recherche-doublon')
  @ApiOperation({ summary: "Vérifier l'attribution globale d'un e-mail ou téléphone" })
  rechercherDoublon(
    @Query('email') email?: string,
    @Query('telephone') telephone?: string,
  ) {
    if (!email?.trim() && !telephone?.trim()) {
      throw new BadRequestException('Indiquez un e-mail ou un numéro de téléphone.');
    }
    return this.contactsService.rechercherDoublon(email, telephone);
  }

  @Patch(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Mettre à jour un contact' })
  update(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateContactDto,
  ) {
    return this.contactsService.update(id, dto, etablissementDuCompte(user));
  }

  @Delete(':id')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Supprimer un contact' })
  remove(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.contactsService.remove(id, etablissementDuCompte(user));
  }
}
