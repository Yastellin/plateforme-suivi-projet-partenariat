import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { EtablissementsService } from './etablissements.service';
import { EtablissementResponseDto } from './dto/etablissement-response.dto';

@ApiTags('Établissements')
@ApiBearerAuth()
@Controller('etablissements')
export class EtablissementsController {
  constructor(private etablissementsService: EtablissementsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister tous les établissements' })
  @ApiResponse({ status: 200, type: [EtablissementResponseDto] })
  findAll(): Promise<EtablissementResponseDto[]> {
    return this.etablissementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un établissement par ID' })
  @ApiResponse({ status: 200, type: EtablissementResponseDto })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<EtablissementResponseDto> {
    return this.etablissementsService.findOne(id);
  }

  @Post(':id/logo')
  @HttpCode(200)
  @Roles(Role.ETABLISSEMENT)
  @UseInterceptors(
    FileInterceptor('fichier', {
      limits: { fileSize: 2 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(
            new BadRequestException('Le logo doit etre une image'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({ summary: "Téléverser le logo d'un établissement autorisé" })
  @ApiResponse({ status: 200, type: EtablissementResponseDto })
  televerserLogo(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() fichier: Express.Multer.File,
  ) {
    if (user.etablissement_id !== id) {
      throw new ForbiddenException(
        'Vous ne pouvez modifier que le logo de votre établissement.',
      );
    }
    return this.etablissementsService.televerserLogo(id, fichier, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }

  @Delete(':id/logo')
  @HttpCode(200)
  @Roles(Role.ETABLISSEMENT)
  @ApiOperation({ summary: 'Retirer le logo de son établissement' })
  @ApiResponse({ status: 200, type: EtablissementResponseDto })
  retirerLogo(@CurrentUser() user: any, @Param('id', ParseUUIDPipe) id: string) {
    if (user.etablissement_id !== id) {
      throw new ForbiddenException(
        'Vous ne pouvez retirer que le logo de votre établissement.',
      );
    }
    return this.etablissementsService.retirerLogo(id, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
