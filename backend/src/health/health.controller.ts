import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private healthService: HealthService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifier que le serveur et ses dependances sont operationnels' })
  @ApiResponse({ status: 200, description: 'Le serveur et la base de donnees repondent' })
  @ApiResponse({ status: 503, description: 'Une dependance est indisponible' })
  async check() {
    return this.healthService.check();
  }
}