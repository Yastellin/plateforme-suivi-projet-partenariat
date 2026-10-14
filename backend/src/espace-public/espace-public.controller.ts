import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EspacePublicService } from './espace-public.service';
import { Public } from '../common/decorators/public.decorator';
import {
  PublicEtablissementQueryDto,
  PublicPartenaireQueryDto,
  PublicPublicationQueryDto,
} from './dto/public-query.dto';
import { ContactPublicDto } from './dto/contact-public.dto';

// Espace public (vitrine) : toutes les routes sont accessibles SANS authentification.
// Elles n'exposent que les donnees marquees publiques cote metier.
@ApiTags('Espace public')
@Controller('public')
export class EspacePublicController {
  constructor(private readonly espacePublicService: EspacePublicService) {}

  @Public()
  @Get('accueil')
  @ApiOperation({ summary: "Donnees agrégées de la page d'accueil publique" })
  @ApiResponse({ status: 200, description: 'Statistiques, publications et mises en avant' })
  accueil() {
    return this.espacePublicService.accueil();
  }

  @Public()
  @Get('etablissements')
  @ApiOperation({ summary: 'Liste publique des établissements' })
  @ApiResponse({ status: 200, description: 'Établissements paginés' })
  etablissements(@Query() query: PublicEtablissementQueryDto) {
    return this.espacePublicService.etablissements(query);
  }

  @Public()
  @Get('partenaires')
  @ApiOperation({ summary: 'Liste publique des partenaires (visibilité PUBLIQUE)' })
  @ApiResponse({ status: 200, description: 'Partenaires paginés' })
  partenaires(@Query() query: PublicPartenaireQueryDto) {
    return this.espacePublicService.partenaires(query);
  }

  @Public()
  @Get('publications')
  @ApiOperation({ summary: 'Liste publique des publications (statut PUBLIEE)' })
  @ApiResponse({ status: 200, description: 'Publications paginées' })
  publications(@Query() query: PublicPublicationQueryDto) {
    return this.espacePublicService.publications(query);
  }

  @Public()
  @Get('publications/:id')
  @ApiOperation({ summary: "Détail public d'une publication" })
  @ApiResponse({ status: 200, description: 'Publication publiée' })
  @ApiResponse({ status: 404, description: 'Publication introuvable ou non publiée' })
  publication(@Param('id', ParseUUIDPipe) id: string) {
    return this.espacePublicService.publication(id);
  }

  @Public()
  @Post('contact')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Envoi du formulaire de contact public' })
  @ApiResponse({ status: 201, description: 'Message enregistré' })
  contact(@Body() dto: ContactPublicDto) {
    return this.espacePublicService.contact(dto);
  }
}

