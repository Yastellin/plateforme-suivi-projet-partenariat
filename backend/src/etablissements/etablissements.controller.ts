import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpCode,
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
import { QueryEtablissementDto } from './dto/query-etablissement.dto';

@ApiTags('Établissements')
@ApiBearerAuth()
@Controller('etablissements')
export class EtablissementsController {
  constructor(private etablissementsService: EtablissementsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les établissements (paginé)' })
  @ApiResponse({ status: 200, type: [EtablissementResponseDto] })
  findAll(@Query() query: QueryEtablissementDto) {
    const { page, limit, recherche } = query;
    return this.etablissementsService.findAll(page, limit, recherche);
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
  @Roles(Role.PRESIDENCE)
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
  @ApiOperation({ summary: "Televerser le logo d'un etablissement (Presidence)" })
  @ApiResponse({ status: 200, type: EtablissementResponseDto })
  televerserLogo(
    @CurrentUser() user: any,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() fichier: Express.Multer.File,
  ) {
    return this.etablissementsService.televerserLogo(id, fichier, {
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
