import { Module } from '@nestjs/common';
import { ProjetsController } from './projets.controller';
import { ProjetsService } from './projets.service';
import { AvancementService } from './avancement.service';

@Module({
  controllers: [ProjetsController],
  providers: [ProjetsService, AvancementService],
  exports: [ProjetsService, AvancementService],
})
export class ProjetsModule {}