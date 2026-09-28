import { Controller, HttpCode, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CleanupService, ResultatNettoyage } from './cleanup.service';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('Maintenance')
@ApiBearerAuth()
@Controller('maintenance')
export class CleanupController {
  constructor(private cleanupService: CleanupService) {}

  @Post('nettoyage')
  @HttpCode(200)
  @Roles(Role.PRESIDENCE)
  @ApiOperation({
    summary: 'Declencher manuellement le nettoyage des fichiers orphelins (Presidence uniquement)',
  })
  @ApiResponse({ status: 200, description: 'Rapport de nettoyage' })
  async nettoyage(): Promise<ResultatNettoyage> {
    return this.cleanupService.nettoyerFichiersOrphelins();
  }
}