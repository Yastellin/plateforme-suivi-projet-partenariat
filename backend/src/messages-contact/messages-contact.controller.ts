import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';
import {
  MessagesContactService,
  type UtilisateurConnecte,
} from './messages-contact.service';
import { CreateMessageContactDto } from './dto/create-message-contact.dto';
import { QueryMessageContactDto } from './dto/query-message-contact.dto';

// Formulaire public : aucune authentification, limite stricte par IP.
@ApiTags('Espace public')
@Controller('public')
export class ContactPublicController {
  constructor(private readonly service: MessagesContactService) {}

  @Post('contact')
  @Public()
  @HttpCode(201)
  @Throttle({
    default: {
      limit: ['development', 'test'].includes(process.env.NODE_ENV ?? '')
        ? 50
        : 5,
      ttl: 600000,
    },
  })
  @ApiOperation({ summary: 'Envoyer un message via le formulaire de contact' })
  envoyer(@Body() dto: CreateMessageContactDto) {
    return this.service.creer(dto);
  }
}

// Espace interne : messages reçus, filtrés selon le rôle.
@ApiTags('Messages de contact')
@ApiBearerAuth()
@Controller('messages-contact')
export class MessagesContactController {
  constructor(private readonly service: MessagesContactService) {}

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Lister les messages de contact accessibles' })
  findAll(
    @CurrentUser() user: UtilisateurConnecte,
    @Query() query: QueryMessageContactDto,
  ) {
    return this.service.findAll(query, user);
  }

  @Get('non-lus/count')
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Compter les messages non lus' })
  compterNonLus(@CurrentUser() user: UtilisateurConnecte) {
    return this.service.compterNonLus(user);
  }

  @Delete(':id')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Supprimer un message de contact et ses notifications' })
  supprimer(
    @CurrentUser() user: UtilisateurConnecte,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.supprimer(id, user);
  }

  @Patch(':id/lu')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Marquer un message comme lu' })
  marquerLu(
    @CurrentUser() user: UtilisateurConnecte,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.marquerLu(id, user);
  }
}
