import { Module } from '@nestjs/common';
import { RechercheController } from './recherche.controller';
import { RechercheService } from './recherche.service';

@Module({
  controllers: [RechercheController],
  providers: [RechercheService],
  exports: [RechercheService],
})
export class RechercheModule {}