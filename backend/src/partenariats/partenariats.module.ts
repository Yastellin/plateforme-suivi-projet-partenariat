import { Module } from '@nestjs/common';
import { PartenariatsController } from './partenariats.controller';
import { PartenariatsService } from './partenariats.service';

@Module({
  controllers: [PartenariatsController],
  providers: [PartenariatsService],
  exports: [PartenariatsService],
})
export class PartenariatsModule {}