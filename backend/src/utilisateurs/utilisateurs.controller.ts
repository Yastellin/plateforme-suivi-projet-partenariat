import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UtilisateursService } from './utilisateurs.service';
import { UpdateMotDePasseDto } from './dto/update-mot-de-passe.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { CreateUtilisateurDto } from './dto/create-utilisateur.dto';
import { UpdateAccesUtilisateurDto } from './dto/update-acces-utilisateur.dto';

@ApiTags('Compte')
@ApiBearerAuth()
@Controller('compte')
export class CompteController {
  constructor(private readonly service: UtilisateursService) {}

  @Get()
  @ApiOperation({ summary: 'Consulter le compte connecté, ses droits et préférences' })
  compte(@CurrentUser() user: any) {
    return this.service.compte(user.id);
  }

  @Patch('mot-de-passe')
  @ApiOperation({ summary: 'Modifier son mot de passe' })
  changerMotDePasse(
    @CurrentUser() user: any,
    @Body() dto: UpdateMotDePasseDto,
  ) {
    return this.service.changerMotDePasse(user.id, dto);
  }

  @Patch('preferences')
  @ApiOperation({ summary: "Modifier ses préférences d'interface" })
  modifierPreferences(
    @CurrentUser() user: any,
    @Body() dto: UpdatePreferencesDto,
  ) {
    return this.service.modifierPreferences(user.id, dto);
  }

  @Post('logo')
  @HttpCode(200)
  @Roles(Role.DECIDEUR)
  @UseInterceptors(
    FileInterceptor('fichier', {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Le logo doit etre une image'), false);
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: 'Téléverser le logo de son compte décideur' })
  televerserLogo(
    @CurrentUser() user: any,
    @UploadedFile() fichier: Express.Multer.File,
  ) {
    return this.service.televerserLogoCompte(user.id, fichier, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Delete('logo')
  @HttpCode(200)
  @Roles(Role.DECIDEUR)
  @ApiOperation({ summary: 'Retirer le logo de son compte décideur' })
  retirerLogo(@CurrentUser() user: any) {
    return this.service.retirerLogoCompte(user.id, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}

@ApiTags('Utilisateurs')
@ApiBearerAuth()
@Controller('utilisateurs')
@Roles(Role.PRESIDENCE)
export class UtilisateursController {
  constructor(private readonly service: UtilisateursService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les comptes et leurs accès (Présidence)' })
  lister() {
    return this.service.lister();
  }

  @Post()
  @ApiOperation({ summary: 'Créer un compte (Présidence)' })
  creer(@CurrentUser() user: any, @Body() dto: CreateUtilisateurDto) {
    return this.service.creer(dto, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Patch(':id/acces')
  @ApiOperation({ summary: "Modifier le rôle, le rattachement ou l'activation" })
  modifierAcces(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccesUtilisateurDto,
  ) {
    return this.service.modifierAcces(id, dto, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
