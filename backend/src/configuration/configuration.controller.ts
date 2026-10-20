// backend/src/configuration/configuration.controller.ts
import {
  Controller,
  Get,
  Post,
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
import { ConfigurationService } from './configuration.service';
import { ConfigurationResponseDto } from './dto/configuration-response.dto';

@ApiTags('Configuration')
@ApiBearerAuth()
@Controller('configuration')
export class ConfigurationController {
  constructor(private configurationService: ConfigurationService) {}

  @Get()
  @Roles(Role.PRESIDENCE, Role.ETABLISSEMENT, Role.DECIDEUR)
  @ApiOperation({ summary: 'Obtenir la configuration (logo de la Presidence)' })
  @ApiResponse({ status: 200, type: ConfigurationResponseDto })
  getConfiguration(@CurrentUser() user: any): Promise<ConfigurationResponseDto> {
    return this.configurationService.getConfiguration().then((c) => ({
      id: c.id,
      cle: c.cle,
      valeur: c.valeur,
      logo_url: c.logo_url,
      created_at: c.created_at,
      updated_at: c.updated_at,
    }));
  }

  @Post('logo')
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
  @ApiOperation({
    summary: 'Televerser le logo de la Presidence (Presidence uniquement)',
  })
  @ApiResponse({ status: 200, type: ConfigurationResponseDto })
  televerserLogoPresidence(
    @CurrentUser() user: any,
    @UploadedFile() fichier: Express.Multer.File,
  ): Promise<ConfigurationResponseDto> {
    return this.configurationService
      .televerserLogoPresidence(fichier, {
        id: user.id,
        email: user.email,
        role: user.role,
      })
      .then((c) => ({
        id: c.id,
        cle: c.cle,
        valeur: c.valeur,
        logo_url: c.logo_url,
        created_at: c.created_at,
        updated_at: c.updated_at,
      }));
  }
}
