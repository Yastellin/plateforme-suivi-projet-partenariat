import { Module } from '@nestjs/common';
import { CotutellesController } from './cotutelles.controller';
import { CotutellesService } from './cotutelles.service';

@Module({
  controllers: [CotutellesController],
  providers: [CotutellesService],
  exports: [CotutellesService],
})
export class CotutellesModule {}